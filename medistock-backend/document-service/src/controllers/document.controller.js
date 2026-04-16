const path = require('path');
const documentService = require('../services/document.service');

class DocumentController {
  async upload(req, res) {
    try {
      const document = await documentService.uploadDocument(req.file, req.body);
      res.status(201).json(document);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const document = await documentService.getById(req.params.id);
      res.json(document);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async list(req, res) {
    try {
      const { entityId, entityType, sourceService, documentType, dateFrom, dateTo, search, limit, offset } = req.query;
      const documents = await documentService.list(entityId, entityType, {
        sourceService,
        documentType,
        dateFrom,
        dateTo,
        search,
        limit,
        offset
      });
      res.json(documents);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async remove(req, res) {
    try {
      const result = await documentService.deleteById(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async download(req, res) {
    try {
      const document = await documentService.getById(req.params.id);
      const absolutePath = path.resolve(document.filepath);
      res.download(absolutePath, document.filename);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async metrics(_req, res) {
    try {
      const data = await documentService.getMetrics();
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async context(req, res) {
    try {
      const { entityId, entityType } = req.query;
      const data = await documentService.getEntityContext(entityId, entityType);
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async listCatalogs(_req, res) {
    try {
      const data = await documentService.getCatalogs();
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async uploadToCatalog(req, res) {
    try {
      const data = await documentService.uploadToCatalog(req.params.catalogKey, req.file, req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async listCatalogDocuments(req, res) {
    try {
      const { referenceId, documentType, limit, offset } = req.query;
      const data = await documentService.listCatalogDocuments(
        req.params.catalogKey,
        referenceId,
        documentType,
        { limit, offset }
      );
      res.json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async generateCatalogDocument(req, res) {
    try {
      const data = await documentService.generateCatalogDocument(req.params.catalogKey, req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async handleOrderCreated(req, res) {
    try {
      const data = await documentService.generateOrderCreationDocument(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async handleCatalogEvent(req, res) {
    try {
      const data = await documentService.generateCatalogDocumentFromEvent(req.body);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new DocumentController();
