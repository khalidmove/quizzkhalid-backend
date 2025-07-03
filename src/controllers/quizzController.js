const Questions = require('@models/Questions');
const response = require('../responses');
const Quizz = require('@models/Quizz');


module.exports = {
    create: async (req, res) => {
        try {
            const payload = req.body;
            const quizz = new Quizz(payload);
            const quiz = await quizz.save();
            await Questions.updateMany({ _id: { $in: payload.questionIdList } },
                { $set: { status: 'used' } })
            return response.success(res, quiz);
        } catch (error) {
            return response.error(res, error);
        }
    },



    update: async (req, res) => {
        try {
            const payload = req.body;
            const que = await Quizz.findByIdAndUpdate(payload.id, payload, { new: true, upsert: true });
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
    fetchBackupQuestion: async (req, res) => {
        try {
            let backupKey = 'Backup Questions'
            let que = await Quizz.findById(req.params.id);
            const hasBackupQuestion = que.questions.find(f => f.level === backupKey)
            if (hasBackupQuestion && hasBackupQuestion.que.length > 0) {
                return response.success(res, que);
            }
            const levels = await Questions.distinct("type", { category: que.category });
            const lastitem = levels[levels.length - 1]

            let limit = 10
            const facets = {};
            facets[backupKey] = [
                {
                    $match: {
                        type: lastitem,
                        category: que.category,
                        status: { $ne: 'used' }  // Skip status filter for Level-5
                    }
                },
                {
                    $sample: { size: limit }
                }
            ];

            const quiz = await Questions.aggregate([
                {
                    $facet: facets
                },
                {
                    $project: {
                        data: {
                            $map: {
                                input: { $objectToArray: "$$ROOT" },
                                as: "item",
                                in: {
                                    level: "$$item.k",
                                    que: "$$item.v"
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: "$data"
                },
                {
                    $replaceRoot: { newRoot: "$data" }
                }
            ]);
            let questionIdArray = []
            quiz.map(item => {
                questionIdArray = questionIdArray.concat(item.que.map(q => q._id))
            })
            console.log(questionIdArray)
            await Questions.updateMany({ _id: { $in: questionIdArray } },
                { $set: { status: 'used' } })
            que.questions.push(quiz[0])
            await que.save()
            return response.success(res, que);
        } catch (error) {
            return response.error(res, error);
        }
    },
}