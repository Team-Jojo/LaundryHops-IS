'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    async comparePassword(candidate) {
      return bcrypt.compare(candidate, this.password_hash);
    }

    static associate(models) {
      User.hasMany(models.Booking, { as: 'bookings', foreignKey: 'user_id' });
    }
  }

  User.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: { notEmpty: { msg: 'full_name is required.' } },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: { msg: 'Email is already registered.' },
        validate: { isEmail: { msg: 'Email must be a valid email address.' }, notEmpty: true },
      },
      password: {
        type: DataTypes.VIRTUAL,
        validate: {
          len: { args: [6, 100], msg: 'Password must be at least 6 characters.' },
        },
      },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      phone: { type: DataTypes.STRING(20) },
      address: { type: DataTypes.TEXT },
      role: {
        type: DataTypes.ENUM('customer', 'admin'),
        allowNull: false,
        defaultValue: 'customer',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      hooks: {
        // Hash before validation runs (create() validates before beforeCreate).
        beforeValidate: async (user) => {
          if (user.password) {
            user.password_hash = await bcrypt.hash(user.password, 10);
          } else if (user.isNewRecord && !user.password_hash) {
            throw new Error('Password is required.');
          }
        },
        // Fallback for bulkCreate({ individualHooks: true }) which skips beforeValidate.
        beforeCreate: async (user) => {
          if (!user.password_hash) {
            if (!user.password) throw new Error('Password is required.');
            user.password_hash = await bcrypt.hash(user.password, 10);
          }
        },
      },
    }
  );

  return User;
};
