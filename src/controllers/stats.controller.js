// GET /api/stats
const statsService = require('../services/stats.service');

async function getStats(req, res, next) {
  try {
    const stats = await statsService.getStats();
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
