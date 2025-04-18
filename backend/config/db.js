const mongoose = require('mongoose');

const connectDB = async (retries = 3, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI); // No deprecated options
      console.log("✅ MongoDB connected successfully.");
      return;
    } catch (error) {
      console.error(`❌ Error connecting to MongoDB (Attempt ${i + 1}/${retries}):`, error);
      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error("❌ Failed to connect to MongoDB after multiple attempts");
        process.exit(1);
      }
    }
  }
};


module.exports = connectDB;
