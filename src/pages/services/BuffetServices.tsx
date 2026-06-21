import React from 'react';
import ServiceCategoryPage from '@/components/ServiceCategoryPage';

const BuffetServices: React.FC = () => (
  <ServiceCategoryPage content={{
    title: 'Buffet Services',
    tagline: 'Abundant spreads, beautifully presented and self-served.',
    subcategory: 'Buffet',
    image: '/images/outdoor-catering.png',
    description: [
      'Buffet-style service offers your guests variety and choice while keeping the atmosphere relaxed and social. We design buffet layouts that flow naturally, minimize wait times, and showcase each dish at its best.',
      'From chafing dishes to live cooking stations, our buffet setups are styled to match your event\u2019s theme while keeping food fresh, hot, and replenished throughout service.',
    ],
    highlights: [
      'Custom buffet menu with multiple cuisine stations',
      'Professional chafing dish and display setup',
      'Continuous monitoring and replenishment during service',
      'Optional live cooking or carving stations',
      'Suitable for any guest count from 30 to 500+',
    ],
  }} />
);

export default BuffetServices;
