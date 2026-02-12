const User = require('@models/User');
const Device = require('@models/Device');
const Verification = require('@models/Verification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const response = require("@responses/index");
const mailNotification = require('@services/mailNotification');
const userHelper = require("./../helper/user");
const claimReward = require('@models/claimReward');
const moment = require("moment");

function getTimeLeft(expiresAt) {
  const now = moment();
  const expiry = moment(expiresAt);

  if (expiry.isSameOrBefore(now)) {
    return {
      expired: true,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  const duration = moment.duration(expiry.diff(now));

  return {
    expired: false,
    hours: Math.floor(duration.asHours()),
    minutes: duration.minutes(),
    seconds: duration.seconds()
  };
}


module.exports = {
  register: async (req, res) => {
    try {
      const { name, email, password, phone, username, role } = req.body;

      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: 'Password must be at least 8 characters long' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        username,
        role
      });

      await newUser.save();

      const userResponse = await User.findById(newUser._id).select('-password');

      response.created(res, {
        message: 'User registered successfully',
        user: userResponse,
      });
    } catch (error) {
      console.error(error);
      response.error(res, error);
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Email does not exist' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Password does not match' });
      }

      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);

      user.token = token
      await user.save()
      await Device.updateOne(
        { device_token: req.body.device_token },
        { $set: { player_id: req.body.player_id, user: user._id } },
        { upsert: true }
      );
      response.success(res, {
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          avater: user.avater,
        },
      });
    } catch (error) {
      console.error(error);
      response.error(res, error);
    }
  },

  sendOTPForforgetpass: async (req, res) => {
    try {
      const email = req.body.email;
      const user = await User.findOne({ email });

      if (!user) {
        return response.badReq(res, { message: "Email does nots exist." });
      }

      let ran_otp = Math.floor(1000 + Math.random() * 9000);
      await mailNotification.sendOTPmailForSignup({
        email: email,
        code: ran_otp,
      });
      let ver = new Verification({
        user: user._id,
        otp: ran_otp,
        expiration_at: userHelper.getDatewithAddedMinutes(5),
      });
      await ver.save();
      let token = await userHelper.encode(ver._id);
      return response.success(res, { message: "OTP sent.", token });
    } catch (error) {
      return response.error(res, error);
    }
  },

  verifyOTP: async (req, res) => {
    try {
      const otp = req.body.otp;
      const token = req.body.token;
      console.log(otp, token)
      if (!(otp && token)) {
        return response.badReq(res, { message: "otp and token required." });
      }
      let verId = await userHelper.decode(token);
      let ver = await Verification.findById(verId);
      if (
        otp == ver.otp &&
        !ver.verified &&
        new Date().getTime() < new Date(ver.expiration_at).getTime()
      ) {
        let token = await userHelper.encode(
          ver._id + ":" + userHelper.getDatewithAddedMinutes(5).getTime()
        );
        ver.verified = true;
        await ver.save();
        return response.success(res, { message: "OTP verified", token });
      } else {
        return response.notFound(res, { message: "Invalid OTP" });
      }
    } catch (error) {
      return response.error(res, error);
    }
  },

  changePassword: async (req, res) => {
    try {
      const token = req.body.token;
      const password = req.body.password;
      const data = await userHelper.decode(token);
      const [verID, date] = data.split(":");
      if (new Date().getTime() > new Date(date).getTime()) {
        return response.forbidden(res, { message: "Session expired." });
      }
      let otp = await Verification.findById(verID);
      if (!otp.verified) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      let user = await User.findById(otp.user);
      if (!user) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      await Verification.findByIdAndDelete(verID);
      user.password = user.encryptPassword(password);
      await user.save();
      //mailNotification.passwordChange({ email: user.email });
      return response.success(res, { message: "Password changed! Login now." });
    } catch (error) {
      return response.error(res, error);
    }
  },
  checkPassword: async (req, res) => {
    try {
      const password = req.body.currentPassword;

      let user = await User.findById(req.user.id);
      if (!user) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      const isMatch = await user.isPasswordMatch(password);
      if (!isMatch) {
        return response.forbidden(res, { message: "Incorrect password" });
      }
      return response.success(res, { message: "Password is correct" });
    } catch (error) {
      return response.error(res, error);
    }
  },
  changePasswordFromAccount: async (req, res) => {
    try {
      const password = req.body.password;

      let user = await User.findById(req.user.id);
      if (!user) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      user.password = user.encryptPassword(password);
      await user.save();
      //mailNotification.passwordChange({ email: user.email });
      return response.success(res, { message: "Password changed!" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getprofile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id, '-password');
      return response.success(res, user);
    } catch (error) {
      return response.error(res, error);
    }
  },
  getpoints: async (req, res) => {
  try {
  const userId = req.user.id;
  const now = new Date();
  const onlyPoints = req.query.onlyPoints === 'true';

  let user = await User.findById(userId).lean();

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // CLEAN EXPIRED REWARDS (DEFAULT)

  if (!onlyPoints && user.rewards?.length) {
    const expiredRewards = user.rewards.filter(
      r => new Date(r.expiresAt) <= now
    );

    if (expiredRewards.length) {
      const expiredPoints = expiredRewards.reduce(
        (sum, r) => sum + r.points,
        0
      );

      await User.updateOne(
        { _id: userId },
        {
          $inc: { points: -expiredPoints },
          $pull: { rewards: { expiresAt: { $lte: now } } }
        }
      );

      user = await User.findById(userId).lean();
    }
  }

  // BUILD RESPONSE

  const rewards = onlyPoints
    ? []
    : (user.rewards || []).map(r => ({
        points: r.points,
        expiresAt: r.expiresAt,
        createdAt: r.createdAt,
        timeLeft: getTimeLeft(r.expiresAt)
      }));

  return res.json({
    success: true,
    totalPoints: user.points,
    rewards
  });

} catch (err) {
  console.error(err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong'
  });
}

  },

  claimReward: async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Create claim request
      const claim = new claimReward({
        req_user: userId,
        points: user.points,
        status: 'Pending'
      });

      await claim.save();
await User.updateOne(
    { _id: userId },
    {
      $set: { points: 0 },
      $pull: { rewards: {} } // remove all
    }
  );
      return res.json({ success: true, message: 'Reward claim request submitted successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Something went wrong' });
    }
  },

  updateprofile: async (req, res) => {
    try {
      const payload = req.body
      const user = await User.findByIdAndUpdate(req.user.id, payload, { new: true, upsert: true });
      return response.success(res, user);
    } catch (error) {
      return response.error(res, error);
    }
  },
  fileUpload: async (req, res) => {
    try {
      // console.log('AAAAAAA', req?.file);
      // console.log('BBBBBB', req?.file?.key);
      let key = req.file && req.file.key;
      console.log('DDDDDD', key)
      return response.success(res, {
        message: "File uploaded.",
        file: `${process.env.ASSET_ROOT}/${key}`,
      });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getUser: async (req, res) => {
    try {
      let user = await User.find()
      return response.success(res, user);
    } catch (err) {
      console.log(err);
      response.error(res, err);
    }
  },
};
