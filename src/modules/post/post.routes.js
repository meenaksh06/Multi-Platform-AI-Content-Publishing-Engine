const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const postSchema = require('./post.schema');
const postController = require('./post.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/', validate(postSchema.createPost), postController.createPost);
router.get('/', postController.getPosts);
router.get('/:id', validate(postSchema.getPost), postController.getPostById);

module.exports = router;
