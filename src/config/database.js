const { MongoClient } = require("mongodb");
const config = require("./env");

class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      this.client = new MongoClient(config.mongodb.uri);
      await this.client.connect();
      this.db = this.client.db();
      console.log("✅ MongoDB connected successfully");
      return this.db;
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      process.exit(1); // Exit if DB fails
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error("Database not initialized. Call connect() first.");
    }
    return this.db;
  }

  async close() {
    if (this.client) {
      await this.client.close();
      console.log("MongoDB connection closed");
    }
  }
}

// Export singleton instance
module.exports = new Database();
