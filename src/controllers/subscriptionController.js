const response = require("../responses");
const mongoose = require("mongoose");
// const Subscription = mongoose.model("Subscription");
const Subscription = require("../models/subscription");
const subscription = require("../models/subscription");

module.exports = {
  create: async (req, res) => {
    try {
      const payload = {
        ...req.body,
      };
      // console.log(payload);
      let faq = new Subscription(payload);
      await faq.save();
      return response.success(res, { message: "Subscription Created", subscriptions:faq });
    } catch (error) {
      console.log(error);
      return response.error(res, error);
    }
  },

  delete: async (req, res) => {
    try {
      await Subscription.findByIdAndDelete(req.params.id);
      return response.success(res, { message: "Subscription Deleted" });
    } catch (error) {
      console.log(error);
      return response.error(res, error);
    }
  },

  update: async (req, res) => {
    try {
      console.log(req.params);
      await Subscription.findByIdAndUpdate(req.params.id, req.body);
      return response.success(res, { message: "Subscription updated" });
    } catch (error) {
      console.log(error);
      return response.error(res, error);
    }
  },

  getActiveSubscription: async (req, res) => {
    try {
      const data = await Subscription
        .find({ status: "Active" })
        .sort({ period: 1 });
      return response.success(res, data);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getFAQ: async (req, res) => {
    try {
      const data = await Subscription.find().sort({ period: 1 });
      return response.success(res, data);
    } catch (error) {
      return response.error(res, error);
    }
  },

  changestatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await Subscription.findByIdAndUpdate(id, { $set: { status } });

      return response.success(res, { message: "Subscription updated" });
    } catch (error) {
      console.log(error);
      return response.error(res, error);
    }
  },

changeAllStatus: async (req, res) => {
  try {
    const status = req.body.status;

    console.log(status);

    if (typeof status !== "string") {
      return response.error(res, { message: "Status must be a string" });
    }

    await Subscription.updateMany({}, { $set: { status } });
    return response.success(res, { message: "All Subscription updated" });
  } catch (error) {
    console.log(error);
    return response.error(res, error);
  }
}

};
