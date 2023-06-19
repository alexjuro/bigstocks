//Autor: Lakzan Nathan
import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Comment } from '../models/comment.js';

const router = express.Router();

router.post('/rating', async (req, res) => {
  const commentDAO: GenericDAO<Comment> = req.app.locals.commentDAO;
  const errors: string[] = [];

  const sendErrMsg = (message: string) => {
    res.status(400).json({ message });
  };
  if (validation(req.body, errors)) {
    sendErrMsg(errors.join('\n'));
  }

  await commentDAO.create({
    rating: req.body.rating,
    comment: req.body.comment
  });
  res.status(200).json({ message: 'Bewertung erfolgreich gespeichert' });
});

function validation(comment: Comment, errors: string[]) {
  let result = false;

  // Überprüfung auf ungültige Bewertung
  if (comment.rating > 5 || comment.rating < 0) {
    result = true;
    errors.push('Rating is invalid');
  }

  const nosqlInjectionPattern = /[$\\'"]/;
  if (nosqlInjectionPattern.test(comment.comment)) {
    result = true;
    errors.push('Potential NoSQL injection detected in comment');
  }

  const re = /^\w[\w ]+$/gm;
  if (re.test(comment.comment)) {
    errors.push('Invalid Comment!!');
  }

  return result;
}

export default router;
