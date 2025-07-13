const cron = require('node-cron');
const Quizz = require('@models/Quizz');
const Questions = require('@models/Questions');
const TimeSlot = require('@models/timeSlot');
// const mongoose = require("mongoose");
// const TimeSlot = mongoose.model("TimeSlot");

// Cron job that runs at 7 PM every day (0 19 * * *)
const dailyQuizupdate = cron.schedule('0 19 * * *', async () => {
  try {
    console.log('Running daily option count reset at 7 PM...');
 const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // 1. Get all active time slots
      const timeSlots = await TimeSlot.find({ status: true });

      if (!timeSlots.length) {
        console.log('⚠️ No active time slots found.');
        return;
      }

      // 2. Get fresh quizzes equal to time slot count
      const freshQuizzes = await Quizz.find({ status: 'fresh' }).limit(timeSlots.length);

      if (freshQuizzes.length < timeSlots.length) {
        console.log(`⚠️ Not enough fresh quizzes. Required: ${timeSlots.length}, Found: ${freshQuizzes.length}`);
        return;
      }

      // 3. Assign each quiz to a time slot
      for (let i = 0; i < timeSlots.length; i++) {
        const quiz = freshQuizzes[i];
        const slot = timeSlots[i];

        quiz.scheduledTime = slot.startTime;
        quiz.scheduledDate = today;
        quiz.status = 'used';

// ✅ Get the last level type
        const levelTypes = await Questions.distinct('type', {
          category: quiz.category,
        });

        const backupKey = 'Backup Questions';
        const lastLevel = levelTypes[levelTypes.length - 1];

        // ✅ Get 10 backup questions (not used)
        const backupQuestions = await Questions.aggregate([
          {
            $match: {
              type: lastLevel,
              category: quiz.category,
              status: { $ne: 'used' },
            },
          },
          {
            $sample: { size: 10 },
          },
        ]);

        if (backupQuestions.length) {
          quiz.questions.push({
            level: backupKey,
            que: backupQuestions,
          });

          // // ✅ Mark backup questions as used
          // const ids = backupQuestions.map((q) => q._id);
          // await Questions.updateMany({ _id: { $in: ids } }, { $set: { status: 'used' } });
        }

        await quiz.save();

        console.log(`✅ Scheduled quiz ${quiz._id} for time slot ${slot.startTime}`);
      }

      console.log('✅ All quizzes scheduled successfully.');

    } catch (error) {
      console.error('❌ Error in quiz scheduler:', error);
    }
}, {
  scheduled: false, // Don't start immediately
  timezone: "UTC" // Set your timezone as needed
});

// // Alternative cron job - Clean up old quiz data
// const dailyCleanupCron = cron.schedule('0 19 * * *', async () => {
//   try {
//     console.log('Running daily quiz cleanup at 7 PM...');
    
//     // Remove quizzes older than 30 days with no active users
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
//     const result = await Quizz.deleteMany({
//       createdAt: { $lt: thirtyDaysAgo },
//       $or: [
//         { users: { $size: 0 } },
//         { 'users.isAvailable': { $not: { $elemMatch: { $eq: true } } } }
//       ]
//     });
    
//     console.log(`Cleanup completed. Removed ${result.deletedCount} old quizzes.`);
    
//   } catch (error) {
//     console.error('Error in daily cleanup cron job:', error);
//   }
// }, {
//   scheduled: false,
//   timezone: "UTC"
// });

// // Weekly cron job to reset used questions (runs every Sunday at 7 PM)
// const weeklyUsedQuestionsResetCron = cron.schedule('0 19 * * 0', async () => {
//   try {
//     console.log('Running weekly used questions reset at 7 PM on Sunday...');
    
//     // Reset usedQuestions array for all quizzes
//     const quizResult = await Quizz.updateMany(
//       {},
//       { $set: { usedQuestions: [] } }
//     );
    
//     // Reset status in Questions collection
//     const questionResult = await Questions.updateMany(
//       { status: 'used' },
//       { $set: { status: 'fresh' } }
//     );
    
//     console.log(`Used questions reset completed. Modified ${quizResult.modifiedCount} quizzes and ${questionResult.modifiedCount} questions.`);
    
//     // Log the activity with timestamp
//     const timestamp = new Date().toISOString();
//     console.log(`[${timestamp}] Weekly used questions reset executed successfully`);
    
//   } catch (error) {
//     console.error('Error in weekly used questions reset cron job:', error);
//   }
// }, {
//   scheduled: false,
//   timezone: "UTC"
// });

// Function to start the cron jobs
const startCronJobs = () => {
  console.log('Starting quiz-related cron jobs...');
  
  // Start the option reset cron job
  dailyQuizupdate.start();
  console.log('Daily option count reset cron job started (runs at 7 PM daily)');
  
  // // Start the weekly used questions reset cron job
  // weeklyUsedQuestionsResetCron.start();
  // console.log('Weekly used questions reset cron job started (runs at 7 PM every Sunday)');
  
  // Uncomment the line below if you want to also run the cleanup cron
  // dailyCleanupCron.start();
  // console.log('Daily cleanup cron job started (runs at 7 PM daily)');
};

// Function to stop the cron jobs
const stopCronJobs = () => {
  dailyQuizupdate.stop();
  // weeklyUsedQuestionsResetCron.stop();
  // dailyCleanupCron.stop();
  // console.log('All cron jobs stopped');
};

// Function to get cron job status
const getCronStatus = () => {
  return {
    optionResetStatus: dailyQuizupdate.getStatus(),
    // usedQuestionsResetStatus: weeklyUsedQuestionsResetCron.getStatus(),
    // cleanupStatus: dailyCleanupCron.getStatus()
  };
};

module.exports = {
  startCronJobs,
  stopCronJobs,
  getCronStatus,
  dailyQuizupdate,
  // dailyCleanupCron,
  // weeklyUsedQuestionsResetCron
};