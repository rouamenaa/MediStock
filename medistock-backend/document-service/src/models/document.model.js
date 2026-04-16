const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define(
  'Document',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filepath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    entityId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'entity_id'
    },
    entityType: {
      type: DataTypes.ENUM('USER', 'ORDER', 'MEDICATION', 'STOCK', 'PHARMACY'),
      allowNull: false,
      field: 'entity_type'
    },
    documentType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'document_type'
    },
    sourceService: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'source_service'
    }
  },
  {
    tableName: 'documents',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false
  }
);

module.exports = Document;
