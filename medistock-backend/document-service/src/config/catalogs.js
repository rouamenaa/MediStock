const CATALOGS = {
  MEDICATION_CATALOG: {
    key: 'MEDICATION_CATALOG',
    title: 'Catalogue Médicaments',
    sourceService: 'MEDICATION-CATALOG-SERVICE',
    entityType: 'MEDICATION',
    allowedDocumentTypes: ['MEDICATION_IMAGE', 'TECHNICAL_SHEET', 'LEAFLET']
  },
  ORDER_DOCUMENTS: {
    key: 'ORDER_DOCUMENTS',
    title: 'Documents de Commande',
    sourceService: 'ORDER-PRESCRIPTION-SERVICE',
    entityType: 'ORDER',
    allowedDocumentTypes: ['ORDONNANCE', 'FACTURE', 'RECEIPT']
  },
  STOCK_REPORTS: {
    key: 'STOCK_REPORTS',
    title: 'Rapports de Stock',
    sourceService: 'PHARMACYSTOCK-SERVICE',
    entityType: 'STOCK',
    allowedDocumentTypes: ['DAILY_REPORT', 'INVENTORY_REPORT', 'STOCK_ALERT']
  },
  USER_DOCUMENTS: {
    key: 'USER_DOCUMENTS',
    title: 'Documents Utilisateur',
    sourceService: 'USER-SERVICE',
    entityType: 'USER',
    allowedDocumentTypes: ['USER_CARD', 'IDENTITY_DOCUMENT', 'PROFILE_IMAGE']
  },
  PHARMACY_CATALOG: {
    key: 'PHARMACY_CATALOG',
    title: 'Catalogue Pharmacies',
    sourceService: 'PHARMACY-MANAGEMENT-SERVICE',
    entityType: 'PHARMACY',
    allowedDocumentTypes: ['CONTACT_CARD', 'LOCATION_CARD', 'ADMIN_CERTIFICATE']
  }
};

function getCatalogByKey(catalogKey) {
  return CATALOGS[catalogKey] || null;
}

function listCatalogs() {
  return Object.values(CATALOGS);
}

module.exports = {
  CATALOGS,
  getCatalogByKey,
  listCatalogs
};
