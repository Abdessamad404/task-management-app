const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

class UserModel {
  constructor(database) {
    this.db = database;
    this.collection = "users";
  }

  // Create indexes for performance
  async createIndexes() {
    const usersCollection = this.db.collection(this.collection);
    await usersCollection.createIndex({ email: 1 }, { unique: true });
  }

  // Create new user
  async create(userData) {
    const { email, password, name } = userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      createdAt: new Date(),
    };

    const result = await this.db.collection(this.collection).insertOne(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, _id: result.insertedId };
  }

  // Find user by email
  async findByEmail(email) {
    return await this.db.collection(this.collection).findOne({
      email: email.toLowerCase(),
    });
  }

  // Find user by ID
  async findById(userId) {
    return await this.db.collection(this.collection).findOne({
      _id: new ObjectId(userId),
    });
  }

  // Compare password
  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserModel;
