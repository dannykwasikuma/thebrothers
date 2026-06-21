import React from 'react';
import ServiceCategoryPage from '@/components/ServiceCategoryPage';

const BirthdayCatering: React.FC = () => (
  <ServiceCategoryPage content={{
    title: 'Birthday Catering',
    tagline: 'Celebrations made deliciously memorable, at any age.',
    subcategory: 'Birthday',
    image: '/images/wedding-catering.png',
    description: [
      'From milestone birthdays to children\u2019s parties, our birthday catering service brings energy, colour, and great food to your celebration. We adapt menus and presentation to suit the age, theme, and scale of the party.',
      'Whether it\u2019s a sit-down dinner for an intimate milestone or a festive spread for a large family celebration, we make sure the food matches the joy of the occasion.',
    ],
    highlights: [
      'Themed menu and presentation options',
      'Cake coordination and dessert table styling',
      'Kid-friendly and adult menu options available',
      'Flexible service style: buffet, finger foods, or plated',
      'Setup and cleanup included',
    ],
  }} />
);

export default BirthdayCatering;
