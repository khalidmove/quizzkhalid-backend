const Questions = require('@models/Questions');
const response = require('../responses');


module.exports = {
    createQuestion: async (req, res) => {
        try {
            const payload = req.body;
            const question = new Questions(payload);
            const que = await question.save();
            return response.success(res, que);
        } catch (error) {
            return response.error(res, error);
        }
    },

    createmanyQuestions: async (req, res) => {
        try {
            const payload = req.body;
            await Questions.insertMany(payload);
            return response.success(res, { message: 'Questions generated successfully' });
        } catch (error) {
            return response.error(res, error);
        }
    },

    updateQuestions: async (req, res) => {
        try {
            const payload = req.body;
            const que = await Questions.findByIdAndUpdate(payload.id, payload, { new: true, upsert: true });
            return response.success(res, que);
        } catch (error) {
            return response.error(res, error);
        }
    },

    getQuestions: async (req, res) => {
        try {
            const que = await Questions.find();
            return response.success(res, que);
        } catch (error) {
            return response.error(res, error);
        }
    },

    delete: async (req, res) => {
        try {
            const que = await Questions.findByIdAndDelete(req.params.id);
            return response.success(res, { message: 'Question deleted successfully' });
        } catch (error) {
            return response.error(res, error);
        }
    },

    fatchRandomeQuestions: async (req, res) => {
        try {
            const payload = req.body
            const qyizz = await Questions.aggregate([
                {
                    $facet: {
                        "Level-1": [
                            { $match: { type: "Level-1", category: payload.category, status: { $ne: 'used' } } },
                            { $sample: { size: Number(payload.limit) } }
                        ],
                        "Level-2": [
                            { $match: { type: "Level-2", category: payload.category, status: { $ne: 'used' } } },
                            { $sample: { size: Number(payload.limit) } }
                        ],
                        "Level-3": [
                            { $match: { type: "Level-3", category: payload.category, status: { $ne: 'used' } } },
                            { $sample: { size: Number(payload.limit) } }
                        ],
                        "Level-4": [
                            { $match: { type: "Level-4", category: payload.category, status: { $ne: 'used' } } },
                            { $sample: { size: Number(payload.limit) } }
                        ],
                        "Level-5": [
                            { $match: { type: "Level-5", category: payload.category } },
                            { $sample: { size: Number(payload.limit) } }
                        ]
                    }
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
            ])

            return response.success(res, qyizz);
        } catch (error) {
            return response.error(res, error);
        }
    },
}