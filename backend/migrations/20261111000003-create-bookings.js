'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('bookings', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      service_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'services', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      quantity: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      delivery_date: { type: Sequelize.DATEONLY, allowNull: false },
      time_slot: {
        type: Sequelize.ENUM('09:00-11:00', '13:00-15:00', '16:00-18:00'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'confirmed',
          'received',
          'washing',
          'ready',
          'delivered',
          'claimed',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'pending',
      },
      total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      notes: { type: Sequelize.TEXT },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.addIndex('bookings', ['delivery_date', 'time_slot']);
    await queryInterface.addIndex('bookings', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('bookings');
  },
};
