import { Schema, model, Document } from 'mongoose';

export type EmploymentMode = 'Salaried' | 'SelfEmployed' | 'Unemployed';

export interface IBorrower {
  user: Schema.Types.ObjectId;
  fullName: string;
  pan: string;
  dob: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  salarySlipPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBorrowerDocument extends IBorrower, Document {}

const BorrowerSchema = new Schema<IBorrowerDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    pan: {
      type: String,
      required: [true, 'PAN card number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN card number (e.g., ABCDE1234F)'],
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    monthlySalary: {
      type: Number,
      required: [true, 'Monthly salary is required'],
      min: [0, 'Monthly salary cannot be negative'],
    },
    employmentMode: {
      type: String,
      enum: {
        values: ['Salaried', 'SelfEmployed', 'Unemployed'],
        message: '{VALUE} is not a valid employment mode',
      },
      required: [true, 'Employment mode is required'],
    },
    salarySlipPath: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Borrower = model<IBorrowerDocument>('Borrower', BorrowerSchema);
