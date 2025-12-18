import { Router } from 'express';
import {
  getUsers, createUser, getUser, updateProfile, updateAvatar,
} from '../controllers/users';

const router = Router();

router.get('/', getUsers);

router.post('/', createUser);

router.get('/:userId', getUser);

router.patch('/me', updateProfile);

router.patch('/me/avatar', updateAvatar);

export default router;
