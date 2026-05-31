import { Schema, model, Document, Types } from 'mongoose';

export interface IPayment {
  loanId: Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPaymentDocument extends IPayment, Document {}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    loanId: {
      type: Schema.Types.ObjectId,
      ref: 'Loan',
      required: [true, 'Loan reference is required'],
    },
    utrNumber: {
      type: String,
      required: [true, 'UTR number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be at least 1'],
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = model<IPaymentDocument>('Payment', PaymentSchema);
