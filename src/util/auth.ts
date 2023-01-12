import bcrypt from 'bcrypt';

export async function hashPassword(password: string, salt = 10): Promise<string> {
  return await bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}