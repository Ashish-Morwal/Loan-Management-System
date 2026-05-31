import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'ADMIN' | 'SALES' | 'SANCTION' | 'DISBURSEMENT' | 'COLLECTION' | 'BORROWER';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['ADMIN', 'SALES', 'SANCTION', 'DISBURSEMENT', 'COLLECTION', 'BORROWER'],
        message: '{VALUE} is not a valid role',
      },
      default: 'BORROWER',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to hash the password
UserSchema.pre<IUserDocument>('save', async function (next) {
  // Only hash password if it was modified (or is new)
  if (!this.isModified('password')) return next();

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUserDocument>('User', UserSchema);
