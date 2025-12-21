import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { celebrate, Joi, errors } from 'celebrate';
import router from './routes/users';
import cardsRouter from './routes/cards';
import { createUser, login } from './controllers/users';
import auth from './middlewares/auth';
import { requestLogger, errorLogger } from './middlewares/logger';

export interface CustomError extends Error {
  statusCode: number;
  code?: number;
}

const SERVER_ERROR_CODE = 500;
const DATA_ERROR_CODE = 400;
const DATA_COLLISION_ERROR_CODE = 409;
const getErrorCode = (err: CustomError) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return DATA_ERROR_CODE;
  }

  if (err.name === 'MongoError' && (err.code === 11000 || err.code === 11001)) {
    return DATA_COLLISION_ERROR_CODE;
  }

  return SERVER_ERROR_CODE;
};

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(requestLogger);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string(),
  }).unknown(true),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string(),
  }).unknown(true),
}), login);
// @ts-ignore
app.use(auth);
app.use('/users', router);
app.use('/cards', cardsRouter);

app.use(errorLogger);
app.use(errors());
app.use((err: CustomError, req: Request, res: Response) => {
  const { statusCode = getErrorCode(err), message } = err;
  res.status(statusCode).send({ message: statusCode === SERVER_ERROR_CODE ? 'На сервере произошла ошибка' : message });
});

app.listen(PORT, () => {});
