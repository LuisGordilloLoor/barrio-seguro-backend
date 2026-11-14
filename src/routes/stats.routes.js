const { Router } = require('express');
const controller = require('../controllers/stats.controller');

const router = Router();

router.get('/', controller.getStats);

module.exports = router;
