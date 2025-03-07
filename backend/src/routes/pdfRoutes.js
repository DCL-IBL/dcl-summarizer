const express = require('express');
const multer = require('multer');
const pdfController = require('../controllers/pdfController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/process-pdf', upload.single('pdfFile'), pdfController.processPdf);
router.post('/process-txt', upload.single('txtFile'), pdfController.processTxt);
router.post('/process-rag', pdfController.getRAGQueryResponse);
router.post('/clear-db', pdfController.clearDB);

module.exports = router;
