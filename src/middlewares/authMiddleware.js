const passport = require("passport");
const User = require('@models/User');

module.exports = function authMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    passport.authenticate("jwt", { session: false }, async(err, user) => {
      // console.log('fffdfsdbsfsbf', user, allowedRoles)
      if (err || !user) return res.status(401).json({ message: "Unauthorized" });
      
      const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        const dbUser = await User.findById(user._id).select("token role");
        if (!dbUser || dbUser.token !== token) {
          return res.status(401).json({ message: "Session expired. Please login again." });
        }
      
        if (allowedRoles.length && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user = user;
      next();
    })(req, res, next);
  };
};
