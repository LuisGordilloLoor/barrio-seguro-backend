// Agrupa todas las rutas bajo /api
const { Router } = require('express');

const router = Router();

router.use('/reports', require('./reports.routes'));
router.use('/categories', require('./categories.routes'));
router.use('/stats', require('./stats.routes'));

module.exports = router;
