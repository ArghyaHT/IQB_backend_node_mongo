const BarberWorking = require("../../models/barberWorkingModel");
const JoinedQueue = require("../../models/joinQueueModel");
const Salon = require("../../models/salonsRegisterModel");


const singleJoinQueue = async (req, res) => {
  try {
    const { salonId, name, userName, joinedQType, methodUsed, barberName, barberId, serviceId } = req.body;

    
    const salon = await Salon.findOne({ salonId, })

    const service = salon.services.find((s) => s.serviceId === serviceId);

    const serviceEWT = service.serviceEWT;

    const barber =  await BarberWorking.findOne({salonId, barberId})

    let newBarberEWT = barber.barberEWT + serviceEWT;


    await BarberWorking.findOneAndUpdate(
      { salonId, barberId: barber.barberId },
      { barberEWT: newBarberEWT },
      { new: true }
    );


    const existingQueue = await JoinedQueue.findOne({ salonId: salonId });

    let nextQPosition = 0;
    if (existingQueue) {
      const barberQueue = existingQueue.queueList.filter((b) => b.barberId === barberId);
      nextQPosition = barberQueue.length + 1;
    }
    // let qPosition = 1;
    const joinedQ = true;
    const currentDate = new Date();
    const currentTime = currentDate.toLocaleTimeString();
    const newQueue = {
      name,
      userName,
      joinedQ: joinedQ,
      joinedQType,
      qPosition: nextQPosition,
      dateJoinedQ: currentDate,
      timeJoinedQ: currentTime,
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

    // const existingQueue = await JoinedQueue.findOne({ salonId: salonId });
    // if (existingQueue) {
    //     if (existingQueue.queueList) {
    //         qPosition = existingQueue.queueList.length + 1;
    //     } else {
    //         existingQueue.queueList = [];
    //     }

    //     newQ.qPosition = qPosition;
    //     existingQueue.queueList.push(newQ);
    //     await existingQueue.save();
    // } else {
    //     const newQueue = new JoinedQueue({
    //         salonId,
    //         queueList: [newQ],
    //     });
    //     await newQueue.save();
    // }

    // res.status(200).json({
    //     success: true,
    //     message: "Joined Queue",
    //     response: newQ,
    // })

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

    const existingQueue = await JoinedQueue.findOne({ salonId: salonId });

    if (!existingQueue) {
      // Create a new JoinedQueue document for the salon if it doesn't exist
      const newQueue = new JoinedQueue({
        salonId: salonId,
        queueList: [],
      });
      await newQueue.save();
    }
    for (const member of groupInfo) {


    const salon = await Salon.findOne({ salonId, })

    const service = salon.services.find((s) => s.serviceId === member.serviceId);

    const serviceEWT = service.serviceEWT;

      const { barberId } = member;
      

    const barber =  await BarberWorking.findOne({salonId, barberId})

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
    const { salonId, isOnline } = req.query;
    const {customerData} = req.body

    const salon = await Salon.findOne({ salonId: salonId })

    // console.log("services array", salon.services)
    const serviceId = parseInt(req.query.serviceId, 10);

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

    let nextQPosition = 0;

    if (existingQueue) {
      const barberQueue = existingQueue.queueList.filter((b) => b.barberId === assignedBarber.barberId);
      nextQPosition = barberQueue.length + 1;
    }

    const joinedQueueData = {
      customerEWT:assignedBarber.barberEWT ,
      userName: customerData.userName,
      name: customerData.name,
      joinedQ: true,
      joinedQType: customerData.joinedQType,
      dateJoinedQ: new Date(),
      timeJoinedQ: new Date().toLocaleTimeString(),
      methodUsed: customerData.methodUsed,
      barberName: assignedBarber.barberName,
      qPosition: nextQPosition,
      barberId: assignedBarber.barberId,
    };

    if (existingQueue) {
      existingQueue.queueList.push(joinedQueueData);
      await existingQueue.save();
    } else {
      const newQueue = new JoinedQueue({
        salonId: salonId,
        queueList: [joinedQueueData],
      });
      await newQueue.save();
    }
    
      res.status(200).json({
      success: true,
      message: 'Joined Queue',
    });
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
try{
const {salonId, barberId, serviceId} = req.params;

const salon = await Salon.findOne(salonId)

const service = salon.services.find((s) => s.serviceId === serviceId);

const serviceEWT = service.serviceEWT;

console.log(serviceEWT)


}
catch (error) {
  console.error(error);
  res.status(500).json({
    success: false,
    error: 'there is a problem in the api',
  });
}

}


module.exports = {
  singleJoinQueue,
  groupJoinQueue,
  getQueueListBySalonId,
  autoJoin,
  barberServedQueue,
}