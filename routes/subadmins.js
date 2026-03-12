const express = require('express');
const router = express.Router();
const SubAdmin = require('../models/SubAdmin');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/auth');

// All routes here — main admin only (protect middleware rejects sub tokens)

// @route   GET /api/subadmins
// @desc    Get all sub admins
// @access  Private (main admin)
router.get('/', protect, async (req, res) => {
    try {
        const subs = await SubAdmin.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: subs.length, data: subs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/subadmins
// @desc    Create a sub admin
// @access  Private (main admin)
router.post('/', protect, async (req, res) => {
    try {
        const { username, password, permissions } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
        }

        const exists = await SubAdmin.findOne({ username });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Username already taken.' });
        }

        const sub = await SubAdmin.create({
            username,
            password,
            permissions: permissions || ['gallery', 'events'],
            createdBy: req.admin.username,
        });

        await ActivityLog.create({
            user: req.admin.username, role: 'main', type: 'edit',
            category: 'edit', details: `Sub admin created: ${username} [${(permissions || ['gallery','events']).join(', ')}]`,
        });

        res.status(201).json({
            success: true,
            data: { id: sub._id, username: sub.username, permissions: sub.permissions, active: sub.active, createdAt: sub.createdAt },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   PUT /api/subadmins/:id
// @desc    Update sub admin (permissions, active status, password)
// @access  Private (main admin)
router.put('/:id', protect, async (req, res) => {
    try {
        const sub = await SubAdmin.findById(req.params.id);
        if (!sub) return res.status(404).json({ success: false, message: 'Sub admin not found.' });

        const { permissions, active, password } = req.body;

        if (permissions !== undefined) sub.permissions = permissions;
        if (active !== undefined)     sub.active = active;
        if (password) {
            if (password.length < 6) return res.status(400).json({ success: false, message: 'Password min 6 chars.' });
            sub.password = password;
        }

        await sub.save();

        await ActivityLog.create({
            user: req.admin.username, role: 'main', type: 'edit',
            category: 'edit',
            details: `Sub admin updated: ${sub.username}` + (active !== undefined ? ` (${active ? 'enabled' : 'disabled'})` : ''),
        });

        res.json({ success: true, data: { id: sub._id, username: sub.username, permissions: sub.permissions, active: sub.active } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   DELETE /api/subadmins/:id
// @desc    Delete sub admin
// @access  Private (main admin)
router.delete('/:id', protect, async (req, res) => {
    try {
        const sub = await SubAdmin.findById(req.params.id);
        if (!sub) return res.status(404).json({ success: false, message: 'Sub admin not found.' });

        const name = sub.username;
        await sub.deleteOne();

        await ActivityLog.create({
            user: req.admin.username, role: 'main', type: 'delete',
            category: 'delete', details: `Sub admin deleted: ${name}`,
        });

        res.json({ success: true, message: `${name} deleted.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
