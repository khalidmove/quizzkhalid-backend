const response = require('../responses');
const Category = require('@models/Category');


module.exports = {
    create: async (req, res) => {
        try {
            const payload = req.body;
            const quizz = new Category(payload);
            const quiz = await quizz.save();
            return response.success(res, quiz);
        } catch (error) {
            return response.error(res, error);
        }
    },



    update: async (req, res) => {
        try {
            const payload = req.body;
            const que = await Category.findByIdAndUpdate(payload.id, payload, { new: true, upsert: true });
            return response.success(res, que);
        } catch (error) {
            return response.error(res, error);
        }
    },

    get: async (req, res) => {
        try {
            let cond = {}
            if (req.query) {
                cond = req.query
            }
            const que = await Category.find(cond);
            return response.success(res, que);
        } catch (error) {
            return response.error(res, error);
        }
    },

    getbyId: async (req, res) => {
        try {
            const que = await Category.findById(req.params.id);
            return response.success(res, que);
        } catch (error) {
            return response.error(res, error);
        }
    },

    delete: async (req, res) => {
        try {
            const que = await Category.findByIdAndDelete(req.params.id);
            return response.success(res, { message: 'Quizz deleted successfully' });
        } catch (error) {
            return response.error(res, error);
        }
    },
}