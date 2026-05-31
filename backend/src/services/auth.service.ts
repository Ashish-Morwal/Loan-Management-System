import jwt, { SignOptions } from 'jsonwebtoken';
import { User, IUser, IUserDocument } from '../models/User';
import { AppError } from '../utils/appError';
import { config } from '../config/env';

interface UserJson extends Partial<IUser> {
  _id?: unknown;
  id?: string;
  __v?: number;
  password?: string;
}

interface AuthResponse {
  user: Omit<IUser, 'password'> & { id: string };
  token: string;
}

export class AuthService {
  /**
   * Register a new user.
   */
  public static async registerUser(userData: Partial<IUser>): Promise<AuthResponse> {
    const { name, email, password, role } = userData;

    if (!name || !email || !password) {
      throw new AppError('Name, email, and password are required', 400);
    }

    // 1. Check if email is unique
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    // 2. Validate password strength
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new AppError(
        'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)',
        400
      );
    }

    // 3. Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      role: role || 'BORROWER',
    });

    // 4. Generate JWT Token
    const token = this.generateToken(newUser);

    // Formulate response user data (without password)
    const userJson = newUser.toJSON() as UserJson;
    delete userJson.password;
    userJson.id = newUser._id.toString();
    delete userJson._id;
    delete userJson.__v;

    return {
      user: userJson as Omit<IUser, 'password'> & { id: string },
      token,
    };
  }

  /**
   * Log in an existing user.
   */
  public static async loginUser(credentials: Partial<IUser>): Promise<AuthResponse> {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // 1. Find user by email and select the password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Incorrect email or password', 401);
    }

    // 2. Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    // 3. Compare passwords
    const isCorrectPassword = await user.comparePassword(password);
    if (!isCorrectPassword) {
      throw new AppError('Incorrect email or password', 401);
    }

    // 4. Generate JWT Token
    const token = this.generateToken(user);

    // Formulate response user data (without password)
    const userJson = user.toJSON() as UserJson;
    delete userJson.password;
    userJson.id = user._id.toString();
    delete userJson._id;
    delete userJson.__v;

    return {
      user: userJson as Omit<IUser, 'password'> & { id: string },
      token,
    };
  }

  /**
   * Generate a JWT access token for a user.
   */
  private static generateToken(user: IUserDocument): string {
    const options: SignOptions = {
      expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
    };
    return jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      options
    );
  }
}
