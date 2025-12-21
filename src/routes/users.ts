import { Router } from 'express';
import {
  getUsers, getUser, updateProfile, updateAvatar, getProfile,
} from '../controllers/users';

const router = Router();

router.get('/', getUsers);

router.get('/:userId', getUser);

router.get('/me', getProfile);

router.patch('/me', updateProfile);

router.patch('/me/avatar', updateAvatar);

export default router;
