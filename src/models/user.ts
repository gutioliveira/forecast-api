import mongoose, { Document, Model } from "mongoose";
import bcrypt from 'bcrypt';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

export async function hashPassword(password: string, salt = 10): Promise<string> {
  return await bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

const schema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
          validator: function(v: string) {
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          },
          message: "{VALUE} is not a valid email"
      },
      required: true,
    },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
    }
  }
);

schema.pre<UserModel>('save', async function(): Promise<void> {
  if (!this.password || !this.isModified('password')){
    return;
  }
  try {
    const hashedPassword = await hashPassword(this.password);
    this.password = hashedPassword;
  } catch(e){
    console.error(`Failed to hash password for user ${this.name}`);
  }
});

interface UserModel extends Omit<User, '_id'>, Document {}

export const User: Model<UserModel> = mongoose.model<UserModel>('User', schema);