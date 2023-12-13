const SalonQueueList = require("../../models/salonQueueListModel");
const JoinedQueueHistory = require("../../models/joinedQueueHistoryModel");
const Barber = require("../../models/barberRegisterModel")


const singleJoinQueue = async (req, res) => {
  try {
    const { salonId, name, userName, joinedQType, methodUsed, barberName, barberId, services } = req.body;

    let totalServiceEWT = 0;
    let serviceIds = "";
    let serviceNames = "";

    for (const service of services) {
      totalServiceEWT += service.barberServiceEWT;
      if (serviceIds) {
        serviceIds += "-";
      }
      serviceIds += service.serviceId.toString();
      if (serviceNames) {
        serviceNames += ",";
      }
      serviceNames += service.serviceName;
    }
    // Update the barberEWT and queueCount For the Barber
    const updatedBarber = await Barber.findOneAndUpdate(
      { salonId: salonId, barberId: barberId },
      { $inc: { barberEWT: totalServiceEWT, queueCount: 1 } }, //  barberWorking.barberEWT + serviceEWT;
      { new: true }
    );

    //Match the Barber from the BarberWorking and update the queuePosition and customerEWT in the joinqueue table
    const existingQueue = await SalonQueueList.findOne({ salonId: salonId });

    const newQueue = {
      name,
      userName,
      joinedQ: true,
      joinedQType,
      qPosition: updatedBarber.queueCount,
      dateJoinedQ: new Date(),
      timeJoinedQ: new Date().toLocaleTimeString(),
      methodUsed,
      barberName,
      barberId,
      serviceId: serviceIds,
      serviceName: serviceNames,
      serviceEWT: totalServiceEWT,
      customerEWT: updatedBarber.barberEWT - totalServiceEWT,
    }

    if (existingQueue) {
      existingQueue.queueList.push(newQueue);
      await existingQueue.save();
      res.status(200).json({
        success: true,
        message: "Joined Queue",
        response: existingQueue,
      });
    } else {
      const newQueueData = new SalonQueueList({
        salonId: salonId,
        queueList: [newQueue],
      });
      const savedInQueue = await newQueueData.save();
      res.status(200).json({
        success: true,
        message: "Joined Queue",
        response: savedInQueue,
      });
    }
  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to join queue',
      error: error.message

    });
  }
}

const groupJoinQueue = async (req, res) => {
  try {
    const { salonId, groupInfo } = req.body;

    // Initialize existingQueue as null
    let existingQueue = null;

    // Retrieve the existing queue for the salon
    existingQueue = await SalonQueueList.findOne({ salonId: salonId });

    // If no existing queue is found, create a new one
    if (!existingQueue) {
      existingQueue = new SalonQueueList({
        salonId: salonId,
        queueList: [],
      });
      await existingQueue.save();
    }

    // Iterate through each group member
    for (const member of groupInfo) {
      let totalServiceEWT = 0;
      let serviceIds = "";
      let serviceNames = "";

      for (const service of member.services) {
        totalServiceEWT += service.barberServiceEWT;
        if (serviceIds) {
          serviceIds += "-";
        }
        serviceIds += service.serviceId.toString();
        if (serviceNames) {
          serviceNames += ",";
        }
        serviceNames += service.serviceName;
      }

      // Update the barberEWT and queueCount for the Barber
      const updatedBarber = await Barber.findOneAndUpdate(
        { salonId: salonId, barberId: member.barberId },
        {
          $inc: {
            barberEWT: totalServiceEWT,
            queueCount: 1
          }
        },
        { new: true }
      );

      // Generate a unique groupJoinCode by combining qPosition and barberId
      const groupJoinCode = `${updatedBarber.queueCount}-${member.barberId}`;

      // Create queue entry data for the group member
      const joinedQData = {
        name: member.name,
        userName: member.userName,
        joinedQ: true,
        joinedQType: "Group-Join",
        qPosition: updatedBarber.queueCount,
        barberName: member.barberName,
        barberId: member.barberId,
        serviceId: serviceIds,
        serviceName: serviceNames,
        serviceEWT: totalServiceEWT,
        qgCode: groupJoinCode,
        methodUsed: "Admin", // Customize or set the method used as needed
        dateJoinedQ: new Date(),
        timeJoinedQ: new Date().toLocaleTimeString(),
        customerEWT: updatedBarber.barberEWT - totalServiceEWT,
      };

      // Add the queue entry to the existing queue list
      existingQueue.queueList.push(joinedQData);
    }

    // Save the updated salon queue document
    await existingQueue.save();

    res.status(200).json({
      success: true,
      message: "Group Joined Queue",
      response: existingQueue,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to join group queue",
      error: error.message
    });
  }
};


const autoJoin = async (req, res) => {

  try {
    const { salonId, userName, name, joinedQType, methodUsed, services } = req.body;
    const serviceIds = services.map(service => service.serviceId);

    let totalServiceEWT = 0;
    let serviceIds1 = serviceIds.join('-');
    let serviceNames = "";

    for (const service of services) {
      totalServiceEWT += service.barberServiceEWT;
      if (serviceNames) {
        serviceNames += ",";
      }
      serviceNames += service.serviceName;
    }
    // Query barbers that are online and provide the specified service
    const availableBarber = await Barber.findOneAndUpdate(
      {
        salonId: salonId,
        isOnline: true,
        'barberServices.serviceId': { $all: serviceIds },
      },
      {
        $inc: { barberEWT: totalServiceEWT, queueCount: 1 },
      },
      { new: true, sort: { barberEWT: 1 } }
    );

    // if no single barbers provide the multiple services 
    if (!availableBarber) {
      return res.status(400).json({
        success: false,
        message: 'No single barber provide the services.',
      });
    }
    // // Retrieve the service name from the barber's details
    // const serviceName = availableBarber.barberServices.find(service => service.serviceId === serviceId)?.serviceName;

    //Add the customer to the existing queue or new queue for the salon
    const existingQueue = await SalonQueueList.findOne({ salonId: salonId });

    const newQueue = {
      name,
      userName,
      joinedQ: true,
      joinedQType,
      qPosition: availableBarber.queueCount,
      dateJoinedQ: new Date(),
      timeJoinedQ: new Date().toLocaleTimeString(),
      methodUsed,
      barberName: availableBarber.name,
      barberId: availableBarber.barberId,
      serviceId: serviceIds1,
      serviceName: serviceNames,
      serviceEWT: totalServiceEWT,
      customerEWT: availableBarber.barberEWT - totalServiceEWT,
    }

    if (existingQueue) {
      existingQueue.queueList.push(newQueue);
      await existingQueue.save();
      res.status(200).json({
        success: true,
        message: "Joined Queue",
        response: existingQueue,
      });
    } else {
      const newQueueData = new SalonQueueList({
        salonId: salonId,
        queueList: [newQueue],
      });
      const savedInQueue = await newQueueData.save();
      res.status(200).json({
        success: true,
        message: "Joined Queue",
        response: savedInQueue,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Failed to join queue',
      error: error.message
    });
  }
}

const getQueueListBySalonId = async (req, res) => {

  try {
    const { salonId } = req.query;
    console.log(salonId)
    const getSalon = await SalonQueueList.findOne({ salonId })

    if (getSalon) {
      const getQList = getSalon.queueList || [];

      res.status(200).json({
        success: true,
        message: "QList By Salon Id retrieved",
        response: getQList,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Salon not found",
        error: error.message
      });
    }

  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'QList not retrieved',
      error: error.message
    });
  }

}

const barberServedQueue = async (req, res) => {
  try {
    const { salonId, barberId, serviceId, _id } = req.body;
    
    // also mongoID and queue position will come from frontend

    // Find the JoinedQueue document that matches the salonId and contains a queue entry with the specified barberId
    const queue = await SalonQueueList.findOne({
      salonId: salonId
    });
    let currentServiceEWT = 0;

    if (queue.length != 0) {
      const updatedQueueList = [];
      for (const element of queue.queueList) {
        if (
          element.qPosition === 1 &&
          element.serviceId === serviceId &&
          element.barberId === barberId &&
          element._id.toString() === _id
        ) {
          // Do not add the element to updatedQueueList
          // It will be removed from queueList when we update the queue
          // Save the element to JoinedQueueHistory
          currentServiceEWT = element.serviceEWT;
          const salon = await JoinedQueueHistory.findOne({ salonId });
          if (!salon) {
            const newSalonHistory = new JoinedQueueHistory({
              salonId,
              queueList: [element],
            });

            await newSalonHistory.save();
          } else {
            salon.queueList.push(element);
            await salon.save();
          }

        } else if (element.barberId === barberId && element._id.toString() !== _id) {
          // Decrement the qPosition of other elements
          //    serviceEWT = element.serviceEWT;
          element.qPosition -= 1;
          element.customerEWT -= currentServiceEWT;
          updatedQueueList.push(element);
        }
        else {
          // Keep elements with different barberId unchanged
          updatedQueueList.push(element);
        }
      }
      // Update the queue with the modified queueList, removing the element
      queue.queueList = updatedQueueList;
      await queue.save();
    }

    // Update barber information
    if (currentServiceEWT > 0) {
      // Find the corresponding barber and decrement qcount and ewt
      const updatedBarber = await Barber.findOneAndUpdate(
        { salonId: salonId, barberId: barberId },
        {
          $inc: { barberEWT: -currentServiceEWT, queueCount: -1 },
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: 'Customer served from the queue successfully.',
      });
    } else {
      res.status(201).json({
        success: false,
        message: 'No service to be served.',
        error: error.message
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'There is a problem in the API.',
      error: error.message
    });
  }
};


module.exports = {
  singleJoinQueue,
  groupJoinQueue,
  getQueueListBySalonId,
  autoJoin,
  barberServedQueue,
}