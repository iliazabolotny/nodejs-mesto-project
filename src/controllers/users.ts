import { NextFunction, Request, Response } from 'express';
import user from '../models/user';

export interface UserError extends Error {
  statusCode?: number;
}
const DATA_ERROR_CODE = 400;
const NOT_FOUND_ERROR_CODE = 404;

const createUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, about, avatar } = req.body;
  user.create({ name, about, avatar })
    .catch(() => {
      const error: UserError = new Error('Переданы некорректные данные');
      error.statusCode = DATA_ERROR_CODE;
      next(error);
    });
};

const getUsers = (req: Request, res: Response, next: NextFunction) => user.find({})
  .then((users) => res.send(users))
  .catch(() => {
    const error: UserError = new Error('Переданы некорректные данные');
    error.statusCode = DATA_ERROR_CODE;
    next(error);
  });

const getUser = (req: Request, res: Response, next: NextFunction) => user.findOne({ _id: req?.params.userId.match(/^[0-9a-fA-F]{24}$/) })
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

const updateProfile = (req: Request, res: Response, next: NextFunction) => {
  const { name, about } = req.body;
  user.findByIdAndUpdate(req?.user?._id.match(/^[0-9a-fA-F]{24}$/), { name, about }, {
    new: true,
    runValidators: true,
    upsert: false,
  })
    .then((targetUser) => {
      if (!targetUser) {
        throw new Error('Запрашиваемый пользователь не найден');
      }
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

const updateAvatar = (req: Request, res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  user.findByIdAndUpdate(req?.user?._id.match(/^[0-9a-fA-F]{24}$/), { avatar }, {
    new: true,
    runValidators: true,
    upsert: false,
  })
    .then((targetUser) => {
      if (!targetUser) {
        throw new Error('Запрашиваемый пользователь не найден');
      }
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
  getUser, createUser, getUsers, updateProfile, updateAvatar,
};
