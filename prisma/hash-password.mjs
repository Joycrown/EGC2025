/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Usage: node prisma/hash-password.js <password-to-hash>');
  process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync(password, salt);

