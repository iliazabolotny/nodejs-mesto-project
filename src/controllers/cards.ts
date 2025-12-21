import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import card from '../models/card';

export interface CardsError extends Error {
  statusCode?: number;
}

interface SessionRequest extends Request {
  user: string | JwtPayload;
}

const DATA_ERROR_CODE = 400;
const NOT_FOUND_ERROR_CODE = 404;
const FORBIDDEN_ERROR_CODE = 403;
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

const deleteCard = (req: SessionRequest, res: Response, next: NextFunction) => {
  card.findById(req.params.cardId)
    .then((targetCard) => {
      if (!targetCard) {
        throw new Error('Запрашиваемая карточка не найдена');
      }
      if (targetCard.owner === req?.user) {
        card.remove(targetCard)
          .then((ownerCard) => res.send(ownerCard));
      } else {
        throw new Error('Попытка удалить чужую карточку');
      }
      res.send(targetCard);
    })
    .catch((e) => {
      if (e.message === 'Запрашиваемая карточка не найдена') {
        e.statusCode = NOT_FOUND_ERROR_CODE;
        next(e);
      } else {
        e.statusCode = FORBIDDEN_ERROR_CODE;
        next(e);
      }
    });
};

const likeCard = (req: SessionRequest, res: Response, next: NextFunction) => card.findByIdAndUpdate(
  req.params.cardId,
  { $addToSet: { likes: req?.user } },
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
  card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req?.user } }, { new: true })
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
