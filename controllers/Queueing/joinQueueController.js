const BarberWorking = require("../../models/barberWorkingModel");
const SalonQueueList = require("../../models/salonQueueListModel");
const JoinedQueueHistory = require("../../models/joinedQueueHistoryModel");
const Barber = require("../../models/barberRegisterModel")


const singleJoinQueue = async (req, res) => {
  try {
    const { salonId, name, userName, joinedQType, methodUsed, barberName, barberId, serviceId, serviceEWT } = req.body;
    
    // Update the barberEWT and queueCount For the Barber
      const updatedBarber= await Barber.findOneAndUpdate(
        { salonId: salonId, barberId: barberId},
        { $inc: { barberEWT: serviceEWT,  queueCount: 1  }}, //  barberWorking.barberEWT + serviceEWT;
        { new: true }
      );

// Retrieve the service name from the barber's details
  const serviceName = updatedBarber.barberServices.find(service => service.serviceId === serviceId)?.serviceName;

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
        serviceId,
        serviceName,
        customerEWT: updatedBarber.barberEWT - serviceEWT,
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
      error: 'Failed to join queue',

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
     // Update the barberEWT and queueCount For the Barber
     const updatedBarber= await Barber.findOneAndUpdate(
      { salonId: salonId, barberId: member.barberId},
      { $inc: { barberEWT: member.serviceEWT,
                queueCount: 1  }}, //  barberWorking.barberEWT + serviceEWT;
      { new: true }
    );
     // Retrieve the service name from the barber's details
     const serviceName = updatedBarber.barberServices.find(service => service.serviceId === member.serviceId)?.serviceName;

      // Generate a unique groupJoinCode by combining qPosition and barberId
      const groupJoinCode = `${member.qPosition}-${member.barberId}`;

      // Create queue entry data for the group member
      const joinedQData = {
        name: member.name,
        userName: member.userName,
        joinedQ: true,
        joinedQType: "Group-Join",
        qPosition: updatedBarber.queueCount,
        barberName: member.barberName,
        barberId: member.barberId,
        serviceId: member.serviceId,
        serviceName: serviceName,
        barberEWT: member.barberEWT,
        qgCode: groupJoinCode,
        methodUsed: "Admin", // Customize or set the method used as needed
        dateJoinedQ: new Date(),
        timeJoinedQ: new Date().toLocaleTimeString(),
        customerEWT: updatedBarber.barberEWT - member.serviceEWT,
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
      error: "Failed to join group queue",
    });
  }
};


const autoJoin = async (req, res) => {

  try {
    const { salonId, userName, name, joinedQType, methodUsed, serviceId, serviceEWT } = req.body;

    // Query barbers that are online and provide the specified service
    const availableBarber = await Barber.findOneAndUpdate(
      {
        salonId: salonId,
        isOnline: true,
        'barberServices.serviceId': serviceId,
      },
      {
        $inc: { barberEWT: serviceEWT, queueCount: 1 },
      },
      { new: true, sort: { barberEWT: 1 } }
    );
     
    // if no barbers provide the particular service
    if (availableBarber.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No available barbers for this service.',
      });
    }
    // Retrieve the service name from the barber's details
  const serviceName = availableBarber.barberServices.find(service => service.serviceId === serviceId)?.serviceName;
 
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
      barberName:availableBarber.name,
      barberId:availableBarber.barberId,
      serviceId,
      serviceName,
      customerEWT: availableBarber.barberEWT - serviceEWT,
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
      error: 'Failed to join queue',
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
      });
    }

  }
  catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'QList not retrieved',
    });
  }

}

const barberServedQueue = async (req, res) => {
  try {
    
      const { salonId, barberId, serviceId } = req.body; // also mongoID will come from frontend

      // Find the JoinedQueue document that matches the salonId and contains a queue entry with the specified barberId
      const queue = await SalonQueueList.findOne({
        salonId: salonId
      });
      let serviceEWT = 0;
     
      if(queue.length != 0)
      {
      
      queue.queueList.forEach(async(element) => {
      
      if(element.qPosition === 1 && element.serviceId === serviceId && element.barberId=== barberId) // also need to match primary id or any reference to the queueList
       {
      // add this elemet to queue history and remove from this queueList
      const salon = await JoinedQueueHistory.findOne({salonId})
      // const customerdata = {
      //   userName: element.userName,
      //   name: element.name,
      //   joinedQ: element.joinedQ,
      //   joinedQType: element.joinedQType,
      //   timeJoinedQ: element.timeJoinedQ,
      //   dateJoinedQ: element.dateJoinedQ,
      //   barberName: element.barberName,
      //   serviceId: element.serviceId,
      //   methodUsed: element.methodUsed,
      // }

      if(!salon){
        const newSalonHistory = new JoinedQueueHistory({
          salonId,
          queueList: [element]
        })

        await newSalonHistory.save();
      }
      else{
        salon.queueList.push(element)
      }
     
       } 
       else{
     // decremnt the qPosition of every element
      serviceEWT = element.serviceEWT
      element.qPosition -=1;
      element.customerEWT = serviceEWT
       }
        });
        
      }
     
       // Update barber information
       if (serviceEWT > 0) {
        // Find the corresponding barber and decrement qcount and ewt
        const updatedBarber = await Barber.findOneAndUpdate(
          { salonId: salonId, barberId: barberId },
          {
            $inc: { barberEWT: -serviceEWT, queueCount: -1 },
          },
          { new: true }
        );

        res.status(200).json({
          success: true,
          message: 'Customer served from the queue successfully.',
        });
      } else {
        res.status(200).json({
          success: true,
          message: 'No service to be served.',
        });
      }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'There is a problem in the API.',
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