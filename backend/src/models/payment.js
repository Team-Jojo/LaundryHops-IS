'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Booking, { as: 'booking', foreignKey: 'booking_id' });
    }
  }

  Payment.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: { args: [0], msg: 'amount must be zero or more.' } },
      },
      method: {
        type: DataTypes.ENUM('cash'),
        allowNull: false,
        defaultValue: 'cash',
      },
      status: {
        type: DataTypes.ENUM('unpaid', 'paid'),
        allowNull: false,
        defaultValue: 'unpaid',
      },
      paid_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: 'Payment',
      tableName: 'payments',
      underscored: true,
    }
  );

  return Payment;
};
