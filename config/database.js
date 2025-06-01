const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        console.log('Continuing without database connection...');
        // Don't exit the process, allow the app to run without DB for now
    }
};

module.exports = connectDB;