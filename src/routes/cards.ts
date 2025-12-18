import { Router } from 'express';
import {
  deleteCard, getCards, createCard, likeCard, dislikeCard,
} from '../controllers/cards';

const cardsRouter = Router();

cardsRouter.get('/', getCards);

cardsRouter.post('/', createCard);

cardsRouter.delete('/:cardId', deleteCard);

cardsRouter.put('/:cardId/likes', likeCard);

cardsRouter.delete('/:cardId/likes', dislikeCard);

export default cardsRouter;
