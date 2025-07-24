const express = require('express');
const subscription = require('@controllers/subscriptionController');
const authMiddleware = require('@middlewares/authMiddleware');

const router = express.Router();
router.post('/createSubscription',subscription.create,
);
router.delete('/deleteSubscription/:id',authMiddleware(['user', 'admin']),subscription.delete,
);
router.put('/updateSubscription/:id',authMiddleware(['user', 'admin']),subscription.update,
);
router.get('/getActiveSubscription',authMiddleware(['user', 'admin']),subscription.getActiveSubscription,
);
router.get('/getSubscription',authMiddleware(['user', 'admin']),subscription.getFAQ,
);
router.patch('/changestatus/:id',authMiddleware(['user', 'admin']),subscription.changestatus,
);

router.post('/changeAllStatus',authMiddleware(['user', 'admin']),subscription.changeAllStatus,
);

module.exports = router;
