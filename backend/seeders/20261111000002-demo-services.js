'use strict';

// Sample laundry services (prices in PHP).

const services = [
  {
    name: 'Wash & Fold',
    description:
      'Machine wash, tumble dried and neatly folded. Perfect for everyday clothes.',
    price: 60.0,
    unit: 'per_kg',
  },
  {
    name: 'Wash & Iron',
    description: 'Wash, dry and pressed with a flat iron. Shirts returned on hangers.',
    price: 90.0,
    unit: 'per_kg',
  },
  {
    name: 'Dry Cleaning',
    description: 'Gentle solvent cleaning for delicate fabrics, suits and formal wear.',
    price: 120.0,
    unit: 'per_item',
  },
  {
    name: 'Comforters & Beddings',
    description: 'Deep wash for blankets, comforters, duvets and bed sheets.',
    price: 150.0,
    unit: 'per_item',
  },
  {
    name: 'Express Service',
    description: 'Priority wash & fold — ready the same day for morning drop-offs.',
    price: 100.0,
    unit: 'per_kg',
  },
];

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert(
      'services',
      services.map((s) => ({
        ...s,
        is_available: true,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('services', {
      name: services.map((s) => s.name),
    });
  },
};
