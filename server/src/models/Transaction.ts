import { Schema, model, Document } from 'mongoose';

export interface ITransaction extends Document {
  id: number;
  date: Date;
  amount: number;
  category: 'Revenue' | 'Expense';
  status: 'Paid' | 'Pending' | 'Failed';
  user_id: string;
  user_profile: string;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    id:           { type: Number, required: true, unique: true },
    date:         { type: Date,   required: true },
    amount:       { type: Number, required: true },
    category:     { type: String, enum: ['Revenue', 'Expense'], required: true },
    status:       { type: String, enum: ['Paid', 'Pending', 'Failed'], required: true },
    user_id:      { type: String, required: true, index: true },
    user_profile: { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes for common query patterns
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ category: 1, status: 1 });
TransactionSchema.index({ amount: 1 });

export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
