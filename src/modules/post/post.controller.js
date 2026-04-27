const postService = require('./post.service');
const sendResponse = require('../../utils/response');

const createPost = async (req, res, next) => {
  try {
    const post = await postService.createPost(req.user.id, req.body);
    sendResponse(res, 201, post);
  } catch (error) {
    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await postService.getPosts(req.user.id, page, limit);
    sendResponse(res, 200, result.posts, { total: result.total, page, limit });
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await postService.getPostById(req.user.id, req.params.id);
    sendResponse(res, 200, post);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById
};
