import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import router from './routes/users';
import cardsRouter from './routes/cards';
import { createUser, login } from './controllers/users';
import auth from './middlewares/auth';
import { requestLogger, errorLogger } from './middlewares/logger';

export interface CustomError extends Error {
  statusCode: number;
}

const SERVER_ERROR_CODE = 500;
const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(requestLogger);
app.post('/signup', createUser);
app.post('/signin', login);
// @ts-ignore
app.use(auth);
app.use('/users', router);
app.use('/cards', cardsRouter);

app.use(errorLogger);
app.use((err: CustomError, req: Request, res: Response) => {
  const { statusCode = SERVER_ERROR_CODE, message } = err;
  res.status(statusCode).send({ message: statusCode === SERVER_ERROR_CODE ? 'На сервере произошла ошибка' : message });
});

app.listen(PORT, () => {});
