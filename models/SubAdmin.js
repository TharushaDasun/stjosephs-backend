const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SubAdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    permissions: {
        type: [String],
        enum: ['gallery', 'events', 'videos'],
        default: ['gallery', 'events'],
    },
    active: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: String,
        default: 'main_admin',
    },
    lastLogin: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving
SubAdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
SubAdminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('SubAdmin', SubAdminSchema);
