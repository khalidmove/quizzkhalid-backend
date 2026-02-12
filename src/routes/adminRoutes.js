const express = require('express');
const admindashboard = require('@controllers/admindashboardController');
const authMiddleware = require('@middlewares/authMiddleware');

const router = express.Router();
router.get('/totalnumberdata',
//   authMiddleware(['admin']),
  admindashboard.totalnumberdata,);
// router.get('/lastweekbookings',
// //   authMiddleware(['admin']),
//   admindashboard.lastweekbookings,);
// router.get('/lastweekusers',
// //   authMiddleware(['admin']),
//   admindashboard.lastweekusers,);

module.exports = router;
