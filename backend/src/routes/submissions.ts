import { Router } from 'express';
import {
  toggleUpvote,
  evaluateSubmission,
  submissionIdValidation,
  evaluateSubmissionValidation,
} from '../controllers/submissionController';
import { validate } from '../middleware/validate';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// POST /api/v1/submissions/:id/upvote — Toggle community upvote (T10.4)
router.post('/:id/upvote', protect, submissionIdValidation, validate, toggleUpvote);

// PUT  /api/v1/submissions/:id/evaluate — Host evaluation & grading (T10.5)
router.put('/:id/evaluate', protect, evaluateSubmissionValidation, validate, evaluateSubmission);

export default router;
