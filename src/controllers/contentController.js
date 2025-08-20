const Content = require("@models/Content");
const response = require("../responses");
// const mongoose = require("mongoose");
// const Content = mongoose.model("Content");


module.exports = {
  createContent: async (req, res) => {
    try {
      const payload = {
        ...req.body,
      };
      if (payload.id) {
        let updatedData = await Content.findByIdAndUpdate(payload.id, payload, {
          new: true,
          upsert: true,
        });
        return response.success(res, {
          message: "Content Updated",
          content: updatedData,
        });
      } else {
        let content = new Content(payload);
        await content.save();
        return response.success(res, { message: "Content Created", content });
      }
    } catch (error) {
      console.log(error);
      return response.error(res, error);
    }
  },

  getContent: async (req, res) => {
    try {
      const data = await Content.findOne();
      return response.success(res, data);
    } catch (error) {
      return response.error(res, error);
    }
  },

};
