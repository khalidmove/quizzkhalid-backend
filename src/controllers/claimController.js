const mongoose = require("mongoose");
const ClaimReward = require('@models/claimReward');
const response = require("../responses");

module.exports = {

  getClaimReward: async (req, res) => {
    try {
      // Pagination
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      let skip = (page - 1) * limit;
      const reqlist = await ClaimReward.find({req_user:req.user.id})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

        return response.success(res, reqlist);
    } catch (error) {
      return response.error(res, error);
    }
  },
  getPendingClaimReward: async (req, res) => {
    try {
      // Pagination
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      let skip = (page - 1) * limit;
      const cond = {status:'Pending'};
      const reqlist = await ClaimReward.find(cond)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("req_user","-password -token");
      const total = await ClaimReward.countDocuments(cond);
      const totalPages = Math.ceil(total / limit);
      return res.status(200).json({
        status: true,
        data: reqlist,
        pagination: {
          totalItems: total,
          totalPages: totalPages,
          currentPage: page,
          itemsPerPage: limit,
        },
      });
    } catch (error) {
      return response.error(res, error);
    }
  },
  getClaimRewardByUser: async (req, res) => {
    const id = req.params.id;
    const limit = parseInt(req.query.limit) || 10;
    if (!id) {
      return response.error(res, "User ID is required");
    }
    try {
      const reqlist = await ClaimReward.find({ req_user: id })
        .sort({
          createdAt: -1,
        })
        .limit(limit);
      return response.success(res, reqlist);
    } catch (e) {
      return response.error(res, e);
    }
  },
  getAllClaimReward: async (req, res) => {
    try {
      const reqlist = await ClaimReward.find().sort({
        createdAt: -1,
      });
      return response.success(res, reqlist);
    } catch (error) {
      return response.error(res, error);
    }
  },

  updateClaimReward: async (req, res) => {
    try {
       await ClaimReward.findByIdAndUpdate(req?.params?.id, {
        $set: { status: "Approved" },
      });


      return response.success(res, { message: "Status update succesfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },
};
