import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import config from 'config';

export default class AuthService {
  public static async hashPassword(password: string, salt = 10): Promise<string> {
    return await bcrypt.hash(password, salt);
  }
  public static async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
  public static generateToken(payload: object): string {
    return jsonwebtoken.sign(payload, config.get('App.auth.secret'), {
      expiresIn: config.get('App.auth.expiresIn')
    })
  }
}