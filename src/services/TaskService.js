const { ObjectId } = require("mongodb");
const Validator = require("../utils/validator");
const ResponseUtil = require("../utils/response");

class TaskService {
  constructor(taskModel) {
    this.taskModel = taskModel;
  }

  // Create new task
  async createTask(userId, taskData) {
    const { title, description, status, priority, dueDate } = taskData;

    // Validate required fields
    const missing = Validator.hasRequiredFields(taskData, ["title"]);
    if (missing) {
      return ResponseUtil.validationError({ missing });
    }

    // Validate status if provided
    if (status && !Validator.isValidStatus(status)) {
      return ResponseUtil.validationError({
        status: "Invalid status. Must be: todo, in-progress, or done",
      });
    }

    // Validate priority if provided
    if (priority && !Validator.isValidPriority(priority)) {
      return ResponseUtil.validationError({
        priority: "Invalid priority. Must be: low, medium, or high",
      });
    }

    // Create task
    const task = await this.taskModel.create({
      userId,
      title: Validator.sanitizeString(title),
      description: Validator.sanitizeString(description),
      status: status || "todo",
      priority: priority || "medium",
      dueDate,
    });

    return ResponseUtil.success(task, "Task created successfully", 201);
  }

  // Get all tasks for user with filters
  async getUserTasks(userId, filters = {}) {
    const tasks = await this.taskModel.findByUserId(userId, filters);
    return ResponseUtil.success(tasks, "Tasks retrieved successfully");
  }

  // Get single task
  async getTaskById(userId, taskId) {
    // Validate ObjectId format
    if (!ObjectId.isValid(taskId)) {
      return ResponseUtil.error("Invalid task ID", 400);
    }

    const task = await this.taskModel.findById(taskId, userId);

    if (!task) {
      return ResponseUtil.notFound("Task not found");
    }

    return ResponseUtil.success(task);
  }

  // Update task
  async updateTask(userId, taskId, updateData) {
    // Validate ObjectId format
    if (!ObjectId.isValid(taskId)) {
      return ResponseUtil.error("Invalid task ID", 400);
    }

    // Validate status if provided
    if (updateData.status && !Validator.isValidStatus(updateData.status)) {
      return ResponseUtil.validationError({
        status: "Invalid status. Must be: todo, in-progress, or done",
      });
    }

    // Validate priority if provided
    if (
      updateData.priority &&
      !Validator.isValidPriority(updateData.priority)
    ) {
      return ResponseUtil.validationError({
        priority: "Invalid priority. Must be: low, medium, or high",
      });
    }

    // Sanitize string fields
    if (updateData.title) {
      updateData.title = Validator.sanitizeString(updateData.title);
    }
    if (updateData.description) {
      updateData.description = Validator.sanitizeString(updateData.description);
    }

    const task = await this.taskModel.update(taskId, userId, updateData);

    if (!task) {
      return ResponseUtil.notFound("Task not found");
    }

    return ResponseUtil.success(task, "Task updated successfully");
  }

  // Delete task
  async deleteTask(userId, taskId) {
    // Validate ObjectId format
    if (!ObjectId.isValid(taskId)) {
      return ResponseUtil.error("Invalid task ID", 400);
    }

    const deleted = await this.taskModel.delete(taskId, userId);

    if (!deleted) {
      return ResponseUtil.notFound("Task not found");
    }

    return ResponseUtil.success(null, "Task deleted successfully");
  }
}

module.exports = TaskService;
