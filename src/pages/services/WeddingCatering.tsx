import React from 'react';
import ServiceCategoryPage from '@/components/ServiceCategoryPage';

const WeddingCatering: React.FC = () => (
  <ServiceCategoryPage content={{
    title: 'Wedding Catering',
    tagline: 'A culinary celebration as memorable as your vows.',
    subcategory: 'Wedding',
    image: '/images/wedding-catering.png',
    description: [
      'Your wedding deserves food that matches the magnitude of the day. Our wedding catering team designs multi-course menus rooted in Ghanaian tradition and refined with international technique, served with white-glove precision.',
      'Whether it\u2019s an intimate garden ceremony or a 500-guest reception hall, we handle the cocktail hour, the head table, the cake cutting, and everything in between — so you and your families can simply be present.',
    ],
    highlights: [
      'Custom tasting session before you commit to a menu',
      'Cocktail hour, multi-course dinner, and dessert station',
      'Cultural and traditional dish options alongside international cuisine',
      'Elegant table settings and presentation styling',
      'Coordination with your wedding planner or ushering team',
    ],
  }} />
);

export default WeddingCatering;
