import React from 'react';
import ServiceCategoryPage from '@/components/ServiceCategoryPage';

const OutdoorCatering: React.FC = () => (
  <ServiceCategoryPage content={{
    title: 'Outdoor Catering',
    tagline: 'Fully-equipped service, wherever your event takes place.',
    subcategory: 'Outdoor',
    image: '/images/outdoor-catering.png',
    description: [
      'Gardens, open fields, beachfronts, and event grounds all come with unique logistical demands. Our outdoor catering service arrives fully equipped — cooking stations, serving tables, chafing dishes, and weather-conscious setup — so location is never a limitation.',
      'We coordinate closely with your venue and décor team to ensure the catering setup complements the space while staying functional and efficient for our staff.',
    ],
    highlights: [
      'Mobile cooking and serving stations',
      'Weather-conscious setup and contingency planning',
      'Equipment transport and on-site assembly included',
      'Coordination with outdoor venue logistics',
      'Suitable for gardens, fields, beachfront, and open-air venues',
    ],
  }} />
);

export default OutdoorCatering;
