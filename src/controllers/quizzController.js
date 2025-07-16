const Questions = require('@models/Questions');
const response = require('../responses');
const Quizz = require('@models/Quizz');
const mongoose = require('mongoose');

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
    try {
      const quiz = await Quizz.findOne({
        _id: quizId,
        'users.user': userId,
      });

      if (quiz) {
        await Quizz.updateOne(
          { _id: quizId, 'users.user': userId },
          { $set: { 'users.$.isAvailable': false } },
        );
      } else {
        return response.badReq(res, {
          message: 'User does not exist in this quiz',
        });
      }

      return response.success(res, { message: 'User added to quiz' });
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
        return response.success(res,
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
  submitanswer: async (req, res) => {
    try {
      //            const bulk = [];
      // const submissionData=req?.body?.data
      
      // submissionData.forEach(({ questionId, selectedOption }) => {
        //   bulk.push({
          //     updateOne: {
            //       filter: {
              //         "questions.que._id": questionId,
              //       },
              //       update: {
                //         $inc: {
                  //           "questions.$[].que.$[q].option.$[opt].count": 1,
                  //         },
                  //       },
                  //       arrayFilters: [
                    //         { "q._id": questionId },
                    //         { "opt.name": selectedOption },
                    //       ],
                    //     },
                    //   });
                    // });
                    
                    // await Quizz.bulkWrite(bulk);
                    // const { quizId, questionId } = req.params;
                    const { selectedOption, quizId, questionId } = req.body;
                    // console.log(selectedOption,quizId,questionId)
                    // const quiz = await Quizz.findById(quizId);
                    
                    // for (const level of quiz.questions) {
                      //   const question = level.que.find(q => q._id.toString() === questionId);
                      //   if (question) {
                        //     const option = question.option.find(o => o.name === selectedOption);
                        //     if (option) {
                          //       option.count += 1;
                          //       await quiz.save();
                          //       return res.json({ status: true, message: "Count incremented via fallback" });
                          //     }
                          //   }
                          // }
                          
                          await Quizz.updateOne(
                            {
                              _id: quizId,
                              'questions.que._id': questionId,
                            },
                            {
                              $inc: {
                                'questions.$[].que.$[q].option.$[o].count': 1,
                              },
                            },
                            {
                              arrayFilters: [
                                { 'q._id': new mongoose.Types.ObjectId(questionId) },
                                { 'o.name': selectedOption },
                              ],
                            },
                          );
                          return response.success(res, { message: 'Quizz updated successfully' });
                        } catch (error) {
                          return response.error(res, error);
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

};
