import { Router } from 'express';
import {
  deleteCard, getCards, likeCard, dislikeCard, createCard,
} from '../controllers/cards';

const cardsRouter = Router();

cardsRouter.get('/', getCards);

cardsRouter.post('/', createCard);

// @ts-ignore
cardsRouter.delete('/:cardId', deleteCard);

// @ts-ignore
cardsRouter.put('/:cardId/likes', likeCard);

cardsRouter.delete('/:cardId/likes', dislikeCard);

export default cardsRouter;
