import React from 'react';
import ServiceCategoryPage from '@/components/ServiceCategoryPage';

const EventCatering: React.FC = () => (
  <ServiceCategoryPage content={{
    title: 'Event Catering',
    tagline: 'Full-service catering for occasions of every size.',
    subcategory: 'Event Catering',
    image: '/images/corporate-catering.png',
    description: [
      'From milestone celebrations to large public gatherings, our event catering service brings together skilled chefs, polished service staff, and seamless logistics to handle events of any scale.',
      'We work closely with you from the first conversation to the final course, designing a menu that fits your occasion, your guests, and your venue — then executing it with the precision your event deserves.',
    ],
    highlights: [
      'Custom menu planning for any event type or size',
      'Professional chefs and serving staff on-site',
      'Full equipment, table setup, and presentation included',
      'Flexible buffet, plated, or station-style service',
      'Dedicated event lead coordinating with your other vendors',
    ],
  }} />
);

export default EventCatering;
