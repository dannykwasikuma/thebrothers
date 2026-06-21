import React from 'react';
import ServiceCategoryPage from '@/components/ServiceCategoryPage';

const IndoorCatering: React.FC = () => (
  <ServiceCategoryPage content={{
    title: 'Indoor Catering',
    tagline: 'Refined service tailored to halls, hotels, and venues.',
    subcategory: 'Indoor',
    image: '/images/corporate-catering.png',
    description: [
      'Indoor venues — hotels, event halls, churches, and conference centers — call for catering that works in harmony with the space\u2019s layout, kitchen access, and service flow. We adapt our setup to fit any indoor environment without compromising on presentation.',
      'From compact venue kitchens to full banquet halls, our team plans the logistics in advance so service runs smoothly from the moment doors open.',
    ],
    highlights: [
      'Venue walkthrough and layout planning before the event',
      'Compatible with hotel, hall, and church kitchen facilities',
      'Discreet setup and breakdown around your event schedule',
      'Climate-controlled food handling and presentation',
      'Coordination with in-house venue staff where required',
    ],
  }} />
);

export default IndoorCatering;
