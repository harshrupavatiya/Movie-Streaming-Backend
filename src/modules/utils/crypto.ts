import crypto from 'crypto';

const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex'); // 64-character token
};

export default generateResetToken;