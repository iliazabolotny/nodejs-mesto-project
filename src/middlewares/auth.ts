import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

interface SessionRequest extends Request {
  user: string | JwtPayload;
}

const UNAUTHORIZED_ERROR_CODE = 401;

const extractBearerToken = (header: string) => header.replace('Bearer ', '');

export default (req: SessionRequest, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  try {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new Error('Необходима авторизация!');
    }

    const token = extractBearerToken(authorization);
    let payload;

    try {
      payload = jwt.verify(token, 'mesto-project');
    } catch (err) {
      throw new Error('Необходима авторизация!');
    }

    req.user = (payload as { _id: string })._id;

    next();
  } catch (err: any) {
    err.statusCode = UNAUTHORIZED_ERROR_CODE;
    next(err);
  }
};
