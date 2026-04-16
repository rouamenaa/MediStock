const express = require('express');
const documentController = require('../controllers/document.controller');
const { upload } = require('../middlewares/upload.middleware');

const router = express.Router();

router.post('/upload', upload.single('file'), (req, res) => documentController.upload(req, res));
router.get('/', (req, res) => documentController.list(req, res));
router.get('/metrics', (req, res) => documentController.metrics(req, res));
router.get('/context', (req, res) => documentController.context(req, res));
router.get('/catalogs', (req, res) => documentController.listCatalogs(req, res));
router.get('/catalogs/:catalogKey/documents', (req, res) => documentController.listCatalogDocuments(req, res));
router.post('/catalogs/:catalogKey/upload', upload.single('file'), (req, res) => documentController.uploadToCatalog(req, res));
router.post('/catalogs/:catalogKey/generate', (req, res) => documentController.generateCatalogDocument(req, res));
router.post('/events/order-created', (req, res) => documentController.handleOrderCreated(req, res));
router.post('/events/catalog-generated', (req, res) => documentController.handleCatalogEvent(req, res));
router.get('/:id', (req, res) => documentController.getById(req, res));
router.get('/:id/download', (req, res) => documentController.download(req, res));
router.delete('/:id', (req, res) => documentController.remove(req, res));

module.exports = router;
