import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import user from '../models/user';

export interface UserError extends Error {
  statusCode?: number;
}
interface SessionRequest extends Request {
  user?: string;
}
const DATA_ERROR_CODE = 400;
const NOT_FOUND_ERROR_CODE = 404;
const UNAUTHORIZED_ERROR_CODE = 401;

const createUser = (req: Request, res: Response, next: NextFunction) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  return bcrypt.hash(password, 10)
    .then((hash) => user.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    }))
    .then((createdUser) => res.status(201).send(createdUser))
    .catch(() => {
      const error: UserError = new Error('Переданы некорректные данные');
      error.statusCode = DATA_ERROR_CODE;
      next(error);
    });
};

const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  return user.findOne({ email }).select('+password')
    .then((targetUser) => {
      if (!targetUser) {
        throw new Error('Неправильные почта или пароль');
      }

      return bcrypt.compare(password, targetUser.password).then((matched) => {
        if (!matched) {
          throw new Error('Неправильные почта или пароль');
        }
        return targetUser;
      });
    })
    .then((loggedUser) => {
      res.send({
        token: jwt.sign({ _id: loggedUser._id }, 'mesto-project', { expiresIn: '7d' }),
      });
    })
    .catch((e) => {
      e.statusCode = UNAUTHORIZED_ERROR_CODE;
      next(e);
    });
};

const getUsers = (req: Request, res: Response, next: NextFunction) => user.find({})
  .then((users) => res.send(users))
  .catch(() => {
    const error: UserError = new Error('Переданы некорректные данные');
    error.statusCode = DATA_ERROR_CODE;
    next(error);
  });

const getUser = (req: Request, res: Response, next: NextFunction) => user.findOne({ _id: req?.params.userId })
  .then((currentUser) => {
    if (!currentUser) {
      throw new Error('Запрашиваемый пользователь не найден');
    }
    res.send(currentUser);
  })
  .catch((e) => {
    e.statusCode = NOT_FOUND_ERROR_CODE;
    next(e);
  });

const updateProfile = (req: SessionRequest, res: Response, next: NextFunction) => {
  const { name, about } = req.body;
  user.findByIdAndUpdate(req?.user, { name, about }, {
    new: true,
    runValidators: true,
    upsert: false,
  })
    .then((targetUser) => {
      if (!targetUser) {
        throw new Error('Запрашиваемый пользователь не найден');
      }
      res.send(targetUser);
    })
    .catch((e) => {
      if (e.message === 'Запрашиваемый пользователь не найден') {
        e.statusCode = NOT_FOUND_ERROR_CODE;
        next(e);
      } else {
        e.statusCode = DATA_ERROR_CODE;
        e.message = 'Переданы некорректные данные';
        next(e);
      }
    });
};

const getProfile = (req: SessionRequest, res: Response, next: NextFunction) => {
  user.findOne({ _id: req?.user })
    .then((currentUser) => {
      res.send(currentUser);
    })
    .catch((e) => {
      e.statusCode = NOT_FOUND_ERROR_CODE;
      next(e);
    });
};

const updateAvatar = (req: SessionRequest, res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  user.findByIdAndUpdate(req?.user, { avatar }, {
    new: true,
    runValidators: true,
    upsert: false,
  })
    .then((targetUser) => {
      if (!targetUser) {
        throw new Error('Запрашиваемый пользователь не найден');
      }
      res.send(targetUser);
    })
    .catch((e) => {
      if (e.message === 'Запрашиваемый пользователь не найден') {
        e.statusCode = NOT_FOUND_ERROR_CODE;
        next(e);
      } else {
        e.statusCode = DATA_ERROR_CODE;
        e.message = 'Переданы некорректные данные';
        next(e);
      }
    });
};

export {
  getUser, createUser, getUsers, updateProfile, updateAvatar, login, getProfile,
};
