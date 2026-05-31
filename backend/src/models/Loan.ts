import { Schema, model, Document, Types } from 'mongoose';

export type LoanStatus = 'APPLIED' | 'SANCTIONED' | 'DISBURSED' | 'REJECTED' | 'CLOSED';

export interface ILoan {
  borrowerId: Types.ObjectId;
  loanAmount: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  outstandingAmount: number;
  status: LoanStatus;
  approvedBy?: Types.ObjectId;
  rejectedBy?: Types.ObjectId;
  reason?: string;
  disbursementDate?: Date;
  disbursedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoanDocument extends ILoan, Document {}

const LoanSchema = new Schema<ILoanDocument>(
  {
    borrowerId: {
      type: Schema.Types.ObjectId,
      ref: 'Borrower',
      required: [true, 'Borrower reference is required'],
    },
    loanAmount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [1000, 'Loan amount must be at least 1,000'],
    },
    tenureDays: {
      type: Number,
      required: [true, 'Tenure in days is required'],
      min: [7, 'Tenure must be at least 7 days'],
    },
    interestRate: {
      type: Number,
      required: [true, 'Interest rate is required'],
      min: [0, 'Interest rate cannot be negative'],
    },
    simpleInterest: {
      type: Number,
      required: [true, 'Simple interest is required'],
    },
    totalRepayment: {
      type: Number,
      required: [true, 'Total repayment is required'],
    },
    outstandingAmount: {
      type: Number,
      required: [true, 'Outstanding amount is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['APPLIED', 'SANCTIONED', 'DISBURSED', 'REJECTED', 'CLOSED'],
        message: '{VALUE} is not a valid loan status',
      },
      default: 'APPLIED',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: {
      type: String,
    },
    disbursementDate: {
      type: Date,
    },
    disbursedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Loan = model<ILoanDocument>('Loan', LoanSchema);
