const JwtUtil = require("../utils/jwt");
const Validator = require("../utils/validator");
const ResponseUtil = require("../utils/response");

class AuthService {
  constructor(userModel) {
    this.userModel = userModel;
  }

  // Register new user
  async register(userData) {
    const { email, password, name } = userData;

    // Validate required fields
    const missing = Validator.hasRequiredFields(userData, [
      "email",
      "password",
      "name",
    ]);
    if (missing) {
      return ResponseUtil.validationError({ missing });
    }

    // Validate email format
    if (!Validator.isValidEmail(email)) {
      return ResponseUtil.validationError({ email: "Invalid email format" });
    }

    // Validate password strength
    if (!Validator.isValidPassword(password)) {
      return ResponseUtil.validationError({
        password:
          "Password must be at least 6 characters with letter and number",
      });
    }

    // Check if user already exists
    const existingUser = await this.userModel.findByEmail(email);
    if (existingUser) {
      return ResponseUtil.error("Email already registered", 409);
    }

    // Create user
    const user = await this.userModel.create({
      email: Validator.sanitizeString(email),
      password,
      name: Validator.sanitizeString(name),
    });

    // Generate token
    const token = JwtUtil.generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    return ResponseUtil.success(
      { user, token },
      "User registered successfully",
      201,
    );
  }

  // Login user
  async login(credentials) {
    const { email, password } = credentials;

    // Validate required fields
    const missing = Validator.hasRequiredFields(credentials, [
      "email",
      "password",
    ]);
    if (missing) {
      return ResponseUtil.validationError({ missing });
    }

    // Find user
    const user = await this.userModel.findByEmail(email);
    if (!user) {
      return ResponseUtil.unauthorized("Invalid email or password");
    }

    // Check password
    const isPasswordValid = await this.userModel.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      return ResponseUtil.unauthorized("Invalid email or password");
    }

    // Generate token
    const token = JwtUtil.generateToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return ResponseUtil.success(
      { user: userWithoutPassword, token },
      "Login successful",
    );
  }

  // Verify token and get user
  async verifyUser(token) {
    const decoded = JwtUtil.verifyToken(token);

    if (!decoded) {
      return ResponseUtil.unauthorized("Invalid or expired token");
    }

    const user = await this.userModel.findById(decoded.userId);
    if (!user) {
      return ResponseUtil.unauthorized("User not found");
    }

    const { password: _, ...userWithoutPassword } = user;
    return ResponseUtil.success(userWithoutPassword);
  }
}

module.exports = AuthService;
