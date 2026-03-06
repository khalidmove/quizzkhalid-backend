const User = require('@models/User');
const response = require('@responses/index');
const Quizz = require('@models/Quizz');
const Question = require('@models/Questions');
const ExcelJS = require("exceljs");

module.exports = {
  
  exportQuizData: async (req, res) => {
    try {
  const { quizId } = req.params;

  const quiz = await Quizz.findById(quizId)
    .populate("users.user", "name email")
    .lean();

  if (!quiz) {
    return res.status(404).json({ success: false, message: "Quiz not found" });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Quiz Admin";
  workbook.created = new Date();

  // ============================================================
  // ✅ SHEET 1 → QUIZ QUESTIONS SUMMARY
  // ============================================================

  const questionSheet = workbook.addWorksheet("Quiz Questions Summary");

  questionSheet.columns = [
    { header: "Question No", key: "questionNumber", width: 15 },
    { header: "Question", key: "question", width: 40 },
    { header: "Option A", key: "optionA", width: 20 },
    { header: "Count", key: "countA", width: 10 },
    { header: "Option B", key: "optionB", width: 20 },
    { header: "Count", key: "countB", width: 10 },
    { header: "Option C", key: "optionC", width: 20 },
    { header: "Count", key: "countC", width: 10 },
    { header: "Option D", key: "optionD", width: 20 },
    { header: "Count", key: "countD", width: 10 },
    { header: "Correct Answer", key: "correctAnswer", width: 18 },
  ];

  quiz.questions.forEach(level => {
    level.que.forEach(q => {

      const options = q.option || [];

      questionSheet.addRow({
        questionNumber: q.question_number,
        question: q.question,
        optionA: options[0]?.name || "",
        countA: options[0]?.count || 0,
        optionB: options[1]?.name || "",
        countB: options[1]?.count || 0,
        optionC: options[2]?.name || "",
        countC: options[2]?.count || 0,
        optionD: options[3]?.name || "",
        countD: options[3]?.count || 0,
        correctAnswer: q.answer,
      });
    });
  });

  // ============================================================
  // ✅ SHEET 2 → USERS SUMMARY
  // ============================================================

  const userSheet = workbook.addWorksheet("Users Summary");

  userSheet.columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Rank", key: "rank", width: 10 },
    { header: "Correct", key: "correct", width: 10 },
    { header: "Wrong", key: "wrong", width: 10 },
    { header: "Total Time (sec)", key: "totalTime", width: 18 },
  ];

  quiz.users.forEach(userEntry => {
    userSheet.addRow({
      name: userEntry.user?.name,
      email: userEntry.user?.email,
      rank: userEntry.rank,
      correct: userEntry.correctAnswers,
      wrong: userEntry.wrongAnswers,
      totalTime: userEntry.totalTimeTaken,
    });
  });

  // ============================================================
  // DOWNLOAD
  // ============================================================

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Quiz_Report_${Date.now()}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();

} catch (error) {
  console.error(error);
  res.status(500).json({ success: false, message: error.message });
}
},
exportQuestionReport: async (req, res) => {
  try {
  const { category } = req.query; // optional filter

  let filter = {};

  if (category) {
    filter.category = category;
  }

  const questions = await Question.find(filter).lean();

  if (!questions.length) {
    return res.status(404).json({
      success: false,
      message: "No questions found",
    });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Quiz Admin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Questions");

  // ================= COLUMNS =================

  sheet.columns = [
    { header: "Question No", key: "question_number", width: 15 },
    { header: "Category", key: "category", width: 20 },
    { header: "Type", key: "type", width: 15 },
    { header: "Question", key: "question", width: 40 },
    { header: "Option A", key: "optionA", width: 20 },
    { header: "Option B", key: "optionB", width: 20 },
    { header: "Option C", key: "optionC", width: 20 },
    { header: "Option D", key: "optionD", width: 20 },
    { header: "Correct Answer", key: "answer", width: 18 },
    { header: "Status", key: "status", width: 15 },
  ];

  // ================= ADD DATA =================

  questions.forEach(q => {
    const options = q.option || [];

    sheet.addRow({
      question_number: q.question_number,
      category: q.category,
      type: q.type,
      question: q.question,
      optionA: options[0]?.name || options[0] || "",
      optionB: options[1]?.name || options[1] || "",
      optionC: options[2]?.name || options[2] || "",
      optionD: options[3]?.name || options[3] || "",
      answer: q.answer,
      status: q.status,
    });
  });

  // ================= HEADER STYLE =================

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };

  // ================= DOWNLOAD =================

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Questions_${Date.now()}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();

} catch (error) {
  console.error(error);
  res.status(500).json({
    success: false,
    message: error.message,
  });
}
},
exportQuizUserReport: async (req, res) => {
  try {
  const { quizId } = req.params;

  const quiz = await Quizz.findById(quizId)
    .populate("users.user", "name email")
    .lean();

  if (!quiz) {
    return res.status(404).json({ success: false, message: "Quiz not found" });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Quiz Admin";
  workbook.created = new Date();

  // =====================================================
  // ✅ SHEET 1 → QUIZ SUMMARY
  // =====================================================

  const summarySheet = workbook.addWorksheet("Quiz Summary");

  summarySheet.columns = [
    { header: "Test Name", key: "name", width: 25 },
    { header: "Category", key: "category", width: 20 },
    { header: "Scheduled Date", key: "date", width: 18 },
    { header: "Total Questions", key: "totalQuestions", width: 18 },
    { header: "Total Participants", key: "totalUsers", width: 20 },
  ];

  const totalQuestions = quiz.questions.reduce(
    (acc, level) => acc + level.que.length,
    0
  );

  summarySheet.addRow({
    name: quiz.name,
    category: quiz.category,
    date: quiz.scheduledDate,
    totalQuestions,
    totalUsers: quiz.users.length,
  });

  // =====================================================
  // ✅ SHEET 2 → PARTICIPANTS SUMMARY
  // =====================================================

  const userSheet = workbook.addWorksheet("Participants Summary");

  userSheet.columns = [
    { header: "Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Rank", key: "rank", width: 10 },
    { header: "Correct", key: "correct", width: 10 },
    { header: "Wrong", key: "wrong", width: 10 },
    { header: "Total Time (sec)", key: "time", width: 18 },
    { header: "Score %", key: "percentage", width: 12 },
  ];

  quiz.users.forEach(u => {
    const percentage = totalQuestions
      ? ((u.correctAnswers / totalQuestions) * 100).toFixed(2)
      : 0;

    userSheet.addRow({
      name: u.user?.name,
      email: u.user?.email,
      rank: u.rank,
      correct: u.correctAnswers,
      wrong: u.wrongAnswers,
      time: u.totalTimeTaken,
      percentage: percentage + "%",
    });
  });

  // =====================================================
  // ✅ SHEET 3 → DETAILED ANSWERS
  // =====================================================

  const detailSheet = workbook.addWorksheet("Detailed Answers");

  detailSheet.columns = [
    { header: "User Name", key: "name", width: 25 },
    { header: "Email", key: "email", width: 30 },
    { header: "Question No", key: "qNo", width: 15 },
    { header: "Question", key: "question", width: 40 },
    { header: "Correct Answer", key: "correct", width: 20 },
    { header: "User Answer", key: "userAnswer", width: 20 },
    { header: "Is Correct", key: "isCorrect", width: 12 },
  ];

  quiz.users.forEach(u => {
    const responses = u.responses || [];

    responses.forEach(r => {

      const question = quiz.questions
        .flatMap(level => level.que)
        .find(q => q._id.toString() === r.questionId.toString());

      detailSheet.addRow({
        name: u.user?.name,
        email: u.user?.email,
        qNo: question?.question_number,
        question: question?.question,
        correct: question?.answer,
        userAnswer: r.selectedAnswer,
        isCorrect: r.isCorrect ? "Yes" : "No",
      });
    });
  });

  // =====================================================
  // DOWNLOAD
  // =====================================================

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Quiz_Report_${Date.now()}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();

} catch (error) {
  console.error(error);
  res.status(500).json({ success: false, message: error.message });
}
},
exportUserReport: async (req, res) => {
try {
    // =========================
    // 1️⃣ BASIC COUNTS
    // =========================
    const totalUsers = await User.countDocuments({ role: "user" });

    const activeSubscribers = await User.countDocuments({
      subscription: { $ne: null },
      planExp: { $gte: new Date() }
    });

    const cancelledSubscribers = await User.countDocuments({
      subscription: { $ne: null },
      planExp: { $lt: new Date() }
    });

    // =========================
    // 2️⃣ FETCH SUBSCRIBERS
    // =========================
    const subscribers = await User.find({
      subscription: { $ne: null }
    }).populate("subscription").lean();

    let totalSales = 0;
    const typeWiseSales = {};

    subscribers.forEach(user => {
      const amount = user.subscriptiondata?.plan || 0;
      totalSales += amount;

      const type = user.subscriptiondata?.type || "Unknown";

      if (!typeWiseSales[type]) {
        typeWiseSales[type] = 0;
      }
      typeWiseSales[type] += amount;
    });

    // =========================
    // 3️⃣ CREATE EXCEL
    // =========================
    const workbook = new ExcelJS.Workbook();

    // ================= SUMMARY SHEET =================
    const summarySheet = workbook.addWorksheet("Summary");

    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 30 },
      { header: "Value", key: "value", width: 30 }
    ];

    summarySheet.addRows([
      { metric: "Total Users", value: totalUsers },
      { metric: "Active Subscribers", value: activeSubscribers },
      { metric: "Cancelled Subscribers", value: cancelledSubscribers },
      { metric: "Total Sales Amount", value: totalSales }
    ]);

    // ================= USERS SHEET =================
    const userSheet = workbook.addWorksheet("Users");

    userSheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Role", key: "role", width: 15 },
      { header: "Points", key: "points", width: 15 },
      { header: "Created At", key: "createdAt", width: 25 }
    ];

    const users = await User.find().lean();
    userSheet.addRows(users);

    // ================= SUBSCRIBER SHEET =================
    const subscriberSheet = workbook.addWorksheet("Subscribers");

    subscriberSheet.columns = [
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Plan Type", key: "type", width: 20 },
      { header: "Amount", key: "amount", width: 15 },
      { header: "Expiry Date", key: "planExp", width: 25 },
      { header: "Payment ID", key: "paymentid", width: 35 }
    ];

    subscriberSheet.addRows(
      subscribers.map(user => ({
        name: user.name,
        email: user.email,
        type: user.subscriptiondata?.type,
        amount: user.subscriptiondata?.plan,
        planExp: user.planExp,
        paymentid: user.paymentid
      }))
    );

    // ================= TYPE-WISE SALES SHEET =================
    const salesSheet = workbook.addWorksheet("Sales By Type");

    salesSheet.columns = [
      { header: "Subscription Type", key: "type", width: 25 },
      { header: "Total Amount", key: "amount", width: 25 }
    ];

    Object.keys(typeWiseSales).forEach(type => {
      salesSheet.addRow({
        type,
        amount: typeWiseSales[type]
      });
    });

    // ================= DOWNLOAD RESPONSE =================
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=app-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
}
};
