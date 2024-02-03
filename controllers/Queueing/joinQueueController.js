const SalonQueueList = require("../../models/salonQueueListModel");
const JoinedQueueHistory = require("../../models/joinedQueueHistoryModel");
const Barber = require("../../models/barberRegisterModel");
const { sendQueuePositionChangedEmail } = require("../../utils/emailSender");
const { sendSms } = require("../../utils/mobileMessageSender");


//Single Join queue api
const singleJoinQueue = async (req, res, next) => {
  try {
    const { salonId, name, customerEmail, joinedQType,mobileNumber, methodUsed, barberName, barberId, services } = req.body;

    let totalServiceEWT = 0;
    let serviceIds = "";
    let serviceNames = "";

    //Code for storing the services names and serviceIds and calculating the ServiceEWT
    for (const service of services) {
      totalServiceEWT += service.barberServiceEWT || service.serviceEWT;
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
      { salonId: salonId, barberId: barberId, isOnline: true },
      { $inc: { barberEWT: totalServiceEWT, queueCount: 1 } }, //  barberWorking.barberEWT + serviceEWT;
      { new: true }
    );

    if (!updatedBarber) {
      res.status(400).json({
        success: false,
        message: "The Barber Is not online",
      });
    }


    //Match the Barber from the BarberWorking and update the queuePosition and customerEWT in the joinqueue table
    const existingQueue = await SalonQueueList.findOne({ salonId: salonId });

    const newQueue = {
      customerName: name,
      customerEmail,
      joinedQ: true,
      joinedQType: joinedQType,
      qPosition: updatedBarber.queueCount,
      dateJoinedQ: new Date(),
      timeJoinedQ: new Date().toLocaleTimeString(),
      methodUsed,
      barberName,
      mobileNumber,
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
    console.log(error);
    next(error);
  }
}

//Group Join Queue api
const groupJoinQueue = async (req, res, next) => {
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
        totalServiceEWT += service.barberServiceEWT || service.serviceEWT;
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
        { salonId: salonId, barberId: member.barberId, isOnline: true },
        {
          $inc: {
            barberEWT: totalServiceEWT,
            queueCount: 1
          }
        },
        { new: true }
      );

      if (!updatedBarber) {
        res.status(400).json({
          success: false,
          message: "The Barber Is not online",
        });
      }

      // Generate a unique groupJoinCode by combining qPosition and barberId
      const groupJoinCode = `${updatedBarber.queueCount}-${member.barberId}`;

      // Create queue entry data for the group member
      const joinedQData = {
        customerName: member.name,
        customerEmail: member.customerEmail,
        joinedQ: true,
        joinedQType: "Group-Join",
        qPosition: updatedBarber.queueCount,
        barberName: member.barberName,
        mobileNumber: member.mobileNumber,
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
    next(error);
  }
};


//Auto join queue api
const autoJoin = async (req, res, next) => {

  try {
    const { salonId, name, customerEmail, mobileNumber, joinedQType, methodUsed, services } = req.body;
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
      customerName: name,
      customerEmail,
      joinedQ: true,
      joinedQType: joinedQType,
      qPosition: availableBarber.queueCount,
      dateJoinedQ: new Date(),
      timeJoinedQ: new Date().toLocaleTimeString(),
      methodUsed,
      mobileNumber,
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
    next(error);
  }
}

//Get Queue List By SalonId
const getQueueListBySalonId = async (req, res, next) => {

  try {
    const salonId = parseInt(req.query.salonId, 10);
    console.log(salonId)

    //To find the queueList according to salonId and sort it according to qposition
    const getSalon = await SalonQueueList.aggregate([
      {
        $match: { salonId } // Match the document based on salonId
      },
      {
        $unwind: "$queueList" // Deconstruct queueList array
      },
      {
        $sort: {
          "queueList.qPosition": 1 // Sort by qPosition in ascending order (1)
        }
      },
      {
        $group: {
          _id: "$_id", // Group by the document's _id field
          queueList: { $push: "$queueList" } // Reconstruct the queueList array
        }
      },
      //Changed for frontend 
      {
        $project: {
          queueList: {
            $map: {
              input: "$queueList",
              as: "list",
              in: {
                $mergeObjects: [
                  "$$list",
                  { "name": "$$list.customerName" } // Rename customerName to name
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          "queueList.customerName": 0 // Exclude the customerName field
        }
      }
    ]);

    if (getSalon.length > 0) {
      // Access the sorted queueList array from the result
      const sortedQueueList = getSalon[0].queueList;

      res.status(200).json({
        success: true,
        message: "QList By Salon Id retrieved",
        response: sortedQueueList,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Salon not found",
      });
    }

  }
  catch (error) {
    console.log(error);
    next(error);
  }
}


//Barber Served Queue Api
const barberServedQueue = async (req, res, next) => {
  try {
    const { salonId, barberId, serviceId, _id } = req.body;

    const queue = await SalonQueueList.findOne({ salonId: salonId });
    let currentServiceEWT = 0;
    let updatedQueueList = [];

    if (queue && queue.queueList && queue.queueList.length > 0) {
      for (const element of queue.queueList) {
        if (
          element.qPosition === 1 &&
          element.serviceId === serviceId &&
          element.barberId === barberId &&
          element._id.toString() === _id
        ) {
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
          // Update the status to "served" for the served queue in JoinedQueueHistory
          await JoinedQueueHistory.updateOne(
            { salonId, 'queueList._id': element._id },
            { $set: { 'queueList.$.status': 'served' } }
          );
        } else if (element.barberId === barberId && element._id.toString() !== _id) {
          updatedQueueList.push({
            ...element.toObject(),
            qPosition: element.qPosition > 1 ? element.qPosition - 1 : element.qPosition,
            customerEWT: element.qPosition > 1 ? element.customerEWT - currentServiceEWT : element.customerEWT,
          });
        } else {
          updatedQueueList.push(element);
        }
      }

      if (currentServiceEWT > 0) {
        queue.queueList = updatedQueueList;
        await queue.save();

        const updatedBarber = await Barber.findOneAndUpdate(
          { salonId: salonId, barberId: barberId },
          { $inc: { barberEWT: -currentServiceEWT, queueCount: -1 } },
          { new: true }
        );

        const customers = await SalonQueueList.find({ salonId, "queueList.barberId": barberId }).select('queueList.customerEmail queueList.qPosition');

        if (customers && customers.length > 0) {
          for (const customer of customers) {
            if (customer.queueList && Array.isArray(customer.queueList)) {
              for (const queueItem of customer.queueList) {
                const { customerEmail, qPosition } = queueItem;
                sendQueuePositionChangedEmail(customerEmail, qPosition);
              }
            }
          }
        }

        return res.status(200).json({
          success: true,
          message: 'Customer served from the queue successfully and Mail sent successfully.',
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Queue position is not 1. No service to be served.',
    });
  }catch (error) {
    console.log(error);
    next(error);
  }
};

//Cancel Queue
const cancelQueue = async (req, res, next) => {
  try {
    const { salonId, barberId, _id } = req.body;

    const updatedQueue = await SalonQueueList.findOne({ salonId });

    if (!updatedQueue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found for the given salon ID',
      });
    }

    const canceledQueueIndex = updatedQueue.queueList.findIndex(queue => queue._id.toString() === _id);

    if (canceledQueueIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found with the given _id',
      });
    }

    const canceledServiceEWT = updatedQueue.queueList[canceledQueueIndex].serviceEWT;

    // Remove the canceled queue from the queue list
    const canceledQueue = updatedQueue.queueList.splice(canceledQueueIndex, 1)[0];

    // Decrement qPosition for subsequent queues and adjust customerEWT
    updatedQueue.queueList.forEach(queue => {
      if (queue.qPosition > canceledQueue.qPosition) {
        queue.qPosition -= 1;
        queue.customerEWT -= canceledServiceEWT;
      }
    });

    await updatedQueue.save();

    //Updating the barber
    const updatedBarber = await Barber.findOneAndUpdate(
      { salonId, barberId },
      { $inc: { queueCount: -1, barberEWT: -canceledServiceEWT } },
      { new: true }
    );

    //Adding the cancelled queue to the joinqueuehistory with status cancelled
    let salon = await JoinedQueueHistory.findOne({ salonId });

    if (!salon) {
      salon = new JoinedQueueHistory({
        salonId,
        queueList: [canceledQueue],
      });
    } else {
      salon.queueList.push(canceledQueue);
    }

    await salon.save();

    // Update the status to "cancelled" for the canceled queue in JoinedQueueHistory
    salon = await JoinedQueueHistory.findOneAndUpdate(
      { salonId, 'queueList._id': _id },
      { $set: { 'queueList.$.status': 'cancelled' } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Queue canceled successfully',
      updatedQueueList: updatedQueue.queueList,
    });

  } catch (error) {
    console.log(error);
    next(error);
  }
};

//Get Available barbers for Queue
const getAvailableBarbersForQ = async (req, res, next) => {
  try {
    const { salonId } = req.query;

    //To find the available barbers for the queue
    const availableBarbers = await Barber.find({ salonId, isActive: true, isOnline: true });

    if (!availableBarbers) {
      res.status(201).json({
        success: false,
        message: 'No available Barbers founf at this moment.'
      });
    }
    else {
      res.status(200).json({
        success: true,
        message: 'All Barbers retrieved',
        response: availableBarbers
      });
    }
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}

//To find the Barber with the Multiple ServiceIds
const getBarberByMultipleServiceId = async (req, res, next) => {
  try {
    const { salonId, serviceIds } = req.query; // Assuming serviceIds are passed as query parameters, e.g., /barbers?serviceIds=1,2,3

    if (!serviceIds) {
      return res.status(400).json({ error: 'Service IDs are required' });
    }

    const serviceIdsArray = serviceIds.split(',').map((id) => Number(id)); // Split string into an array of service IDs

    const barbers = await Barber.find({
      salonId,
      isOnline: true,
      isActive: true,
      'barberServices.serviceId': { $all: serviceIdsArray }, // Query barbers with serviceIds present in the serviceIdsArray
    });

    if (!barbers || barbers.length === 0) {
      return res.status(404).json({
        success: false,
        response: 'No barbers found for the provided Services'
      });
    }

    return res.status(200).json({
      success: true,
      message: "Barbers retrieved for the particular Services",
      response: barbers
    });

  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getQlistbyBarberId = async (req, res, next) => {
  try {
    const { salonId, barberId } = req.body;

    const qList = await SalonQueueList.aggregate([
      {
        $match: {
          salonId: salonId
        }
      },
      {
        $unwind: "$queueList"
      },
      {
        $match: {
          "queueList.barberId": barberId
        }
      },
      {
        $group: {
          _id: "$queueList.barberId",
          queueList: { $push: "$queueList" }
        }
      },
      {
        $project: {
          _id: 0,
          queueList: 1
        }
      },
      //Changed for frontend 
      {
        $project: {
          queueList: {
            $map: {
              input: "$queueList",
              as: "list",
              in: {
                $mergeObjects: [
                  "$$list",
                  { "name": "$$list.customerName" } // Rename customerName to name
                ]
              }
            }
          }
        }
      },
      {
        $project: {
          "queueList.customerName": 0 // Exclude the customerName field
        }
      }
    ]);

    if (!qList || qList.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Queue list not found for the specified barber and salon ID',
        queueList: []
      });
    }

    res.status(200).json({
      success: true,
      message: 'Queue list retrieved successfully for the specified barber',
      queueList: qList[0].queueList // Extracting the queue list from the result
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//Get Q history
const getQhistoryByCustomerEmail = async (req, res, next) => {
  try {
    const { customerEmail, salonId } = req.body;

    // Validate if the required fields are present in the request body
    if (!salonId || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters (salonId, customerEmail).',
      });
    }

    const getQHistory = await JoinedQueueHistory.find({
      salonId,
      'queueList.customerEmail': customerEmail,
    });

    res.status(200).json({
      success: true,
      message: 'Successfully retrieved queue history.',
      response: getQHistory,
    });
  }catch (error) {
    console.log(error);
    next(error);
  }
};



const sendQSms = async(req, res, next) => {
  try{
    const {body} = req.body;
   sendSms(body)
    res.status(200).json({
      success:true,
      message: "Sms sent successfully"
    })
  }
  catch (error) {
    console.log(error);
    next(error);
  }
}


module.exports = {
  singleJoinQueue,
  groupJoinQueue,
  getQueueListBySalonId,
  autoJoin,
  barberServedQueue,
  getAvailableBarbersForQ,
  getBarberByMultipleServiceId,
  getQlistbyBarberId,
  cancelQueue,
  sendQSms,
  getQhistoryByCustomerEmail 
}