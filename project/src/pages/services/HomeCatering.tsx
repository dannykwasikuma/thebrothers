import React from 'react';
import ServiceCategoryPage from '@/components/ServiceCategoryPage';

const HomeCatering: React.FC = () => (
  <ServiceCategoryPage content={{
    title: 'Home Catering',
    tagline: 'Restaurant-quality dining, brought to your living room.',
    subcategory: 'Home Catering',
    image: '/images/wedding-catering.png',
    description: [
      'Sometimes the best gatherings happen at home. Our home catering service brings our full culinary team to your residence for family dinners, intimate celebrations, or private get-togethers — no need to step outside your door.',
      'We handle setup, cooking, serving, and cleanup, leaving your kitchen exactly as we found it while you enjoy the evening with your guests.',
    ],
    highlights: [
      'Cooked fresh on-site or delivered hot and ready to serve',
      'Menus tailored to family size and dietary preferences',
      'Discreet, professional staff in your home',
      'Full cleanup included after service',
      'Ideal for birthdays, anniversaries, and family reunions',
    ],
  }} />
);

export default HomeCatering;
