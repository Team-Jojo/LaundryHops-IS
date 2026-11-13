'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payments', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'bookings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      method: {
        type: Sequelize.ENUM('cash'),
        allowNull: false,
        defaultValue: 'cash',
      },
      status: {
        type: Sequelize.ENUM('unpaid', 'paid'),
        allowNull: false,
        defaultValue: 'unpaid',
      },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addIndex('payments', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('payments');
  },
};
