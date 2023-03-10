import AuthService from "@src/services/auth";
import mongoose, { Document, Model } from "mongoose";

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
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
    const hashedPassword = await AuthService.hashPassword(this.password);
    this.password = hashedPassword;
  } catch(e){
    console.error(`Failed to hash password for user ${this.name}`);
  }
});

interface UserModel extends Omit<User, '_id'>, Document {}

export const User: Model<UserModel> = mongoose.model<UserModel>('User', schema);