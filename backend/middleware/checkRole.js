function checkRole(...allowedRoles) {
  return (req, res, next) => {
    const roleMap = {
      1: "Admin",
      2: "Farmer",
      3: "Processor",
      4: "Distributor",
      5: "Retailer",
    };

    const userRole = roleMap[req.user.role_id];

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${userRole || "Unknown"}`,
      });
    }

    next();
  };
}

module.exports = checkRole;