const cron = require('node-cron');
const Quizz = require('@models/Quizz');
const Questions = require('@models/Questions');

// Cron job that runs at 7 PM every day (0 19 * * *)
const dailyOptionResetCron = cron.schedule('0 19 * * *', async () => {
  try {
    console.log('Running daily option count reset at 7 PM...');
    
    // Reset all option counts for all quizzes
    const result = await Quizz.updateMany(
      {},
      {
        $set: {
          'questions.$[].que.$[].option.$[].count': 0
        }
      }
    );
    
    console.log(`Option counts reset completed. Modified ${result.modifiedCount} quizzes.`);
    
    // Log the activity with timestamp
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Daily OptionSchema count reset executed successfully`);
    
  } catch (error) {
    console.error('Error in daily option count reset cron job:', error);
  }
}, {
  scheduled: false, // Don't start immediately
  timezone: "UTC" // Set your timezone as needed
});

// Alternative cron job - Clean up old quiz data
const dailyCleanupCron = cron.schedule('0 19 * * *', async () => {
  try {
    console.log('Running daily quiz cleanup at 7 PM...');
    
    // Remove quizzes older than 30 days with no active users
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await Quizz.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      $or: [
        { users: { $size: 0 } },
        { 'users.isAvailable': { $not: { $elemMatch: { $eq: true } } } }
      ]
    });
    
    console.log(`Cleanup completed. Removed ${result.deletedCount} old quizzes.`);
    
  } catch (error) {
    console.error('Error in daily cleanup cron job:', error);
  }
}, {
  scheduled: false,
  timezone: "UTC"
});

// Weekly cron job to reset used questions (runs every Sunday at 7 PM)
const weeklyUsedQuestionsResetCron = cron.schedule('0 19 * * 0', async () => {
  try {
    console.log('Running weekly used questions reset at 7 PM on Sunday...');
    
    // Reset usedQuestions array for all quizzes
    const quizResult = await Quizz.updateMany(
      {},
      { $set: { usedQuestions: [] } }
    );
    
    // Reset status in Questions collection
    const questionResult = await Questions.updateMany(
      { status: 'used' },
      { $set: { status: 'fresh' } }
    );
    
    console.log(`Used questions reset completed. Modified ${quizResult.modifiedCount} quizzes and ${questionResult.modifiedCount} questions.`);
    
    // Log the activity with timestamp
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Weekly used questions reset executed successfully`);
    
  } catch (error) {
    console.error('Error in weekly used questions reset cron job:', error);
  }
}, {
  scheduled: false,
  timezone: "UTC"
});

// Function to start the cron jobs
const startCronJobs = () => {
  console.log('Starting quiz-related cron jobs...');
  
  // Start the option reset cron job
  dailyOptionResetCron.start();
  console.log('Daily option count reset cron job started (runs at 7 PM daily)');
  
  // Start the weekly used questions reset cron job
  weeklyUsedQuestionsResetCron.start();
  console.log('Weekly used questions reset cron job started (runs at 7 PM every Sunday)');
  
  // Uncomment the line below if you want to also run the cleanup cron
  // dailyCleanupCron.start();
  // console.log('Daily cleanup cron job started (runs at 7 PM daily)');
};

// Function to stop the cron jobs
const stopCronJobs = () => {
  dailyOptionResetCron.stop();
  weeklyUsedQuestionsResetCron.stop();
  dailyCleanupCron.stop();
  console.log('All cron jobs stopped');
};

// Function to get cron job status
const getCronStatus = () => {
  return {
    optionResetStatus: dailyOptionResetCron.getStatus(),
    usedQuestionsResetStatus: weeklyUsedQuestionsResetCron.getStatus(),
    cleanupStatus: dailyCleanupCron.getStatus()
  };
};

module.exports = {
  startCronJobs,
  stopCronJobs,
  getCronStatus,
  dailyOptionResetCron,
  dailyCleanupCron,
  weeklyUsedQuestionsResetCron
};