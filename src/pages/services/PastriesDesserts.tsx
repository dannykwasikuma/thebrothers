import React from 'react';
import ServiceCategoryPage from '@/components/ServiceCategoryPage';

const PastriesDesserts: React.FC = () => (
  <ServiceCategoryPage content={{
    title: 'Pastries & Desserts',
    tagline: 'A sweet finish to every occasion.',
    subcategory: 'Pastries & Desserts',
    image: '/images/wedding-catering.png',
    description: [
      'From elegant dessert tables to custom celebration cakes, our pastry team adds the finishing touch your event deserves. We craft everything from delicate petit fours to show-stopping centerpiece desserts.',
      'Whether paired with a full catering package or ordered as a standalone dessert station, our pastries are made fresh and presented with the same attention to detail as the rest of our service.',
    ],
    highlights: [
      'Custom celebration cakes and cupcake towers',
      'Dessert table styling and presentation',
      'Traditional and contemporary pastry options',
      'Allergy-conscious and dietary-friendly choices available',
      'Can be ordered alongside any other catering service',
    ],
  }} />
);

export default PastriesDesserts;
