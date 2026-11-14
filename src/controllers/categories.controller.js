// GET /api/categories
const categoriesService = require('../services/categories.service');

async function listCategories(req, res, next) {
  try {
    const categories = await categoriesService.listCategories();
    res.status(200).json({ total: categories.length, categories });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCategories };
