import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: 'admin' | 'viewer';
}

const UserSchema = new Schema<IUser>(
  {
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name:         { type: String, required: true },
    role:         { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
