'use strict';

// Seeds the admin account and one demo customer.
// Passwords are hashed through the User model hooks (bcryptjs).

module.exports = {
  up: async () => {
    const { User } = require('../src/models');

    await User.bulkCreate(
      [
        {
          full_name: 'LaundryHops Admin',
          email: 'admin@laundryhops.com',
          password: 'admin123',
          phone: '0917 000 0000',
          address: 'LaundryHops shop site — Main Street',
          role: 'admin',
        },
        {
          full_name: 'Juan Dela Cruz',
          email: 'juan@example.com',
          password: 'juan123',
          phone: '0917 111 1111',
          address: 'Blk 1 Lot 2, Sampaguita St., Quezon City',
          role: 'customer',
        },
      ],
      { individualHooks: true }
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', {
      email: ['admin@laundryhops.com', 'juan@example.com'],
    });
  },
};
