const { ObjectId } = require("mongodb");

class TaskModel {
  constructor(database) {
    this.db = database;
    this.collection = "tasks";
  }

  // Create indexes for performance
  async createIndexes() {
    const tasksCollection = this.db.collection(this.collection);
    await tasksCollection.createIndex({ userId: 1 });
    await tasksCollection.createIndex({ status: 1 });
    await tasksCollection.createIndex({ dueDate: 1 });
  }

  // Create new task
  async create(taskData) {
    const task = {
      userId: new ObjectId(taskData.userId),
      title: taskData.title,
      description: taskData.description || "",
      status: taskData.status || "todo",
      priority: taskData.priority || "medium",
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.db.collection(this.collection).insertOne(task);
    return { ...task, _id: result.insertedId };
  }

  // Find all tasks for a user with optional filters
  async findByUserId(userId, filters = {}) {
    const query = { userId: new ObjectId(userId) };

    // Add filters
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.search) {
      query.title = { $regex: filters.search, $options: "i" }; // case-insensitive
    }

    // Sorting
    const sort = {};
    if (filters.sortBy === "dueDate") sort.dueDate = 1;
    else if (filters.sortBy === "priority") {
      // Custom priority order: high > medium > low
      sort.priority = -1;
    } else {
      sort.createdAt = -1; // default: newest first
    }

    return await this.db
      .collection(this.collection)
      .find(query)
      .sort(sort)
      .toArray();
  }

  // Find single task by ID (ensure ownership)
  async findById(taskId, userId) {
    return await this.db.collection(this.collection).findOne({
      _id: new ObjectId(taskId),
      userId: new ObjectId(userId),
    });
  }

  // Update task
  async update(taskId, userId, updateData) {
    const allowedUpdates = [
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
    ];
    const updates = {};

    // Only allow specific fields
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] =
          field === "dueDate" ? new Date(updateData[field]) : updateData[field];
      }
    });

    updates.updatedAt = new Date();

    const result = await this.db
      .collection(this.collection)
      .findOneAndUpdate(
        { _id: new ObjectId(taskId), userId: new ObjectId(userId) },
        { $set: updates },
        { returnDocument: "after" },
      );

    return result.value;
  }

  // Delete task
  async delete(taskId, userId) {
    const result = await this.db.collection(this.collection).deleteOne({
      _id: new ObjectId(taskId),
      userId: new ObjectId(userId),
    });

    return result.deletedCount > 0;
  }
}

module.exports = TaskModel;
