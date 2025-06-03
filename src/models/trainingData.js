const mongoose = require('mongoose');

const trainingDataSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    source: {
        type: String,
        default: 'User Upload'
    },
    fileType: {
        type: String,
        default: 'json'
    },
    originalFileName: {
        type: String
    },
    uploadedBy: {
        type: String,
        default: 'admin'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Add text indexes for searchability
trainingDataSchema.index({ title: 'text', content: 'text', category: 'text' });

const TrainingData = mongoose.model('TrainingData', trainingDataSchema);

module.exports = TrainingData;
