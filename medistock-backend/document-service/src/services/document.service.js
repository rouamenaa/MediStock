const fs = require('fs/promises');
const fsNative = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { Op, fn, col, literal } = require('sequelize');
const { Document } = require('../models');
const externalEntityService = require('./external-entity.service');
const { getCatalogByKey, listCatalogs } = require('../config/catalogs');
const { uploadDir } = require('../middlewares/upload.middleware');

class DocumentService {
  async uploadDocument(file, payload) {
    if (!file) {
      throw new Error('Fichier obligatoire');
    }

    const requiredFields = ['entityId', 'entityType', 'documentType', 'sourceService'];
    for (const field of requiredFields) {
      if (!payload[field]) {
        throw new Error(`Champ obligatoire manquant: ${field}`);
      }
    }

    const created = await Document.create({
      filename: file.originalname,
      filepath: file.path,
      entityId: String(payload.entityId),
      entityType: payload.entityType,
      documentType: payload.documentType,
      sourceService: payload.sourceService
    });

    return this.enrichDocument(created);
  }

  async getById(id) {
    const document = await Document.findByPk(id);
    if (!document) {
      throw new Error('Document introuvable');
    }
    return document;
  }

  async list(entityId, entityType, options = {}) {
    const where = {};

    if (entityId) {
      where.entityId = String(entityId);
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (options.sourceService) {
      where.sourceService = options.sourceService;
    }

    if (options.documentType) {
      where.documentType = options.documentType;
    }

    if (options.dateFrom || options.dateTo) {
      where.created_at = {};
      if (options.dateFrom) {
        where.created_at[Op.gte] = new Date(options.dateFrom);
      }
      if (options.dateTo) {
        where.created_at[Op.lte] = new Date(options.dateTo);
      }
    }

    if (options.search) {
      const term = `%${String(options.search).trim()}%`;
      where[Op.or] = [
        { filename: { [Op.like]: term } },
        { entityId: { [Op.like]: term } },
        { sourceService: { [Op.like]: term } }
      ];
    }

    const limit = this.clampNumber(options.limit, 50, 1, 200);
    const offset = this.clampNumber(options.offset, 0, 0, 100000);

    const documents = await Document.findAll({
      where: Object.keys(where).length > 0 ? where : { id: { [Op.gt]: 0 } },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return documents.map((document) => this.enrichDocument(document));
  }

  async deleteById(id) {
    const document = await this.getById(id);

    try {
      const absolutePath = path.resolve(document.filepath);
      await fs.unlink(absolutePath);
    } catch (_error) {
    }

    await document.destroy();
    return { message: 'Document supprimé avec succès' };
  }

  async getMetrics() {
    const [global, byEntityType, byDocumentType, bySourceService, recent] = await Promise.all([
      Document.count(),
      this.groupCount('entityType', 'entityType'),
      this.groupCount('documentType', 'documentType'),
      this.groupCount('sourceService', 'sourceService'),
      Document.findAll({
        attributes: ['entityType', 'entityId', [fn('COUNT', col('id')), 'totalDocuments']],
        group: ['entityType', 'entityId'],
        order: [[literal('"totalDocuments"'), 'DESC']],
        limit: 5
      })
    ]);

    const byCatalog = listCatalogs().map((catalog) => {
      const bucket = bySourceService.find((item) => item.key === catalog.sourceService);
      return {
        key: catalog.key,
        title: catalog.title,
        total: bucket ? bucket.total : 0
      };
    });

    return {
      totalDocuments: global,
      byCatalog,
      byEntityType,
      byDocumentType,
      bySourceService,
      topEntities: recent.map((row) => ({
        entityType: row.entityType,
        entityId: row.entityId,
        totalDocuments: Number(row.get('totalDocuments') || 0)
      }))
    };
  }

  async getEntityContext(entityId, entityType) {
    if (!entityId || !entityType) {
      throw new Error('entityId et entityType sont obligatoires');
    }

    const rows = await Document.findAll({
      where: {
        entityId: String(entityId),
        entityType
      },
      order: [['created_at', 'DESC']]
    });
    const documents = rows.map((document) => this.enrichDocument(document));
    const entitySnapshot = await externalEntityService.getEntitySnapshot(entityType, entityId);

    const documentTypes = {};
    const sourceServices = {};
    for (const document of documents) {
      documentTypes[document.documentType] = (documentTypes[document.documentType] || 0) + 1;
      sourceServices[document.sourceService] = (sourceServices[document.sourceService] || 0) + 1;
    }

    const recommendedByEntity = {
      ORDER: ['ORDONNANCE', 'FACTURE'],
      PHARMACY: ['REPORT', 'IMAGE'],
      STOCK: ['REPORT'],
      MEDICATION: ['IMAGE', 'REPORT'],
      USER: ['IMAGE']
    };

    const expected = recommendedByEntity[entityType] || [];
    const missingDocuments = expected.filter((type) => !documentTypes[type]);

    return {
      entityId: String(entityId),
      entityType,
      entitySnapshot,
      insights: {
        totalDocuments: documents.length,
        documentTypes,
        sourceServices,
        missingDocuments,
        lastUploadAt: documents.length > 0 ? (documents[0].createdAt || documents[0].created_at) : null
      },
      documents
    };
  }

  async groupCount(attributeName, aliasName) {
    const attributeMeta = Document.getAttributes()[attributeName];
    const physicalField = attributeMeta && attributeMeta.field ? attributeMeta.field : attributeName;
    const rows = await Document.findAll({
      attributes: [[col(physicalField), aliasName], [fn('COUNT', col('id')), 'total']],
      group: [col(physicalField)],
      order: [[literal('"total"'), 'DESC']]
    });

    return rows.map((row) => ({
      key: row.get(aliasName),
      total: Number(row.get('total') || 0)
    }));
  }

  async uploadToCatalog(catalogKey, file, payload) {
    const catalog = this.requireCatalog(catalogKey);
    const referenceId = payload.referenceId || payload.entityId;

    if (!referenceId) {
      throw new Error('referenceId obligatoire');
    }

    const selectedType = payload.documentType || catalog.allowedDocumentTypes[0];
    if (!catalog.allowedDocumentTypes.includes(selectedType)) {
      throw new Error(`documentType invalide pour ${catalog.key}`);
    }

    return this.uploadDocument(file, {
      entityId: String(referenceId),
      entityType: catalog.entityType,
      documentType: selectedType,
      sourceService: catalog.sourceService
    });
  }

  async generateCatalogDocument(catalogKey, payload) {
    const catalog = this.requireCatalog(catalogKey);
    const referenceId = payload.referenceId;
    if (!referenceId) {
      throw new Error('referenceId obligatoire');
    }

    const selectedType = payload.documentType || catalog.allowedDocumentTypes[0];
    if (!catalog.allowedDocumentTypes.includes(selectedType)) {
      throw new Error(`documentType invalide pour ${catalog.key}`);
    }

    const resolvedPayload = await this.resolveCatalogPayload(
      catalog.key,
      String(referenceId),
      payload.payload || {}
    );

    const file = await this.createGeneratedPdfFile({
      catalogKey: catalog.key,
      referenceId: String(referenceId),
      documentType: selectedType,
      title: payload.title || `${catalog.title} - ${selectedType}`,
      generatedByService: payload.generatedByService || catalog.sourceService,
      payload: resolvedPayload
    });

    return this.uploadDocument(file, {
      entityId: String(referenceId),
      entityType: catalog.entityType,
      documentType: selectedType,
      sourceService: catalog.sourceService
    });
  }

  async generateOrderCreationDocument(orderPayload) {
    const lines = Array.isArray(orderPayload.items)
      ? orderPayload.items.map((item) => ({
          medicationId: item.medicationId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          medicationName: item.medicationName,
          medicationCode: item.medicationCode
        }))
      : [];

    return this.generateCatalogDocument('ORDER_DOCUMENTS', {
      referenceId: String(orderPayload.orderId),
      documentType: 'FACTURE',
      title: `Facture - ${orderPayload.orderNumber || orderPayload.orderId}`,
      generatedByService: 'ORDER-PRESCRIPTION-SERVICE',
      payload: {
        orderId: orderPayload.orderId,
        orderNumber: orderPayload.orderNumber,
        patientId: orderPayload.patientId,
        patientName: orderPayload.patientName,
        pharmacyId: orderPayload.pharmacyId,
        status: orderPayload.status,
        totalAmount: orderPayload.totalAmount,
        createdAt: orderPayload.createdAt,
        items: lines
      }
    });
  }

  async generateCatalogDocumentFromEvent(eventPayload) {
    if (!eventPayload) {
      throw new Error('Payload événement obligatoire');
    }
    const catalogKey = eventPayload.catalogKey || eventPayload.catalog || eventPayload.targetCatalog;
    if (!catalogKey) {
      throw new Error('catalogKey obligatoire');
    }
    const payload = {
      ...eventPayload,
      catalogKey,
      referenceId:
        eventPayload.referenceId ||
        eventPayload.entityId ||
        eventPayload.orderId ||
        eventPayload.medicationId ||
        eventPayload.stockItemId,
      documentType: eventPayload.documentType || this.resolveDocumentTypeFromEvent(catalogKey, eventPayload),
      title: eventPayload.title || this.resolveEventTitle(catalogKey, eventPayload),
      payload: eventPayload.payload || eventPayload.data || {}
    };
    return this.generateCatalogDocument(catalogKey, payload);
  }

  async listCatalogDocuments(catalogKey, referenceId, documentType, options = {}) {
    const catalog = this.requireCatalog(catalogKey);
    const where = {
      sourceService: catalog.sourceService,
      entityType: catalog.entityType
    };

    if (referenceId) {
      where.entityId = String(referenceId);
    }

    if (documentType) {
      where.documentType = documentType;
    }

    const limit = this.clampNumber(options.limit, 50, 1, 200);
    const offset = this.clampNumber(options.offset, 0, 0, 100000);

    const rows = await Document.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return rows.map((document) => this.enrichDocument(document));
  }

  async getCatalogs() {
    const sourceCounts = await this.groupCount('sourceService', 'sourceService');
    return listCatalogs().map((catalog) => {
      const count = sourceCounts.find((item) => item.key === catalog.sourceService);
      return {
        ...catalog,
        totalDocuments: count ? count.total : 0
      };
    });
  }

  requireCatalog(catalogKey) {
    const catalog = getCatalogByKey(catalogKey);
    if (!catalog) {
      throw new Error(`Catalogue introuvable: ${catalogKey}`);
    }
    return catalog;
  }

  inferCatalog(document) {
    return listCatalogs().find(
      (catalog) =>
        catalog.sourceService === document.sourceService &&
        catalog.entityType === document.entityType
    ) || null;
  }

  enrichDocument(document) {
    const json = document.toJSON ? document.toJSON() : document;
    const catalog = this.inferCatalog(json);
    return {
      ...json,
      catalogKey: catalog ? catalog.key : null,
      catalogTitle: catalog ? catalog.title : null,
      displayTitle: this.resolveStoredDocumentTitle(catalog, json),
      fileExtension: path.extname(json.filename || '').replace('.', '').toLowerCase() || null
    };
  }

  async createGeneratedPdfFile(data) {
    const timestamp = Date.now();
    const safeCatalog = String(data.catalogKey).toLowerCase();
    const safeRef = String(data.referenceId).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${timestamp}-${safeCatalog}-${safeRef}.pdf`;
    const filepath = path.resolve(uploadDir, filename);
    await this.renderPdf(filepath, data);

    return {
      originalname: filename,
      path: filepath
    };
  }

  async renderPdf(filepath, data) {
    await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 45 });
      const stream = fsNative.createWriteStream(filepath);
      doc.pipe(stream);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const primary = '#0f172a';
      const accent = '#2563eb';
      const muted = '#64748b';

      const isOrderDocument = data.catalogKey === 'ORDER_DOCUMENTS';
      doc.fillColor(primary).fontSize(19).text(isOrderDocument ? 'Pharmacie Medistock' : 'Medistock');
      doc.moveDown(0.2);
      doc.fillColor(accent).fontSize(14).text(this.resolveDocumentHeading(data));
      doc.moveDown(0.5);

      doc.save();
      doc.fillColor('#e2e8f0').rect(doc.x, doc.y, pageWidth, 1).fill();
      doc.restore();
      doc.moveDown(0.8);

      if (isOrderDocument) {
        doc.fillColor(primary).fontSize(11).text(`Date d'émission: ${this.formatDateTime(new Date().toISOString())}`);
        doc.fillColor(primary).fontSize(11).text(`Document patient`);
      } else {
        doc.fillColor(primary).fontSize(11).text(`Référence: ${data.referenceId}`);
        doc.fillColor(primary).fontSize(11).text(`Type: ${data.documentType}`);
        doc.fillColor(muted).fontSize(10).text(`Généré le: ${new Date().toLocaleString('fr-FR')}`);
      }
      doc.moveDown(1);

      const preparedPayload = this.preparePayload(data.catalogKey, data.payload || {});
      if (data.catalogKey === 'ORDER_DOCUMENTS') {
        this.renderOrderSection(doc, preparedPayload);
      } else if (data.catalogKey === 'MEDICATION_CATALOG') {
        this.renderMedicationSection(doc, preparedPayload);
      } else if (data.catalogKey === 'STOCK_REPORTS') {
        this.renderStockSection(doc, preparedPayload);
      } else {
        this.renderGenericSection(doc, preparedPayload);
      }

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  renderOrderSection(doc, payload) {
    const labelColor = '#1e293b';
    const valueColor = '#334155';
    const sectionTitleColor = '#1d4ed8';
    const items = Array.isArray(payload.items) ? payload.items : [];
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const orderDate = this.formatDateTime(payload.createdAt);
    const status = this.formatStatus(payload.status);

    doc.fillColor(sectionTitleColor).fontSize(13).text('Commande patient');
    doc.moveDown(0.3);
    this.writeField(doc, 'Numéro de commande', payload.orderNumber, labelColor, valueColor);
    this.writeField(doc, 'Patient', payload.patientName, labelColor, valueColor);
    this.writeField(doc, 'Pharmacie', `N° ${payload.pharmacyId || 'N/A'}`, labelColor, valueColor);
    this.writeField(doc, 'Date de commande', orderDate, labelColor, valueColor);
    this.writeField(doc, 'État', status, labelColor, valueColor);
    doc.moveDown(0.8);

    if (items.length === 0) {
      doc.fillColor('#64748b').fontSize(10).text('Aucun médicament enregistré dans cette commande.');
      return;
    }

    const columns = {
      medication: 260,
      quantity: 70,
      unitPrice: 90,
      total: 90
    };

    const startX = doc.x;
    const rowHeight = 24;
    const headerY = doc.y;
    doc.save();
    doc.fillColor('#eff6ff').rect(startX, headerY, pageWidth, rowHeight).fill();
    doc.restore();

    doc.fillColor('#1e293b').fontSize(10);
    doc.text('Médicament', startX + 8, headerY + 7, { width: columns.medication - 10 });
    doc.text('Qté', startX + columns.medication + 8, headerY + 7, { width: columns.quantity - 10, align: 'center' });
    doc.text('Prix unitaire', startX + columns.medication + columns.quantity + 8, headerY + 7, { width: columns.unitPrice - 10, align: 'right' });
    doc.text('Total', startX + columns.medication + columns.quantity + columns.unitPrice + 8, headerY + 7, { width: columns.total - 16, align: 'right' });
    doc.y = headerY + rowHeight;

    let grandTotal = 0;
    items.forEach((item, index) => {
      const y = doc.y;
      const bg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      doc.save();
      doc.fillColor(bg).rect(startX, y, pageWidth, rowHeight).fill();
      doc.strokeColor('#e2e8f0').lineWidth(0.5).rect(startX, y, pageWidth, rowHeight).stroke();
      doc.restore();

      const lineTotal = Number(item.totalPrice || 0);
      grandTotal += Number.isFinite(lineTotal) ? lineTotal : 0;

      doc.fillColor('#0f172a').fontSize(10);
      const medicationLabel = item.medicationName || 'Médicament';
      doc.text(medicationLabel, startX + 8, y + 7, { width: columns.medication - 10 });
      doc.text(String(item.quantity || 0), startX + columns.medication + 8, y + 7, {
        width: columns.quantity - 10,
        align: 'center'
      });
      doc.text(this.formatMoney(item.unitPrice), startX + columns.medication + columns.quantity + 8, y + 7, {
        width: columns.unitPrice - 10,
        align: 'right'
      });
      doc.text(this.formatMoney(item.totalPrice), startX + columns.medication + columns.quantity + columns.unitPrice + 8, y + 7, {
        width: columns.total - 16,
        align: 'right'
      });
      doc.y = y + rowHeight;
    });

    doc.moveDown(0.8);
    doc.fillColor('#0f172a').fontSize(12).text(`Montant total à payer: ${this.formatMoney(payload.totalAmount || grandTotal)}`, {
      align: 'right'
    });
    doc.moveDown(0.6);
    doc.fillColor('#334155').fontSize(10).text('Merci pour votre confiance.', { align: 'right' });
  }

  renderMedicationSection(doc, payload) {
    const sectionTitleColor = '#1d4ed8';
    const cardX = doc.x;
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const startY = doc.y;
    const cardHeight = 110;
    doc.save();
    doc.fillColor('#f8fafc').roundedRect(cardX, startY, pageWidth, cardHeight, 8).fill();
    doc.strokeColor('#e2e8f0').roundedRect(cardX, startY, pageWidth, cardHeight, 8).stroke();
    doc.restore();

    doc.fillColor(sectionTitleColor).fontSize(13).text(payload.name || 'Médicament', cardX + 14, startY + 14);
    doc.fillColor('#334155').fontSize(10).text(`Forme: ${payload.form || 'N/A'}`, cardX + 14, startY + 38);
    doc.fillColor('#334155').fontSize(10).text(`Dosage: ${payload.dosage || 'N/A'}`, cardX + 14, startY + 56);
    doc.fillColor('#334155').fontSize(10).text(`Laboratoire: ${payload.laboratory || 'N/A'}`, cardX + 14, startY + 74);
    doc.y = startY + cardHeight + 18;

    doc.fillColor(sectionTitleColor).fontSize(12).text('Informations utiles');
    doc.moveDown(0.3);
    this.writeField(doc, 'Principe actif', payload.activePrincipleName);
    this.writeField(doc, 'Présentation', payload.presentation);
    this.writeField(doc, 'Conseils', payload.usageAdvice);
    this.writeField(doc, 'Précautions', payload.precautions);
    this.writeField(doc, 'Référence produit', payload.productCode);
  }

  renderStockSection(doc, payload) {
    const sectionTitleColor = '#1d4ed8';
    doc.fillColor(sectionTitleColor).fontSize(13).text('Rapport de stock pharmacie');
    doc.moveDown(0.3);
    this.writeField(doc, 'Pharmacie', `N° ${payload.pharmacyId || 'N/A'}`);
    this.writeField(doc, 'Médicament', payload.medicationName || `ID ${payload.medicationId || 'N/A'}`);
    this.writeField(doc, 'Quantité restante', payload.remainingQuantity);
    this.writeField(doc, 'Seuil minimal', payload.threshold);
    const isCritical = Number(payload.remainingQuantity || 0) <= Number(payload.threshold || 0);
    this.writeField(doc, 'Niveau', isCritical ? 'Critique' : 'Surveillance');
    doc.moveDown(0.4);
    doc.fillColor(isCritical ? '#b91c1c' : '#0369a1').fontSize(11).text(
      isCritical
        ? 'Action recommandée: lancer un réapprovisionnement immédiat.'
        : 'Action recommandée: surveiller l’évolution du stock.'
    );
  }

  renderGenericSection(doc, payload) {
    const sectionTitleColor = '#1d4ed8';
    doc.fillColor(sectionTitleColor).fontSize(13).text('Données du document');
    doc.moveDown(0.3);
    Object.entries(payload || {}).forEach(([key, value]) => {
      const normalized = typeof value === 'object' ? JSON.stringify(value) : value;
      this.writeField(doc, key, normalized);
    });
  }

  writeField(doc, label, value, labelColor = '#0f172a', valueColor = '#334155') {
    doc.fillColor(labelColor).fontSize(10).text(`${label}:`, { continued: true });
    const safeValue = value === undefined || value === null || value === '' ? 'N/A' : String(value);
    doc.fillColor(valueColor).fontSize(10).text(` ${safeValue}`);
  }

  resolveDocumentHeading(data) {
    if (data.catalogKey === 'ORDER_DOCUMENTS') {
      if (data.documentType === 'ORDONNANCE') {
        return 'Ordonnance patient';
      }
      return 'Facture patient';
    }
    if (data.catalogKey === 'MEDICATION_CATALOG') {
      return 'Fiche médicament';
    }
    if (data.catalogKey === 'STOCK_REPORTS') {
      return 'Rapport de stock';
    }
    return data.title || 'Document';
  }

  formatDateTime(value) {
    if (!value) {
      return 'N/A';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return date.toLocaleString('fr-FR');
  }

  formatMoney(value) {
    const number = Number(value || 0);
    if (!Number.isFinite(number)) {
      return '0,00 TND';
    }
    return `${number.toFixed(2).replace('.', ',')} TND`;
  }

  formatStatus(status) {
    const map = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      PROCESSING: 'En préparation',
      READY: 'Prête',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
      REJECTED: 'Refusée'
    };
    return map[String(status || '').toUpperCase()] || (status || 'N/A');
  }

  resolveDocumentTypeFromEvent(catalogKey, payload) {
    const catalog = getCatalogByKey(catalogKey);
    if (!catalog) {
      return payload.documentType;
    }
    if (catalogKey === 'ORDER_DOCUMENTS' && payload.eventType === 'PRESCRIPTION_CREATED') {
      return 'ORDONNANCE';
    }
    if (catalogKey === 'STOCK_REPORTS' && payload.eventType === 'DAILY_CLOSING') {
      return 'DAILY_REPORT';
    }
    return payload.documentType || catalog.allowedDocumentTypes[0];
  }

  resolveEventTitle(catalogKey, payload) {
    if (catalogKey === 'ORDER_DOCUMENTS') {
      if (payload.documentType === 'ORDONNANCE' || payload.eventType === 'PRESCRIPTION_CREATED') {
        return 'Ordonnance patient';
      }
      return `Facture patient ${payload.orderNumber || payload.referenceId || ''}`.trim();
    }
    if (catalogKey === 'MEDICATION_CATALOG') {
      return `Fiche médicament ${payload.name || payload.referenceId || ''}`.trim();
    }
    if (catalogKey === 'STOCK_REPORTS') {
      return 'Rapport de stock pharmacie';
    }
    return payload.title || 'Document';
  }

  resolveStoredDocumentTitle(catalog, json) {
    if (!catalog) {
      return json.documentType || 'Document';
    }
    const map = {
      ORDER_DOCUMENTS: {
        FACTURE: 'Facture patient',
        ORDONNANCE: 'Ordonnance patient',
        RECEIPT: 'Reçu patient'
      },
      MEDICATION_CATALOG: {
        MEDICATION_IMAGE: 'Visuel médicament',
        TECHNICAL_SHEET: 'Fiche médicament',
        LEAFLET: 'Notice médicament'
      },
      STOCK_REPORTS: {
        DAILY_REPORT: 'Bilan journalier du stock',
        INVENTORY_REPORT: 'Rapport inventaire stock',
        STOCK_ALERT: 'Alerte stock'
      }
    };
    const byCatalog = map[catalog.key] || {};
    return byCatalog[json.documentType] || `${catalog.title} - ${json.documentType}`;
  }

  preparePayload(catalogKey, payload) {
    if (catalogKey === 'ORDER_DOCUMENTS') {
      const items = Array.isArray(payload.items) ? payload.items : [];
      return {
        ...payload,
        orderNumber: payload.orderNumber || payload.orderId || 'N/A',
        patientName: payload.patientName || 'Patient',
        items: items.map((item) => ({
          medicationName: item.medicationName || item.name || 'Médicament',
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
          totalPrice: Number(item.totalPrice || (Number(item.quantity || 0) * Number(item.unitPrice || 0)))
        }))
      };
    }

    if (catalogKey === 'MEDICATION_CATALOG') {
      return {
        ...payload,
        presentation: payload.presentation || 'Médicament disponible en pharmacie.',
        usageAdvice: payload.usageAdvice || 'Utiliser selon la prescription du professionnel de santé.',
        precautions: payload.precautions || 'Lire la notice avant utilisation.'
      };
    }

    if (catalogKey === 'STOCK_REPORTS') {
      return {
        ...payload,
        medicationName: payload.medicationName || payload.name || null
      };
    }

    return payload;
  }

  clampNumber(value, defaultValue, min, max) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return defaultValue;
    }
    return Math.max(min, Math.min(max, Math.trunc(parsed)));
  }

  async resolveCatalogPayload(catalogKey, referenceId, payload) {
    if (catalogKey !== 'MEDICATION_CATALOG') {
      return payload;
    }

    const normalizedRef = this.normalizeMedicationReference(referenceId);
    if (!normalizedRef) {
      throw new Error('referenceId médicament invalide');
    }

    const snapshot = await externalEntityService.getEntitySnapshot('MEDICATION', normalizedRef);
    if (!snapshot || !snapshot.available) {
      if (snapshot && snapshot.status === 404) {
        throw new Error(`Médicament introuvable pour la référence ${normalizedRef}`);
      }
      return payload;
    }
    if (!snapshot.data) {
      return payload;
    }

    const data = snapshot.data;
    return {
      ...payload,
      medicationId: data.id || normalizedRef,
      name: data.name || payload.name,
      form: data.form || payload.form,
      dosage: data.dosage || payload.dosage,
      activePrincipleId: data.activePrincipleId || payload.activePrincipleId,
      activePrincipleName: data.activePrincipleName || payload.activePrincipleName,
      activePrincipleCode: data.activePrincipleCode || payload.activePrincipleCode,
      laboratory: data.laboratory || payload.laboratory,
      productCode: data.productCode || payload.productCode,
      referenceMedicationId: data.referenceMedicationId || payload.referenceMedicationId,
      referenceMedicationName: data.referenceMedicationName || payload.referenceMedicationName,
      active: data.active !== undefined ? data.active : payload.active
    };
  }

  normalizeMedicationReference(referenceId) {
    const raw = String(referenceId || '').trim();
    if (!raw) {
      return null;
    }
    if (/^\d+$/.test(raw)) {
      return raw;
    }
    return null;
  }
}

module.exports = new DocumentService();
