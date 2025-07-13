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
            const levels = await Questions.distinct("type", { category: payload.category });
            const lastitem = levels[levels.length - 1]
            const facets = {};
            levels.forEach(level => {
                facets[level] = [
                    {
                        $match: {
                            type: level,
                            category: payload.category,
                            ...(level !== lastitem && { status: { $ne: 'used' } }) // Skip status filter for Level-5
                        }
                    },
                    {
                        $sample: { size: Number(payload.limit) }
                    }
                ];
            });

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

            return response.success(res, quiz);
        } catch (error) {
            return response.error(res, error);
        }
    },
}