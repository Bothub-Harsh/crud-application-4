const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/todo_application';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] Standard connection to ${mongoURI} failed (${error.message}). Attempting embedded MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`[MongoDB] Embedded MongoMemoryServer connected at: ${uri}`);
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB] Critical connection error: ${memErr.message}`);
      throw memErr;
    }
  }
};

module.exports = connectDB;

