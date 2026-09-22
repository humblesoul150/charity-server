const jwt = require("jsonwebtoken");

const permissions = {
  admin: new Set([
    "dashboard.view",
    "children.view",
    "children.manage",
    "sponsorships.view",
    "sponsorships.manage",
    "staff.view",
    "staff.manage",
    "blogs.view",
    "blogs.manage",
    "events.view",
    "events.manage",
    "gallery.view",
    "gallery.manage",
    "content.view",
    "content.manage",
    "messages.view",
    "messages.manage",
    "data.export",
    "users.manage",
  ]),
  blogger: new Set([
    "dashboard.view",
    "blogs.view",
    "blogs.manage",
    "events.view",
    "events.manage",
    "gallery.view",
    "gallery.manage",
    "data.export",
  ]),
  viewer: new Set([
    "dashboard.view",
    "children.view",
    "sponsorships.view",
    "staff.view",
    "blogs.view",
    "events.view",
    "gallery.view",
    "content.view",
    "messages.view",
    "data.export",
  ]),
};

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    const role = String(req.admin?.role || "").toLowerCase();
    if (!permissions[role] || !permissions[role].has(permission)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    return next();
  };
}

module.exports = { requireAuth, requirePermission };
