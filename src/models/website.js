const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    pages: [{
        path: {
            type: String,
            required: true
        },
        title: {
            type: String
        },
        content: {
            type: String
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
websiteSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Website = mongoose.model('Website', websiteSchema);

module.exports = Website;