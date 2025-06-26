const Questions = require('@models/Questions');
const response = require('../responses');
const Quizz = require('@models/Quizz');


module.exports = {
    create: async (req, res) => {
        try {
            const payload = req.body;
            const quizz = new Quizz(payload);
            const quiz = await quizz.save();
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
}