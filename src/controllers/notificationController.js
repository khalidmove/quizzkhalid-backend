const mongoose = require("mongoose");
// const { sendPerticularUser } = require("../services/firebaseNotification");
const Notification = mongoose.model("Notification");

const response = require('../responses');
// const Notification = require('@models/Notification');

module.exports = {
  create: async (req, res) => {
    try {
      let payload = req.body;
      console.log(payload);
      let notify = new Notification(payload);
      let t = await notify.save();
      let title = { title: payload.notification };
      // await sendPerticularUser("Broadcast", title, payload.users);
      return response.success(res, { message: "Notification sent" });
    } catch (err) {
      console.log(err);
      return response.error(res, err);
    }
  },

  getNoti: async (req, res) => {
    try {
      let tic = await Notification.find();
      return response.success(res, tic);
    } catch (err) {
      console.log(err);
      response.error(res, err);
    }
  },

  createNotification: async (req, res) => {
    try {
      const usertype = req.body.userType;
      const notification = req.body.notification;
      // Create blogs in db

      const notify = new Notification({
        userType: usertype,
        notification: notification,

        // posteddate: new Date()
      });
      const noti = await notify.save();
      return res.status(201).json({
        success: true,
        message: "Data Saved successfully!",
        data: noti,
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  getNotification: async (req, res) => {
    try {
      if (req && req.body && req.body.role == "ADMIN") {
        //How this line is working need to ask from chetan
        const notifications = await Notification.find({});

        res.status(200).json({
          success: true,
          message: "Fetched all notification successfully",
          notificationList: notifications,
        });
      } else {
        const notifications = await Notification.find({
          $or: [{ userType: "All" }, { userType: req.body.userType }],
        });
        res.status(200).json({
          success: true,
          message: "Fetched all notification successfully",
          notificationList: notifications,
        });
      }
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  deletenotification: async (req, res) => {
    try {
      // if (req) {
      //     if (req.body.notificationId) {
      //         const notificationID = req.body.notificationId;
      //         await Notification.deleteOne({ _id: notificationID });
      //         res.status(200).json({
      //             success: true,
      //             message: "Notification Deleted Successfuly!!",
      //         })
      //     } else {
      //         res.status(404).json({
      //             success: false,
      //             message: "Not found notificationId",
      //         })
      //     }
      // } else {
      await Notification.deleteMany({});
      res.status(200).json({
        success: true,
        message: "Notification Deleted Successfuly!!",
      });
      // }
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },
};
