const BarberWorking = require("../../models/barberWorkingModel");
const JoinedQueue = require("../../models/joinQueueModel");
const Salon = require("../../models/salonsRegisterModel");
const JoinedQueueHistory = require("../../models/joinedQueueHistoryModel");


const singleJoinQueue = async (req, res) => {
  try {
    const { salonId, name, userName, joinedQType, methodUsed, barberName, barberId, serviceId } = req.body;

    const salon = await Salon.findOne({ salonId })

    const service = salon.services.find((s) => s.serviceId === serviceId);

    const serviceEWT = service.serviceEWT;

    const barber = await BarberWorking.findOne({ salonId, barberId })

    let newBarberEWT = barber.barberEWT + serviceEWT;


    await BarberWorking.findOneAndUpdate(
      { salonId, barberId: barber.barberId },
      { barberEWT: newBarberEWT },
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
      customerEWT: barber.barberEWT,
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
      const salon = await Salon.findOne({ salonId });

      const service = salon.services.find((s) => s.serviceId === member.serviceId);

      const serviceEWT = service.serviceEWT;
      const { barberId } = member;

      const barber = await BarberWorking.findOne({ salonId, barberId });

      let newBarberEWT = barber.barberEWT + serviceEWT;

      await BarberWorking.findOneAndUpdate(
        { salonId, barberId: barber.barberId },
        { barberEWT: newBarberEWT },
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
        customerEWT: barber.barberEWT,
      };

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
    const { salonId, isOnline, userName, name, joinedQType, methodUsed } = req.body

    const salon = await Salon.findOne({ salonId: salonId })

    // console.log("services array", salon.services)
    const serviceId = parseInt(req.body.serviceId, 10);

    const service = salon.services.find((s) => s.serviceId === serviceId);

    const serviceEWT = service.serviceEWT;

    const barbers = await BarberWorking.find({ salonId, isOnline })
    const barbersWithService = barbers.filter((barber) => barber.serviceId.includes(service.serviceId));
    if (barbersWithService.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No barbers available for this service.',
      });
    }

    barbersWithService.sort((a, b) => a.barberEWT - b.barberEWT);

    const assignedBarber = barbersWithService[0];

    let newBarberEWT = assignedBarber.barberEWT + serviceEWT;

    await BarberWorking.findOneAndUpdate(
      { salonId, barberId: assignedBarber.barberId },
      { barberEWT: newBarberEWT },
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
        response: newQueue.queueList
      });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      error: 'Failed to join queue',
    })
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

    const salon = await Salon.findOne({ salonId })

    const service = salon.services.find((s) => s.serviceId === serviceId);

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
        barberId: barberId,
      },
      {
        $inc: { barberEWT: -serviceEWT },
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