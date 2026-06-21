import React from 'react';
import ServiceCategoryPage from '@/components/ServiceCategoryPage';

const FoodDelivery: React.FC = () => (
  <ServiceCategoryPage content={{
    title: 'Food Delivery',
    tagline: 'Our quality, delivered straight to your door.',
    subcategory: 'Food Delivery',
    image: '/images/outdoor-catering.png',
    description: [
      'Not every occasion needs on-site service. Our food delivery option brings the same quality and care straight to your home, office, or event space — packaged to stay fresh and ready to serve.',
      'Perfect for office lunches, small gatherings, or anyone who wants Brothers-quality food without the full catering setup, our delivery service is reliable, prompt, and packaged with care.',
    ],
    highlights: [
      'Hot, fresh food delivered in secure packaging',
      'Flexible delivery scheduling across Kumasi and Accra',
      'Ideal for office lunches and small private gatherings',
      'Bulk order options for larger groups',
      'Easy reordering for regular or recurring deliveries',
    ],
  }} />
);

export default FoodDelivery;
