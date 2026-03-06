const mongoose = require('mongoose');
const Questions = require('@models/Questions');
const response = require('../responses');
const Quizz = require('@models/Quizz');
const TimeSlot = mongoose.model("TimeSlot");
const moment = require("moment");
const User = require('@models/User');
const { notify } = require('@services/notification');

module.exports = {
  create: async (req, res) => {
    try {
      const payload = req.body;
      const quizz = new Quizz(payload);
      const quiz = await quizz.save();
      await Questions.updateMany(
        { _id: { $in: payload.questionIdList } },
        { $set: { status: 'used' } },
      );
      return response.success(res, quiz);
    } catch (error) {
      return response.error(res, error);
    }
  },

  update: async (req, res) => {
    try {
      const payload = req.body;
      const que = await Quizz.findByIdAndUpdate(payload.id, payload, {
        new: true,
        upsert: true,
      });
      return response.success(res, que);
    } catch (error) {
      return response.error(res, error);
    }
  },

  get: async (req, res) => {
    try {
      const que = await Quizz.find();
      return response.success(res, que);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getbyId: async (req, res) => {
    try {
      const que = await Quizz.findById(req.params.id);
      return response.success(res, que);
    } catch (error) {
      return response.error(res, error);
    }
  },

  delete: async (req, res) => {
    try {
      const que = await Quizz.findByIdAndDelete(req.params.id);
      return response.success(res, { message: 'Quizz deleted successfully' });
    } catch (error) {
      return response.error(res, error);
    }
  },
  addUserToQuiz: async (req, res) => {
    const userId = req.user.id;
    const quizId = req.params.id;
    try {
      // Check if the user already exists in the quiz
      const quiz = await Quizz.findOne({
        _id: quizId,
        'users.user': userId,
      });

      if (quiz) {
        // Optional: Update isAvailable to true if rejoining
        await Quizz.updateOne(
          { _id: quizId, 'users.user': userId },
          { $set: { 'users.$.isAvailable': true } },
        );
      } else {
        // Add new user
        await Quizz.updateOne(
          { _id: quizId },
          {
            $push: {
              users: {
                user: userId,
                isAvailable: true,
              },
            },
          },
        );
      }

      return response.success(res, { message: 'User added to quiz' });
    } catch (err) {
      console.error(err);
      return response.error(res, err);
    }
  },
  removeUserFromQuiz: async (req, res) => {
    const userId = req.user.id;
    const quizId = req.params.id;
    const {
      answeredCount,
      correctAnswers,
      wrongAnswers,
      enteredBackup,
      totalTimeTaken,
      completedBackup,
      leftAtQuestion,
    } = req.body;
    try {
      const quiz = await Quizz.findOne({
        _id: quizId,
        'users.user': userId,
      });
      if (!quiz) return;

      if (quiz) {
await Quizz.updateOne(
  { _id: quizId, 'users.user': userId },
  {
    $set: {
      'users.$.isAvailable': false,
      'users.$.answeredCount': answeredCount,
      'users.$.correctAnswers': correctAnswers,
      'users.$.wrongAnswers': wrongAnswers,
      'users.$.enteredBackup': enteredBackup,
      'users.$.totalTimeTaken': totalTimeTaken ,
      'users.$.completedBackup': completedBackup,
      'users.$.leftAtQuestion': leftAtQuestion,
    },
  }
);

      } else {
        return response.badReq(res, {
          message: 'User does not exist in this quiz',
        });
      }
const updatedQuiz = await Quizz.findById(quizId);
  const activeUsers = updatedQuiz.users.filter((u) => u.isAvailable);
      if (activeUsers.length <=1 &&!enteredBackup) {
        const backupqus = updatedQuiz.questions.find(
          (f) => f.level === 'Backup Questions',
        );
         const backupQuestions = backupqus ? backupqus.que : [];
        await Questions.updateMany(
    { _id: { $in: backupQuestions.map(q => q._id) } },
    { $set: { status: "fresh" } }
  );
      }

        return response.success(res, {
          message:
            'Your quiz is submitted. Ranking will be available once all users finish.',
          showStats: {
            answeredCount,
            correctAnswers,
            wrongAnswers,
            enteredBackup,
            totalTimeTaken,
            completedBackup,
          },
          rank: null,
        });
      // }

      // // All users done, now rank
      // const rankedUsers = [...quiz.users].sort((a, b) => {
      //   if (b.answeredCount !== a.answeredCount)
      //     return b.answeredCount - a.answeredCount;
      //   return a.totalTimeTaken - b.totalTimeTaken;
      // });

      // rankedUsers.forEach((user, index) => {
      //   user.rank = index + 1;
      // });

      // await quiz.save();

      // // Find current user's rank
      // const currentUserRank = rankedUsers.find(
      //   (u) => u.user.toString() === userId.toString(),
      // )?.rank;

      // return response.success(res, {
      //   currentUserRank,
      //   message: 'Quiz completed. Final ranking is available.',
      // });
    } catch (err) {
      console.error(err);
      return response.error(res, err);
    }
  },
  userExistCheck: async (req, res) => {
    const quizId = req.params.id;
    try {
      const quiz = await Quizz.findById(quizId);
      const availableUsers = quiz.users.filter((u) => u.isAvailable === true);
      if (availableUsers.length > 1) {
        return response.success(
          res,
          { otherPlayer: true },
          { message: 'Users exist to quiz' },
        );
      } else {
        return response.success(
          res,
          { otherPlayer: false },
          { message: 'Users does not exist to quiz' },
        );
      }
    } catch (err) {
      console.error(err);
      return response.error(res, err);
    }
  },
  playerNumbers: async (req, res) => {
    const quizId = req.params.id;
    try {
      const quiz = await Quizz.findById(quizId);
      const availableUsers = quiz.users.filter((u) => u.isAvailable === true);
        return response.success(
          res,
          { playerNumber: availableUsers.length },
        );
    } catch (err) {
      console.error(err);
      return response.error(res, err);
    }
  },
  submitanswer: async (req, res) => {
    try {
      const { selectedOption, quizId, questionId ,isCorrect,timeTaken} = req.body;

      await Quizz.updateOne(
  {
    _id: quizId,
    "users.user": req.user.id
  },
  {
    $inc: {
      "questions.$[].que.$[q].option.$[o].count": 1
    },
    $push: {
      "users.$.responses": {
        questionId: questionId,
        selectedAnswer: selectedOption,
        isCorrect: isCorrect,
        timeTaken: timeTaken
      }
    }
  },
  {
    arrayFilters: [
      { "q._id": questionId },
      { "o.name": selectedOption }
    ]
  }
);
      return response.success(res, { message: 'Quizz updated successfully' });
    } catch (error) {
      return response.error(res, error);
    }
  },
  givevote: async (req, res) => {
    try {
      const { choice, quizId } = req.body;
 const userId = req?.user?.id;


  await Quizz.updateOne(
    { _id: quizId },
    {
      $push: {
        'voting.votes': { user: userId, choice },
      },
    }
  );
      return response.success(res, { message: 'Quizz updated successfully' });
    } catch (error) {
      return response.error(res, error);
    }
  },
  getvotedata: async (req, res) => {
    try {
    const quiz = await Quizz.findById(req.query.quizId).lean();
    const votes = quiz?.voting?.votes || [];

    const yes = votes.filter(v => v.choice === 'yes').length;
    const no = votes.filter(v => v.choice === 'no').length;

    return res.json({ status: true, data: { yes, no } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: 'Server error' });
  }

  },
  // getquizaccordingtime: async (req, res) => {
  //   console.log('entering getquizaccordingtime');
  //   try {
  //     const today = new Date();
  //     today.setUTCHours(0, 0, 0, 0);
  //     // const quiz = await Quizz.findOne({
  //     //   scheduledDate: today,
  //     //   scheduledTime: '8:00 pm',
  //     // });
  //     return response.success(res);

  //   } catch (err) {
  //     console.error(err);
  //     return response.error(res, err);
  //   }
  // },

  fetchBackupQuestion: async (req, res) => {
    try {
      let backupKey = 'Backup Questions';
      let que = await Quizz.findById(req.params.id);
      const hasBackupQuestion = que.questions.find(
        (f) => f.level === backupKey,
      );
      if (hasBackupQuestion && hasBackupQuestion.que.length > 0) {
        return response.success(res, que);
      }
      const levels = await Questions.distinct('type', {
        category: que.category,
      });
      const lastitem = levels[levels.length - 1];

      let limit = 10;
      const facets = {};
      facets[backupKey] = [
        {
          $match: {
            type: lastitem,
            category: que.category,
            status: { $ne: 'used' }, // Skip status filter for Level-5
          },
        },
        {
          $sample: { size: limit },
        },
      ];

      const quiz = await Questions.aggregate([
        {
          $facet: facets,
        },
        {
          $project: {
            data: {
              $map: {
                input: { $objectToArray: '$$ROOT' },
                as: 'item',
                in: {
                  level: '$$item.k',
                  que: '$$item.v',
                },
              },
            },
          },
        },
        {
          $unwind: '$data',
        },
        {
          $replaceRoot: { newRoot: '$data' },
        },
      ]);
      let questionIdArray = [];
      quiz.map((item) => {
        questionIdArray = questionIdArray.concat(item.que.map((q) => q._id));
      });
      console.log(questionIdArray);
      await Questions.updateMany(
        { _id: { $in: questionIdArray } },
        { $set: { status: 'used' } },
      );
      que.questions.push(quiz[0]);
      await que.save();
      return response.success(res, que);
    } catch (error) {
      return response.error(res, error);
    }
  },
  getuserquizhistory: async (req, res) => {
  try {
  const userId = req.user.id;

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  // TOTAL COUNT (pagination)
  const total = await Quizz.countDocuments({ "users.user": userId });

  // FETCH QUIZZES
  const quizzes = await Quizz.find({ "users.user": userId })
    .select(
      "users name scheduledDate scheduledTime isRankCalculated createdAt"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  if (!quizzes.length) {
    return response.success(res, {
      data: [],
      page,
      limit,
      total,
      totalPages: 0
    });
  }

  // FETCH TIMESLOTS ONCE
  const timeSlots = await TimeSlot.find({ status: true }).lean();
  const timeSlotMap = new Map(
    timeSlots.map(slot => [slot.startTime, slot])
  );

  const history = [];

  for (const quiz of quizzes) {
    const userIndex = quiz.users.findIndex(
      u => u.user.toString() === userId
    );

    if (userIndex === -1) continue;

    const allLeft = quiz.users.every(u => u.isAvailable === false);

    //RANK CALCULATION (OLD LOGIC)

    if (!quiz.isRankCalculated && allLeft) {
      const rankedUsers = [...quiz.users].sort((a, b) => {
        if (a.answeredCount !== b.answeredCount) {
          return b.answeredCount - a.answeredCount;
        }
        return a.totalTimeTaken - b.totalTimeTaken;
      });

      rankedUsers.forEach((u, index) => {
        u.rank = index + 1;
      });

      await Quizz.updateOne(
        { _id: quiz._id },
        {
          $set: {
            users: rankedUsers,
            isRankCalculated: true
          }
        }
      );

      quiz.users = rankedUsers; // keep local sync
    }

    // WINNER REWARD (NEW FEATURE)
    const rewardUpdate = await Quizz.findOneAndUpdate(
      {
        _id: quiz._id,
        isRankCalculated: true,
        "users.rank": 1,
        "users.rewardGiven": { $ne: true }
      },
      {
        $set: { "users.$.rewardGiven": true }
      },
      { new: true }
    );

    if (rewardUpdate) {
      const winner = rewardUpdate.users.find(u => u.rank === 1);
      const timeSlot = timeSlotMap.get(quiz.scheduledTime);

      if (winner && timeSlot) {
        const rewardPoints = timeSlot.premium ? 250 : 100;

        const expiresAt = moment()
        .add(24, 'hours')
        .toDate();

        await User.updateOne(
          { _id: winner.user },
          { $inc: { points: rewardPoints } ,
          $push: {
      rewards: {
        points: rewardPoints,
        expiresAt
      }
    }}
        );
        await notify(
          winner.user,
                  "Congratulations! You've won the quiz!",
                  `You have been rewarded ${rewardPoints} points for winning the quiz.You have 24 hours to claim your reward.`
                );
      }
    }

      // USER HISTORY (OLD RESPONSE)
    const userData = quiz.users[userIndex];

    history.push({
      quizId: quiz._id,
      name: quiz.name,
      scheduledDate: quiz.scheduledDate,
      scheduledTime: quiz.scheduledTime,
      answeredCount: userData.answeredCount || 0,
      totalTimeTaken: userData.totalTimeTaken || 0,
      correctAnswers: userData.correctAnswers || 0,
      wrongAnswers: userData.wrongAnswers || 0,
      rank: userData.rank ?? null
    });
  }

  return response.success(res, {
    data: history,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });

} catch (err) {
  console.error("Quiz history error:", err);
  return response.error(res, err.message || "Something went wrong");
}


  },
  getuserstats: async (req, res) => {
try {
    const userId = req.user.id;

    // 1. Fetch all quizzes where user participated
    const quizzes = await Quizz.find({ 'users.user': userId })
      .select('users scheduledDate scheduledTime')
      .lean();

    let totalQuizzes = 0;
    let winerCount = 0; // 1st, 2nd, or 3rd
    let totalRankSum = 0;
    let rankCount = 0;

    for (const quiz of quizzes) {
      const userIndex = quiz.users.findIndex(u => u.user.toString() === userId);
      if (userIndex === -1) continue;

      totalQuizzes++;

      const isRankMissing = quiz.users.some(u => u.rank == null);
      const allLeft = quiz.users.every(u => u.isAvailable === false);

      if (isRankMissing && allLeft) {
        // Ranking logic same as before
        const ranked = [...quiz.users].sort((a, b) => {
          if (a.answeredCount !== b.answeredCount) {
            return b.answeredCount - a.answeredCount;
          }
          return a.totalTimeTaken - b.totalTimeTaken;
        });

        ranked.forEach((user, index) => {
          user.rank = index + 1;
        });

        await Quizz.updateOne(
          { _id: quiz._id },
          { $set: { users: ranked } }
        );

        quiz.users = ranked;
      }

      const userData = quiz.users[userIndex];
      if (userData.rank != null) {
        totalRankSum += userData.rank;
        rankCount++;

        if ([1, 2, 3].includes(userData.rank)) {
          winerCount++;
        }
      }
    }

    const averageRank = rankCount > 0 ? (totalRankSum / rankCount).toFixed(0) : null;

    return response.success(res, {
      totalQuizzes,
      winerQuizNo: winerCount,
      averageRank,
    });
  } catch (err) {
    console.error(err);
    return response.error(res, err);
  }
},

 getLeaderboard : async (req, res) => {
 try {
  const now = moment();
  const timeSlots = await TimeSlot.find({ status: true }).sort({ startTime: 1 });

  const responseData = [];

  const todayStart = moment().startOf('day').toDate();
  const todayEnd = moment().endOf('day').toDate();

  const yesterdayStart = moment().subtract(1, 'day').startOf('day').toDate();
  const yesterdayEnd = moment().subtract(1, 'day').endOf('day').toDate();

  for (let slot of timeSlots) {
    const [slotHour, slotMinute] = slot.startTime.split(':').map(Number);
    const todaySlotStart = moment().set({
      hour: slotHour,
      minute: slotMinute,
      second: 0,
      millisecond: 0
    });
    const todaySlotEnd = moment(todaySlotStart).add(20, 'minutes');

    let finalQuiz = null;

    //TODAY SLOT (after 20 mins)
    // if (now.isSameOrAfter(todaySlotEnd)) {
      finalQuiz = await Quizz.findOne({
        scheduledDate: { $gte: todayStart, $lt: todayEnd },
        scheduledTime: slot.startTime
      }).populate('users.user', 'name username').lean();
    // }

    // FALLBACK TO YESTERDAY

    if (!finalQuiz || finalQuiz.users?.some(u => u.rank == null)) {
      finalQuiz = await Quizz.findOne({
        scheduledDate: { $gte: yesterdayStart, $lt: yesterdayEnd },
        scheduledTime: slot.startTime
      }).populate('users.user', 'name username avatar').lean();
    }

    if (!finalQuiz) continue;

    const allLeft = finalQuiz.users.every(u => u.isAvailable === false);
    const isRankMissing = finalQuiz.users.some(u => u.rank == null);

    // RANK CALCULATION (OLD LOGIC)

    if (isRankMissing && allLeft) {
      const ranked = [...finalQuiz.users]
        .sort((a, b) => {
          if (a.answeredCount !== b.answeredCount) {
            return b.answeredCount - a.answeredCount;
          }
          return a.totalTimeTaken - b.totalTimeTaken;
        })
        .map((u, i) => ({ ...u, rank: i + 1 }));

      await Quizz.updateOne(
        { _id: finalQuiz._id },
        {
          $set: {
            users: ranked,
            isRankCalculated: true
          }
        }
      );

      finalQuiz.users = ranked;
    }

    // REWARD DISTRIBUTION (NEW)

    const rewardUpdate = await Quizz.findOneAndUpdate(
      {
        _id: finalQuiz._id,
        isRankCalculated: true,
        "users.rank": 1,
        "users.rewardGiven": { $ne: true }
      },
      {
        $set: { "users.$.rewardGiven": true }
      },
      { new: true }
    );

    if (rewardUpdate) {
      const winner = rewardUpdate.users.find(u => u.rank === 1);
      if (winner) {
        const rewardPoints = slot.premium ? 250 : 100;

        await User.updateOne(
          { _id: winner.user },
          { $inc: { points: rewardPoints } }
        );
        await notify(
          winner.user,
                  "Congratulations! You've won the quiz!",
                  `You have been rewarded ${rewardPoints} points for winning the quiz.You have 24 hours to claim your reward.`
                );
      }
    }

    // TOP 3 RESPONSE (OLD FORMAT)
    
    const topThree = finalQuiz.users
      .filter(u => u.rank && u.rank <= 3)
      .sort((a, b) => a.rank - b.rank)
      .map(u => ({
        userId: u.user,
        rank: u.rank,
        correctAnswers: u.correctAnswers,
        wrongAnswers: u.wrongAnswers,
        answeredCount: u.answeredCount
      }));

    if (topThree.length > 0) {
      responseData.push({
        slot: slot.startTime,
        date: moment(finalQuiz.scheduledDate).format('YYYY-MM-DD'),
        winners: topThree
      });
    }
  }

  return res.json({ success: true, data: responseData });

} catch (err) {
  console.error('Error fetching winners by time slot:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
}

},
getTopSecondSlotWinners : async (req, res) => {
  try {
  const timeSlots = await TimeSlot.find({ status: true }).sort({ startTime: 1 });

  if (timeSlots.length < 2) {
    return res.json({ success: false, message: "Not enough time slots" });
  }

  const now = moment();
  const results = [];

  // Only take first 2 active slots
  const activeSlots = timeSlots.slice(0, 2);

  for (const slot of activeSlots) {

    if (results.length >= 4) break;

    const slotTime24hr = moment(slot.startTime, ["h:mm A"]).format("HH:mm");
    const todaySlotMoment = moment(
      `${moment().format("YYYY-MM-DD")} ${slotTime24hr}`,
      "YYYY-MM-DD HH:mm"
    );

    // STEP 1 → Check today result (only if 20 min passed)
    // if (now.isAfter(todaySlotMoment.clone().add(20, "minutes"))) {

      const todayQuiz = await Quizz.findOne({
        scheduledDate: {
          $gte: moment().startOf("day").toDate(),
          $lt: moment().endOf("day").toDate(),
        },
        scheduledTime: slot.startTime,
        isRankCalculated: true,
        "users.rank": 1
      })
      .populate("users.user", "name avatar")
      .lean();

      if (todayQuiz) {
        const winner = todayQuiz.users.find(u => u.rank === 1);
        if (winner) {
          results.push({
            date: moment().format("DD/MM/YYYY"),
            slot: slot.startTime,
            isPremium: slot.premium,
            winner: {
              userId: winner.user._id,
              name: winner.user.name,
              avatar: winner.user.avatar,
              correctAnswers: winner.correctAnswers,
              totalTimeTaken: winner.totalTimeTaken,
            }
          });
          continue; // Move to next slot
        }
      }
    // }

    // STEP 2 → If today's winner not available → check past days
    let dayOffset = 1;

    while (results.length < 4 &&dayOffset <= 7) {
      const targetDate = moment().subtract(dayOffset, "days");

      const quiz = await Quizz.findOne({
        scheduledDate: {
          $gte: targetDate.clone().startOf("day").toDate(),
          $lt: targetDate.clone().endOf("day").toDate(),
        },
        scheduledTime: slot.startTime,
        "users.rank": 1
      })
      .populate("users.user", "name avatar")
      .lean();

      if (quiz) {
        const winner = quiz.users.find(u => u.rank === 1);
        if (winner) {
          results.push({
            date: targetDate.format("DD/MM/YYYY"),
            slot: slot.startTime,
            isPremium: slot.premium,
            winner: {
              userId: winner.user._id,
              name: winner.user.name,
              avatar: winner.user.avatar,
              correctAnswers: winner.correctAnswers,
              totalTimeTaken: winner.totalTimeTaken,
            }
          });
          break;
        }
      }

      dayOffset++;
    }
  }

  return res.json({ status: true, data: results });

} catch (err) {
  console.error("Error in getTopSlotWinners:", err);
  return res.status(500).json({ success: false, message: "Server error" });
}

},
getAllRankedQuizzes: async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $match: {
          "users.rank": { $ne: null }
        }
      },

      // sort first to reduce load
      {
        $sort: {
          scheduledDate: -1,
          scheduledTime: -1
        }
      },

      // pagination early in pipeline
      { $skip: skip },
      { $limit: limit },

      // extract top 3 ranked users only
      {
        $project: {
          name: 1,
          scheduledDate: 1,
          scheduledTime: 1,
          users: {
            $slice: [
              {
                $filter: {
                  input: "$users",
                  as: "u",
                  cond: { $lte: ["$$u.rank", 3] }
                }
              },
              3
            ]
          }
        }
      },

      // join user data for only those 3 users
      {
        $lookup: {
          from: "users",
    let: { uid: "$users.user" },
    pipeline: [
      {
        $match: {
          $expr: { $in: ["$_id", "$$uid"] }
        }
      },
      {
        $project: {
          password: 0,
          otp: 0,
          __v: 0
        }
      }
    ],
    as: "userData"
        }
      },

      // merge user info into user array
      {
        $addFields: {
          users: {
            $map: {
              input: "$users",
              as: "u",
              in: {
                _id: "$$u.user",
                rank: "$$u.rank",
                correctAnswers: "$$u.correctAnswers",
                wrongAnswers: "$$u.wrongAnswers",
                answeredCount: "$$u.answeredCount",
                totalTimeTaken: "$$u.totalTimeTaken",
                user: {
                  $first: {
                    $filter: {
                      input: "$userData",
                      as: "info",
                      cond: { $eq: ["$$info._id", "$$u.user"] }
                    }
                  }
                }
              }
            }
          }
        }
      },

      {
        $project: {
          userData: 0
        }
      }
    ];

    const data = await Quizz.aggregate(pipeline);

    // count separately for pagination
    const total = await Quizz.countDocuments({ "users.rank": { $ne: null } });

    return res.json({
      success: true,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
      data,
    });

  } catch (err) {
    console.error("Error in optimized API:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
},
//  getQuizWinners : async (req, res) => {
//   try {
//     const now = new Date();

//     // Step 1: Find all quizzes whose scheduled time + 20 mins has passed
//     const quizzes = await Quizz.find({
//       scheduledDate: { $lte: now }, // any past date or today
//     })
//       .select('name users scheduledDate scheduledTime')
//       .lean();

//     const winnersList = [];

//     for (const quiz of quizzes) {
//       const quizDateTime = new Date(`${quiz.scheduledDate}T${quiz.scheduledTime}`);
//       const endTime = new Date(quizDateTime.getTime() + 20 * 60000);

//       if (now < endTime) continue; // 20 min not passed, skip

//       // Check if rank is already calculated
//       const isRankMissing = quiz.users.some(u => u.rank == null);
//       const allLeft = quiz.users.every(u => u.isAvailable === false);

//       if (isRankMissing && allLeft) {
//         // Calculate ranking
//         const ranked = [...quiz.users].sort((a, b) => {
//           if (a.answeredCount !== b.answeredCount) {
//             return b.answeredCount - a.answeredCount;
//           }
//           return a.totalTimeTaken - b.totalTimeTaken;
//         });

//         ranked.forEach((user, index) => {
//           user.rank = index + 1;
//         });

//         await Quizz.updateOne(
//           { _id: quiz._id },
//           { $set: { users: ranked } }
//         );

//         quiz.users = ranked;
//       }

//       // Get top 3 users
//       const top3 = quiz.users
//         .filter(u => u.rank && u.rank <= 3)
//         .map(u => ({
//           userId: u.user,
//           rank: u.rank,
//           answeredCount: u.answeredCount,
//         }))
//         .sort((a, b) => a.rank - b.rank);

//       if (top3.length > 0) {
//         winnersList.push({
//           quizId: quiz._id,
//           name: quiz.name,
//           scheduledDate: quiz.scheduledDate,
//           scheduledTime: quiz.scheduledTime,
//           winners: top3,
//         });
//       }
//     }

//     // Sort latest first by date & time
//     winnersList.sort((a, b) => {
//       const aTime = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
//       const bTime = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
//       return bTime - aTime;
//     });

//     return response.success(res, winnersList);
//   } catch (err) {
//     console.error(err);
//     return response.error(res, err);
//   }
// },
};
