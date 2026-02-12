const User = require('@models/User');
const response = require('@responses/index');
const Quizz = require('@models/Quizz');
module.exports = {
  
  totalnumberdata: async (req, res) => {
    try {
      const [user, subscribed, unsubscribed, quizz] =
        await Promise.all([
          User.countDocuments({ role: 'user' }),
          User.countDocuments({ planExp: { $gt: new Date() } }),
          User.countDocuments({ planExp: { $exists: true },planExp: { $lt: new Date() } }),
          Quizz.countDocuments({}),
        ]);
      return response.success(res, {
        user,
        subscribed,
        unsubscribed,
        quizz
      });
    } catch (err) {
      console.log(err);
      response.error(res, err);
    }
  },


};
