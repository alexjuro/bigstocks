import express from 'express';
import { GenericDAO } from '../models/generic.dao.js';
import { Comment } from '../models/comment.js';
import xss from 'xss'; // Beispiel einer XSS-Schutzbibliothek

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
  console.log(req.body.rating + req.body.comment);

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

  // Überprüfung auf potenzielle SQL-Injection
  const sqlInjectionPattern = /[';]|--|\/\*|\*\//gi;
  if (sqlInjectionPattern.test(comment.comment)) {
    result = true;
    errors.push('Potential SQL injection detected in comment');
  }

  // Überprüfung auf potenzielle XSS-Attacken
  const sanitizedComment = xss(comment.comment);
  if (sanitizedComment !== comment.comment) {
    result = true;
    errors.push('Potential XSS attack detected in comment');
  }

  return result;
}

export default router;
