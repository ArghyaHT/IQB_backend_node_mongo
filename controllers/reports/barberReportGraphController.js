const JoinedQueueHistory = require("../../models/joinedQueueHistoryModel")

const customerServedByEachBarber = async(req, res) => {
try{
    const {salonId, barberId}= req.query;
    const {type, fromDate, toDate} = req.body;
    const parsedBarberId = parseInt(barberId, 10);
    const salon = await JoinedQueueHistory.findOne({salonId})

    if (!salon) {
        return res.status(404).json({
          success: false,
          message: 'Salon not found.',
        });
      }

      let customerServedByBarber = 0;

    //   salon.queueList.forEach((customer) => {
    //     // console.log("customer",customer.barberId);
    //     if(customer.barberId === parsedBarberId){
    //     customerServedByBarber++;
    //     }
    // }

      if (!fromDate && !toDate) {
        const now = new Date();
        if (type === 'day') {
          fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        } else if (type === 'week') {
          const firstDayOfWeek = now.getDate() - now.getDay();
          fromDate = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek, 0, 0, 0);
          toDate = new Date(now.getFullYear(), now.getMonth(), firstDayOfWeek + 6, 23, 59, 59);
        } else if (type === 'month') {
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
          toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }
      }

      if (type === 'day') {
        customerServedByBarber = countCustomersForDayRange(salon, parsedBarberId, fromDate, toDate);
      } else if (type === 'week') {
        customerServedByBarber = countCustomersForWeekRange(salon, parsedBarberId, fromDate, toDate);
      } else if (type === 'month') {
        customerServedByBarber = countCustomersForMonthRange(salon, parsedBarberId, fromDate, toDate);
      }
      salon.queueList.forEach((customer) => {
        // console.log("customer",customer.barberId);
        if(customer.barberId === parsedBarberId){
        customerServedByBarber++;
        }
       
 });
 res.status(200).json({
    success: true,
    response: {
      barberId,
      customersServed: customerServedByBarber,
    },
  });
}catch(error){
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

function isDateInRange(date, fromDate, toDate) {
    return date >= fromDate && date <= toDate;
  }

function countCustomersForDayRange(salon, barberId, fromDate, toDate) {
    let customerCount = 0;
    salon.queueList.forEach((customer) => {
      // Check if the customer's date falls within the specified day range
      if (isDateInRange(customer.dateJoinedQ, fromDate, toDate) && customer.barberId === barberId) {
        customerCount++;
      }
    });
    return customerCount;
  }

  function isWeekInRange(date, fromDate, toDate) {
    return date >= fromDate && date <= toDate;
  }

  function countCustomersForWeekRange(salon, barberId, fromDate, toDate) {
    let customerCount = 0;
    salon.queueList.forEach((customer) => {
      // Check if the customer's date falls within the specified week range
      const customerDate = new Date(customer.dateJoinedQ);
      if (isWeekInRange(customerDate, fromDate, toDate) && customer.barberId === barberId) {
        customerCount++;
      }
    });
    return customerCount;
  }
  
  function isMonthInRange(date, fromDate, toDate) {
    return date >= fromDate && date <= toDate;
  }
  function countCustomersForMonthRange(salon, barberId, fromDate, toDate) {
    let customerCount = 0;
    salon.queueList.forEach((customer) => {
      // Check if the customer's date falls within the specified month range
      const customerDate = new Date(customer.dateJoinedQ);
      if (isMonthInRange(customerDate, fromDate, toDate) && customer.barberId === barberId) {
        customerCount++;
      }
    });
    return customerCount;
  }
  
module.exports = {
    customerServedByEachBarber
}