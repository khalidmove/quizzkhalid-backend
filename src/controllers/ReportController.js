const User = require('@models/User');
const response = require('@responses/index');
const Quizz = require('@models/Quizz');
module.exports = {
  
  exportQuizData: async (req, res) => {
   try {
    const { quizId } = req.params;

    const quiz = await Quizz.findById(quizId)
      .populate('users.user', 'name email')
      .lean();

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const exportData = [];

    // Flatten questions
    let allQuestions = [];
    quiz.questions.forEach(level => {
      level.que.forEach(q => {
        allQuestions.push({
          questionId: q._id,
          question_number: q.question_number,
          question: q.question,
          correctAnswer: q.answer,
          type: q.type
        });
      });
    });

    // Loop users
    quiz.users.forEach(userEntry => {
      const user = userEntry.user;

      // If you have response array
      const responses = userEntry.responses || [];

      allQuestions.forEach(q => {
        const userResponse = responses.find(
          r => r.questionId?.toString() === q.questionId.toString()
        );

        exportData.push({
          testName: quiz.name,
          category: quiz.category,
          scheduledDate: quiz.scheduledDate,
          scheduledTime: quiz.scheduledTime,
          questionType: q.type,
          questionNumber: q.question_number,
          question: q.question,
          correctAnswer: q.correctAnswer,

          userName: user?.name,
          userEmail: user?.email,
          rank: userEntry.rank,
          correctAnswers: userEntry.correctAnswers,
          wrongAnswers: userEntry.wrongAnswers,
          totalTimeTaken: userEntry.totalTimeTaken,

          userAnswer: userResponse?.selectedAnswer || '',
          isCorrect: userResponse?.isCorrect ?? '',
        });
      });
    });

    return res.json({
      success: true,
      data: exportData,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
},
};
