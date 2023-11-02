const BarberWorking = require("../../models/barberWorkingModel");
const JoinedQueue = require("../../models/joinQueueModel");
const JoinedQueueHistory = require("../../models/joinedQueueHistoryModel");
const Barber = require("../../models/barberRegisterModel")


const singleJoinQueue = async (req, res) => {
  try {
    const { salonId, name, userName, joinedQType, methodUsed, barberName, barberId, serviceId } = req.body;

    const barberService = await Barber.findOne({ salonId })

    const service = barberService.barberServices.find((s) => s.serviceId === serviceId);
    if (!service) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service selected.',
      });
    }
    const serviceEWT = service.serviceEWT;

    console.log(service)

    const barber = await BarberWorking.findOne({
      salonId: salonId,
      'barberWorking.barberId': barberId,
    });

    if (barber) {
      const foundBarber = barber.barberWorking.find(barber => barber.barberId === barberId);
      let newBarberEWT = foundBarber.barberEWT + serviceEWT;

      //  Update the barber's EWT
      await BarberWorking.findOneAndUpdate(
        { 'barberWorking.barberId': barberId },
        { $set: { 'barberWorking.$.barberEWT': newBarberEWT } },
        { new: true }
      );

      const existingQueue = await JoinedQueue.findOne({ salonId: salonId });

      let nextQPosition = 1;
      if (existingQueue) {
        const barberQueue = existingQueue.queueList.filter((b) => b.barberId === barberId);
        nextQPosition = barberQueue.length + 1;
      }
      const newQueue = {
        name,
        userName,
        joinedQ: true,
        joinedQType,
        qPosition: nextQPosition,
        dateJoinedQ: new Date(),
        timeJoinedQ: new Date().toLocaleTimeString(),
        methodUsed,
        barberName,
        barberId,
        serviceId,
        customerEWT: foundBarber.barberEWT,
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
        const newQueueData = new JoinedQueue({
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
    } else {
      console.log('No matching document found.');
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

    if (!groupInfo || groupInfo.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid group join data",
      });
    }

    let existingQueue = await JoinedQueue.findOne({ salonId: salonId });

    if (!existingQueue) {
      // Create a new JoinedQueue document for the salon if it doesn't exist
      existingQueue = new JoinedQueue({
        salonId: salonId,
        queueList: [],
      });
      await existingQueue.save();
    }

    for (const member of groupInfo) {
      const barberService = await Barber.findOne({ salonId });

      const service = barberService.barberServices.find((s) => s.serviceId === member.serviceId);

      const serviceEWT = service.serviceEWT;
      const { barberId } = member;

      const barber = await BarberWorking.findOne({
        salonId: salonId,
        'barberWorking.barberId': barberId,
      })
      if (barber) {
        const foundBarber = barber.barberWorking.find(barber => barber.barberId === barberId);
        let newBarberEWT = foundBarber.barberEWT + serviceEWT;

        await BarberWorking.findOneAndUpdate(
          { 'barberWorking.barberId': barberId },
          { $set: { 'barberWorking.$.barberEWT': newBarberEWT } },
          { new: true }
        );

        // Calculate the qPosition based on the existing queue list
        const barberQueue = existingQueue.queueList.filter((customer) => customer.barberId === barberId);
        const nextQPosition = barberQueue.length + 1;
        const joinedQData = {
          name: member.name,
          userName: member.userName,
          joinedQ: true,
          joinedQType: "Group-Join",
          qPosition: nextQPosition,
          barberName: member.barberName,
          barberId: member.barberId,
          serviceId: member.serviceId,
          barberEWT: member.barberEWT,
          methodUsed: "Admin", // Customize or set the method used as needed
          dateJoinedQ: new Date(),
          timeJoinedQ: new Date().toLocaleTimeString(),
          customerEWT: foundBarber.barberEWT,
        };

        existingQueue.queueList.push(joinedQData);
      }
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
    const { salonId, isOnline, userName, name, joinedQType, methodUsed, serviceId } = req.body;

    const barberList = await BarberWorking.findOne({ salonId: salonId });

    const matchingBarbers = []
    barberList.barberWorking.forEach(barber => {
      if (barber.isOnline === isOnline && barber.serviceId.includes(serviceId)) {
        matchingBarbers.push(barber)
      }
    });

    if (matchingBarbers.length > 0) {
      // Find the barber with the lowest barberEWT
      const assignedBarber = matchingBarbers.reduce((minBarber, barber) => {
        return barber.barberEWT < minBarber.barberEWT ? barber : minBarber;
      });

      const barberService = await Barber.findOne({ salonId })

      const service = barberService.barberServices.find((s) => s.serviceId === serviceId);

      const serviceEWT = service.serviceEWT;

      const newBarberEWT = assignedBarber.barberEWT + serviceEWT;

      await BarberWorking.findOneAndUpdate(
        { salonId, "barberWorking.barberId": assignedBarber.barberId },
        { $set: { "barberWorking.$.barberEWT": newBarberEWT } },
        { new: true }
      );
      const existingQueue = await JoinedQueue.findOne({ salonId });

      let nextQPosition = 1;
      if (existingQueue) {
        const barberQueue = existingQueue.queueList.filter((b) => b.barberId === assignedBarber.barberId);
        nextQPosition = barberQueue.length + 1;
      }
      const joinedQueueData = {
        customerEWT: assignedBarber.barberEWT,
        userName,
        name,
        joinedQ: true,
        joinedQType,
        dateJoinedQ: new Date(),
        timeJoinedQ: new Date().toLocaleTimeString(),
        methodUsed,
        serviceId,
        barberName: assignedBarber.barberName,
        qPosition: nextQPosition,
        barberId: assignedBarber.barberId,
      };

      if (existingQueue) {
        existingQueue.queueList.push(joinedQueueData);
        await existingQueue.save();
        res.status(200).json({
          success: true,
          message: 'Joined Queue',
          queueList: existingQueue.queueList, // Include the queueList in the response
        });
      } else {
        const newQueue = new JoinedQueue({
          salonId: salonId,
          queueList: [joinedQueueData],
        });

        await newQueue.save();

        res.status(200).json({
          success: true,
          message: 'Joined Queue',
          response: newQueue.queueList,
        });
      }
    }
    else {
      res.status(404).json({
        message: 'No Barber Found',
      });
    }








    // barberList.forEach((barber) => {
    //   const firstbarberWorking = barber.barberWorking;

    //   // Sort the barberWorking array for each barber in ascending order based on barberEWT
    //   firstbarberWorking.sort((a, b) => a.barberEWT - b.barberEWT);

    //  const assignedBarber = firstbarberWorking[0];
    //  console.log(assignedBarber)
    // });







    // // Retrieve barbers who provide the specified service
    // const barber = await Barber.find({ salonId: salonId, 'barberServices.serviceId': serviceId });

    // if (barber.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid service selected.',
    //   });
    // }

    // const providedService = barber.barberServices.find((s) => s.serviceId === serviceId);
    // if (!providedService) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Invalid service selected.',
    //   });
    // }

    // const serviceEWT = providedService.serviceEWT;

    // // Find barbers in the salon, who are online and provide the specified service
    // const barbers = await BarberWorking.find({
    //   salonId,
    //   "barberWorking.isOnline": isOnline,
    //   "barberWorking.serviceId": serviceId,
    // });

    // if (barbers.length === 0) {
    //   return res.status(200).json({
    //     success: true,
    //     message: 'No barbers available for this service.',
    //   });
    // }

    // // Sort barbers within the salon by their barberEWT in ascending order
    // barbers.sort((a, b) => a.barberWorking[0].barberEWT - b.barberWorking[0].barberEWT);

    // const assignedBarber = barbers[0];

    // const newBarberEWT = assignedBarber.barberWorking[0].barberEWT + serviceEWT;
    // assignedBarber.barberWorking[0].barberEWT = newBarberEWT;

    // await BarberWorking.findOneAndUpdate(
    //   { salonId, "barberWorking.barberId": assignedBarber.barberWorking[0].barberId },
    //   { $set: { "barberWorking.$.barberEWT": newBarberEWT } },
    //   { new: true }
    // );

    // const existingQueue = await JoinedQueue.findOne({ salonId });

    // let nextQPosition = 1;

    // if (existingQueue) {
    //   const barberQueue = existingQueue.queueList.filter((b) => b.barberId === assignedBarber.barberWorking[0].barberId);
    //   nextQPosition = barberQueue.length + 1;
    // }

    // const joinedQueueData = {
    //   customerEWT: assignedBarber.barberWorking[0].barberEWT,
    //   userName,
    //   name,
    //   joinedQ: true,
    //   joinedQType,
    //   dateJoinedQ: new Date(),
    //   timeJoinedQ: new Date().toLocaleTimeString(),
    //   methodUsed,
    //   serviceId,
    //   barberName: assignedBarber.barberWorking[0].barberName,
    //   qPosition: nextQPosition,
    //   barberId: assignedBarber.barberWorking[0].barberId,
    // };

    // if (existingQueue) {
    //   existingQueue.queueList.push(joinedQueueData);
    //   await existingQueue.save();
    //   res.status(200).json({
    //     success: true,
    //     message: 'Joined Queue',
    //     queueList: existingQueue.queueList, // Include the queueList in the response
    //   });
    // } else {
    //   const newQueue = new JoinedQueue({
    //     salonId: salonId,
    //     queueList: [joinedQueueData],
    //   });

    //   await newQueue.save();

    //   res.status(200).json({
    //     success: true,
    //     message: 'Joined Queue',
    //     response: newQueue.queueList,
    //   });
    // }
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
    const getSalon = await JoinedQueue.findOne({ salonId })

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
    const { salonId, barberId, serviceId } = req.body;

    const barberService = await Barber.findOne({ salonId })

    const service = barberService.barberServices.find((s) => s.serviceId === serviceId);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found with the specified serviceId.',
      });
    }

    const serviceEWT = service.serviceEWT;

    const existingQueue = await JoinedQueue.findOne({ salonId: salonId });

    if (!existingQueue) {
      return res.status(404).json({
        success: false,
        error: 'Queue not found for this salon.',
      });
    }

    // Filter out the customer who is served by the barber
    const customerIndex = existingQueue.queueList.findIndex(
      (customer) => customer.barberId === barberId
    );

    if (customerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found in the queue.',
      });
    }

    const servedCustomer = existingQueue.queueList[customerIndex];

    const remainingCustomers = existingQueue.queueList
      .slice(customerIndex + 1)
      .filter((customer) => customer.barberId === barberId);

    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString();

    for (const customer of remainingCustomers) {
      customer.customerEWT = customer.customerEWT - serviceEWT;
      customer.timeJoinedQ = currentTime;
      customer.qPosition = customer.qPosition - 1;
    }

    const removedCustomerData = {
      name: servedCustomer.name,
      userName: servedCustomer.userName,
      joinedQType: servedCustomer.joinedQType,
      dateJoinedQ: servedCustomer.dateJoinedQ,
      timeJoinedQ: servedCustomer.timeJoinedQ,
      methodUsed: servedCustomer.methodUsed,
      barberName: servedCustomer.barberName,
      barberId: servedCustomer.barberId,
      serviceId: servedCustomer.serviceId,
      customerEWT: servedCustomer.customerEWT,
    };

    const existingJoinQueueHistory = await JoinedQueueHistory.findOne({ salonId: salonId });

    if (existingJoinQueueHistory) {
      existingJoinQueueHistory.queueList.push(removedCustomerData);
      await existingJoinQueueHistory.save();
    } else {
      const joinQueueHistoryData = new JoinedQueueHistory({
        salonId,
        queueList: [removedCustomerData],
      });
      await joinQueueHistoryData.save();
    }

    existingQueue.queueList.splice(customerIndex, 1);

    await existingQueue.save();

    await BarberWorking.updateOne(
      {
        salonId: salonId,
        "barberWorking.barberId": barberId,
      },
      {
        $inc: { "barberWorking.$.barberEWT": -serviceEWT },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Customer served and removed from the queue.',
      servedCustomer,
      remainingQueue: existingQueue.queueList,
    });
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