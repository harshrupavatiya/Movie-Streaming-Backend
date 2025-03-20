import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import Joi from 'joi';

import ApiError from '../errors/ApiError';
import pick from '../utils/pick';

const validate =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (schema: Record<string, any>) =>
    (req: Request, _res: Response, next: NextFunction): void => {
      const validSchema = pick(schema, ['params', 'query', 'body']);
      const object = pick(req, Object.keys(validSchema));
      const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' } })
        .validate(object);

      if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
      }
      Object.assign(req, value);
      return next();
    };

export default validate;
