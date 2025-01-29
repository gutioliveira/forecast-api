import bcrypt from 'bcrypt';
import mongoose, { Document, Model } from 'mongoose';

export interface User {
  _id?: string;
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

export async function encryptPassword(
  password: string,
  salt = 10
): Promise<string> {
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  encryptedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, encryptedPassword);
}

schema.pre<User & Document>('save', async function (): Promise<void> {
  if (!this.password || !this.isModified('password')) {
    return;
  }
  try {
    const hashedPassword = await encryptPassword(this.password);
    this.password = hashedPassword;
  } catch (e) {
    console.error(
      `Error when trying to hash the password for the user ${this.name}`
    );
  }
});

export const User: Model<User> = mongoose.model('User', schema);
