import React from 'react';
import ServiceCategoryPage from '@/components/ServiceCategoryPage';

const FingerFoods: React.FC = () => (
  <ServiceCategoryPage content={{
    title: 'Finger Foods & Small Chops',
    tagline: 'Bite-sized indulgence for mingling and casual gatherings.',
    subcategory: 'Finger Foods & Small Chops',
    image: '/images/corporate-catering.png',
    description: [
      'Spring rolls, samosas, grilled skewers, plantain cups, and more — our small chops and finger food platters are perfect for cocktail receptions, meetings, and any gathering where guests mingle more than they sit.',
      'Freshly prepared and beautifully arranged, our finger food service adds a touch of indulgence to any occasion without the formality of a full sit-down meal.',
    ],
    highlights: [
      'Wide assortment of savoury and sweet small chops',
      'Customizable platters for any guest count',
      'Ideal for cocktail hours, meetings, and casual gatherings',
      'Fresh preparation with passed or stationed service options',
      'Vegetarian and dietary-friendly options available',
    ],
  }} />
);

export default FingerFoods;
