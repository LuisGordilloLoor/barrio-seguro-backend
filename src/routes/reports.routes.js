const { Router } = require('express');
const controller = require('../controllers/reports.controller');

const router = Router();

router.post('/', controller.createReport);   // Crear reporte anónimo
router.get('/', controller.listReports);     // Listar con filtros y paginación
router.get('/:id', controller.getReport);    // Detalle por id o report_code

module.exports = router;
