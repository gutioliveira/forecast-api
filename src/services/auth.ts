import config, { IConfig } from 'config';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@src/models/user';

export interface DecodedUser extends Omit<User, '_id' | 'password>'> {}

const authConfig: IConfig = config.get<
  IConfig & { key: string; expiresIn: number }
>('App.auth');

export class AuthService {
  public static async encryptPassword(
    password: string,
    salt = 10
  ): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  public static async comparePassword(
    password: string,
    encryptedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, encryptedPassword);
  }

  public static generateToken(payload: object): string {
    return jwt.sign(payload, authConfig.get('key') ?? '', {
      expiresIn: authConfig.get('expiresIn'),
    });
  }

  public static decodeToken(token: string): DecodedUser {
    return jwt.verify(token, authConfig.get('key') ?? '') as DecodedUser;
  }
}
