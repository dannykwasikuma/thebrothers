import React from 'react';
import ServiceCategoryPage from '@/components/ServiceCategoryPage';

const CorporateCatering: React.FC = () => (
  <ServiceCategoryPage content={{
    title: 'Corporate Catering',
    tagline: 'Polished hospitality for board rooms and ballrooms alike.',
    subcategory: 'Corporate',
    image: '/images/corporate-catering.png',
    description: [
      'Conferences, product launches, board dinners, and AGMs all demand a level of precision and discretion that reflects on your brand. Our corporate catering service is built around punctuality, presentation, and professionalism.',
      'We work with your events or facilities team to understand timing, branding requirements, and dietary considerations, then deliver a dining experience that supports — never disrupts — your agenda.',
    ],
    highlights: [
      'Breakfast, lunch, and dinner service for meetings and conferences',
      'Branded presentation options for corporate identity',
      'Punctual setup aligned to your event schedule',
      'Dietary accommodation for diverse attendee needs',
      'Scalable from boardroom lunches to large conference catering',
    ],
  }} />
);

export default CorporateCatering;
