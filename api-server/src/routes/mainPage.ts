import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { authService } from '../services/auth.service.js';
import { cryptoService } from '../services/crypto.service.js';

const router = express.Router();

router.get('/', authService.authenticationMiddleware, async (req, res) => {
  res.json({ result: 'JSON' });
});

export default router;
