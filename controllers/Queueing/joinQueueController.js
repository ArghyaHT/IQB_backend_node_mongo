const JoinedQueue = require("../../models/joinQueueModel")


const singleJoinQueue = async(req, res) => {
    try{
        const {salonId, name, userName, joinedQType, methodUsed, barberName, barberId, serviceId, barberEWT} =req.body;

            const qPosition = await JoinedQueue.countDocuments() + 1;
            const joinedQ = true;
            const currentDate = new Date();
            const currentTime = currentDate.toLocaleTimeString();
            const q = new JoinedQueue({
                salonId,
                name,
                userName,
                joinedQ: joinedQ,
                joinedQType,
                qPosition: qPosition,
                dateJoinedQ: currentDate,
                timeJoinedQ: currentTime,
                methodUsed,
                barberName,
                barberId,
                serviceId,
                barberEWT,
            })

            const qjoined = await q.save();

            res.status(200).json({
                success: true,
                message: "Joined Queue",
                response: qjoined,
            })

            if(!qjoined){
                res.status(404).json({
                    success: true,
                    message: "You have not Joined the Queue",
                })
            }
    }
    catch(error){
        console.error(error);
        res.status(500).json({
          success: false,
          error: 'Failed to join queue',
    
        });
    }

}


const groupJoinQueue =  async(req, res) =>{
    try {
        const {
          groupInfo, 
        } = req.body;
    
        // Create an array to store the created joined queues
        const createdQueues = [];
    
        for (const info of groupInfo) {
          const {
            salonId,
            name,
            userName,
            joinedQType,
            methodUsed,
            barberName,
            barberId,
            serviceId,
            barberEWT,
          } = info;
    
          const qPosition = await JoinedQueue.countDocuments() + 1;
          const joinedQ = true;
          const currentDate = new Date();
          const currentTime = currentDate.toLocaleTimeString();
    
          const q = new JoinedQueue({
            salonId,
            name,
            userName,
            joinedQ,
            joinedQType,
            qPosition,
            dateJoinedQ: currentDate,
            timeJoinedQ: currentTime,
            methodUsed,
            barberName,
            barberId,
            serviceId,
            barberEWT,
          });
    
          const qjoined = await q.save();
          createdQueues.push(qjoined);
        }
    
        if (createdQueues.length > 0) {
          res.status(200).json({
            success: true,
            message: "Group Joined Queue Created",
            response: createdQueues,
          });
        } else {
          res.status(404).json({
            success: false,
            message: "Failed to create group joined queues",
          });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          error: 'Failed to create group joined queues',
        });
      }
}


const autoJoin = async(req, res) => {

}

const getQueueListBySalonId = async(req, res) =>{

    try{
        const {salonId} = req.params;
        const getQList = await JoinedQueue.find({salonId}).catch((error) =>{
            console.log(error)
        })

       

        res.status(200).json({
            success: true,
            message: "QList By Salon Id retrieved",
            response: getQList,
          });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
          success: false,
          error: 'QList not retrieved',
        });
      }

}

const barberServedQueue = async(req, res) =>{

}


module.exports = {
    singleJoinQueue,
    groupJoinQueue,
    getQueueListBySalonId,
}