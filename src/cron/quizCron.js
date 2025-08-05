const cron = require('node-cron');
const Quizz = require('@models/Quizz');
const Questions = require('@models/Questions');
const TimeSlot = require('@models/timeSlot');
const mongoose = require("mongoose");
// const TimeSlot = mongoose.model("TimeSlot");

// Cron job that runs at 7 PM every day (0 19 * * *)
const dailyQuizupdate = cron.schedule('09 00 * * *', async () => {
  try {
  console.log('Running daily option count reset at 7 PM...');

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const timeSlots = await TimeSlot.find({ status: true });

  if (!timeSlots.length) {
    console.log('⚠️ No active time slots found.');
    return;
  }

  const freshQuizzes = await Quizz.find({ status: 'fresh' }).limit(timeSlots.length);

  if (freshQuizzes.length < timeSlots.length) {
    console.log(`⚠️ Not enough fresh quizzes. Required: ${timeSlots.length}, Found: ${freshQuizzes.length}`);
    return;
  }

  // ✅ Track all used question IDs globally
  const alreadyUsedQuestionIds = new Set();

  for (let i = 0; i < timeSlots.length; i++) {
    const quiz = freshQuizzes[i];
    const slot = timeSlots[i];

    quiz.scheduledTime = slot.startTime;
    quiz.scheduledDate = today;
    quiz.status = 'used';

    const backupKey = 'Backup Questions';
    const levelTypes = await Questions.distinct('type', { category: quiz.category });
    const backupQuestions = [];
    const maxBackupCount = 10;

    // ✅ Loop through levels (from last to first)
    for (let j = levelTypes.length - 1; j >= 0 && backupQuestions.length < maxBackupCount; j--) {
      const level = levelTypes[j];
      const remaining = maxBackupCount - backupQuestions.length;

      const questions = await Questions.aggregate([
        {
          $match: {
            type: level,
            category: quiz.category,
            status: { $ne: 'used' },
            _id: {
              $nin: Array.from(alreadyUsedQuestionIds).map(id => new mongoose.Types.ObjectId(id)),
            },
          },
        },
        { $sample: { size: remaining } },
      ]);

      backupQuestions.push(...questions);
      questions.forEach(q => alreadyUsedQuestionIds.add(q._id.toString()));
    }

    // ✅ Add backup question group only once per quiz
    if (backupQuestions.length > 0) {
      quiz.questions.push({
        level: backupKey,
        que: backupQuestions,
      });
    }

    await quiz.save();
    console.log(`✅ Scheduled quiz ${quiz._id} for time slot ${slot.startTime}`);
  }

  console.log('✅ All quizzes scheduled successfully.');

} catch (error) {
  console.error('❌ Error in quiz scheduler:', error);
}

},{
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