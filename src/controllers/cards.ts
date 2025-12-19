import { NextFunction, Request, Response } from 'express';
import card from '../models/card';

export interface CardsError extends Error {
  statusCode?: number;
}

const DATA_ERROR_CODE = 400;
const NOT_FOUND_ERROR_CODE = 404;
const createCard = (req: Request, res: Response, next: NextFunction) => {
  const { name, link, owner } = req.body;
  card.create({ name, link, owner })
    .then((createdCard) => res.status(201).send(createdCard))
    .catch(() => {
      const error: CardsError = new Error('Переданы некорректные данные');
      error.statusCode = DATA_ERROR_CODE;
      next(error);
    });
};

const getCards = (req: Request, res: Response, next: NextFunction) => card.find({})
  .then((cards) => res.send(cards))
  .catch(() => {
    const error: CardsError = new Error('Переданы некорректные данные');
    error.statusCode = DATA_ERROR_CODE;
    next(error);
  });

const deleteCard = (req: Request, res: Response, next: NextFunction) => card.findByIdAndDelete(req.params.cardId.match(/^[0-9a-fA-F]{24}$/))
  .then((targetCard) => {
    if (!targetCard) {
      throw new Error('Запрашиваемая карточка не найдена');
    }
    res.send(targetCard);
  })
  .catch((e) => {
    e.statusCode = NOT_FOUND_ERROR_CODE;
    next(e);
  });

const likeCard = (req: Request, res: Response, next: NextFunction) => card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req?.user?._id } },
  { new: true },
)
  .then((targetCard) => {
    if (!targetCard) {
      throw new Error('Запрашиваемая карточка не найдена');
    }
    res.send(targetCard);
  })
  .catch((e) => {
    if (e.message === 'Запрашиваемая карточка не найдена') {
      e.statusCode = NOT_FOUND_ERROR_CODE;
      next(e);
    } else {
      e.statusCode = DATA_ERROR_CODE;
      e.message = 'Переданы некорректные данные';
      next(e);
    }
  });

const dislikeCard = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req?.user?._id } }, { new: true })
    .then((targetCard) => {
      if (!targetCard) {
        throw new Error('Запрашиваемая карточка не найдена');
      }
      res.send(targetCard);
    })
    .catch((e) => {
      if (e.message === 'Запрашиваемая карточка не найдена') {
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
  deleteCard, createCard, getCards, likeCard, dislikeCard,
};
