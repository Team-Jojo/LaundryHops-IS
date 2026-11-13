'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Service extends Model {
    static associate(models) {
      Service.hasMany(models.Booking, { as: 'bookings', foreignKey: 'service_id' });
    }
  }

  Service.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: { msg: 'A service with this name already exists.' },
        validate: { notEmpty: { msg: 'name is required.' } },
      },
      description: { type: DataTypes.TEXT },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: { args: [0], msg: 'price must be zero or more.' } },
      },
      unit: {
        type: DataTypes.ENUM('per_kg', 'per_item', 'fixed'),
        allowNull: false,
        defaultValue: 'per_kg',
      },
      is_available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      sequelize,
      modelName: 'Service',
      tableName: 'services',
      underscored: true,
    }
  );

  return Service;
};
