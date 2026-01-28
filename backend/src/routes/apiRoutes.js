const express = require('express');
const multer = require('multer');
const pdfController = require('../controllers/pdfController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/process-pdf', upload.single('pdfFile'), pdfController.processPdf);
router.post('/process-txt', upload.array('files',12), pdfController.processTxt);
router.post('/process-rag', pdfController.getRAGQueryResponse);
router.post('/clear-db', pdfController.clearDB);

router.post('/documents/delete/:docId', pdfController.deleteDoc);
router.post('/queries/delete/:qId',pdfController.deleteQuery);

module.exports = router;
