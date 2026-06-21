import React from 'react';
import ServiceCategoryPage from '@/components/ServiceCategoryPage';

const FuneralCatering: React.FC = () => (
  <ServiceCategoryPage content={{
    title: 'Funeral Catering',
    tagline: 'Compassionate, dignified service for families in mourning.',
    subcategory: 'Funeral',
    image: '/images/outdoor-catering.png',
    description: [
      'During times of loss, the last thing a family should worry about is catering logistics. Our funeral catering service is handled with quiet professionalism and cultural sensitivity, allowing families to focus on honouring their loved ones.',
      'We work within traditional Ghanaian funeral customs, accommodating large gatherings with respectful, efficient service from setup through to the final farewell.',
    ],
    highlights: [
      'Culturally sensitive menu planning and service',
      'Capacity for large traditional funeral gatherings',
      'Discreet, respectful staff conduct throughout',
      'Flexible scheduling around funeral rites and customs',
      'Support for multi-day funeral observances',
    ],
  }} />
);

export default FuneralCatering;
