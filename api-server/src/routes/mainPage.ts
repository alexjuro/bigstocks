import express from 'express';
import { authService } from '../services/auth.service.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  res.json({ result: 'JSON' });
});

export default router;
