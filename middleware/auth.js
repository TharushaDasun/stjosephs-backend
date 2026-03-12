const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const SubAdmin = require('../models/SubAdmin');

// ── protect: main admin only ──────────────────────────────────
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized. No token.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Reject sub-admin tokens from main-admin-only routes
        if (decoded.role === 'sub') {
            return res.status(403).json({ success: false, message: 'Sub admins cannot access this resource.' });
        }

        req.admin = await Admin.findById(decoded.id).select('-password');
        if (!req.admin) {
            return res.status(401).json({ success: false, message: 'Admin not found.' });
        }
        req.admin.role = 'main';
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized. Invalid token.' });
    }
};

// ── protectAny: main admin OR sub-admin with required permission ──
const protectAny = (permission) => async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized. No token.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role === 'sub') {
            const sub = await SubAdmin.findById(decoded.id).select('-password');
            if (!sub || !sub.active) {
                return res.status(401).json({ success: false, message: 'Sub admin not found or disabled.' });
            }
            if (permission && !sub.permissions.includes(permission)) {
                return res.status(403).json({ success: false, message: `No permission: ${permission}` });
            }
            req.admin = {
                _id: sub._id,
                username: sub.username,
                role: 'sub',
                permissions: sub.permissions,
            };
            return next();
        }

        // Main admin
        req.admin = await Admin.findById(decoded.id).select('-password');
        if (!req.admin) {
            return res.status(401).json({ success: false, message: 'Admin not found.' });
        }
        req.admin.role = 'main';
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Not authorized. Invalid token.' });
    }
};

module.exports = { protect, protectAny };
