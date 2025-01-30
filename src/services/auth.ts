import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
    return jwt.sign(payload, '1234', { expiresIn: 10000 });
  }
}
