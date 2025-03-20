import { NextFunction, Response } from 'express';
import { AuthRequest } from './auth.interface';

export const getPaginationInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // get page and limit from query parameters
    const { page = '1', limit = '20' } = req.query;

    // Convert parameters to numbers
    const pageNumber: number = parseInt(page as string, 10);
    const limitNumber: number = parseInt(limit as string, 10);

    // validating pageNumber
    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: 'Page must be a positive integer (≥1)' });
      return;
    }
    // validating limitNumber
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res.status(400).json({ message: 'Limit must be a positive integer (1-100)' });
      return;
    }

    // calculate the number for skip docs
    const skipDocNumber = (pageNumber - 1) * limitNumber;

    req.pagination = { skipDocNumber, limitNumber };

    next();
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};
