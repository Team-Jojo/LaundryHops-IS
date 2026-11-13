'use strict';

const { Model } = require('sequelize');
const { TIME_SLOTS, BOOKING_STATUSES } = require('../constants');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.User, { as: 'customer', foreignKey: 'user_id' });
      Booking.belongsTo(models.Service, { as: 'service', foreignKey: 'service_id' });
      Booking.hasOne(models.Payment, { as: 'payment', foreignKey: 'booking_id' });
    }
  }

  Booking.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: { args: [0.5], msg: 'quantity must be at least 0.5.' },
        },
      },
      delivery_date: { type: DataTypes.DATEONLY, allowNull: false },
      time_slot: {
        type: DataTypes.ENUM(...TIME_SLOTS),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...BOOKING_STATUSES),
        allowNull: false,
        defaultValue: 'pending',
      },
      total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      notes: { type: DataTypes.TEXT },
    },
    {
      sequelize,
      modelName: 'Booking',
      tableName: 'bookings',
      underscored: true,
      validate: {
        deliveryDateNotPast() {
          if (this.delivery_date) {
            const { todayStr, isDateStr } = require('../utils/helpers');
            if (isDateStr(this.delivery_date) && this.delivery_date < todayStr()) {
              throw new Error('Delivery date cannot be in the past.');
            }
          }
        },
      },
    }
  );

  return Booking;
};
