import { AuthService } from '@src/services/auth';
import mongoose, { Document, Model } from 'mongoose';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password: string;
}

const schema = new mongoose.Schema<User>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: [true, 'Email already in use'],
      validate: {
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Email is not valid',
      },
    },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

schema.pre<User & Document>('save', async function (): Promise<void> {
  if (!this.password || !this.isModified('password')) {
    return;
  }
  try {
    const hashedPassword = await AuthService.encryptPassword(this.password);
    this.password = hashedPassword;
  } catch (e) {
    console.error(
      `Error when trying to hash the password for the user ${this.name}`
    );
  }
});

export const User: Model<User> = mongoose.model('User', schema);
