import React from 'react';
import ServiceCategoryPage from '@/components/ServiceCategoryPage';

const HostelCatering: React.FC = () => (
  <ServiceCategoryPage content={{
    title: 'Hostel Catering',
    tagline: 'Reliable, affordable meals for student communities.',
    subcategory: 'Hostel Catering',
    image: '/images/outdoor-catering.png',
    description: [
      'We partner with university and student hostels to provide consistent, hygienic, and affordable meal plans for residents. From daily meal service to special hostel-wide events, our team understands the rhythms and budgets of student life.',
      'Bulk meal preparation, flexible scheduling, and dependable delivery are at the core of how we support hostel communities throughout the academic year.',
    ],
    highlights: [
      'Daily or weekly meal plan options',
      'Bulk pricing tailored to hostel budgets',
      'Hygienic, large-scale food preparation standards',
      'Flexible delivery or on-site serving',
      'Special event catering for hostel functions and orientations',
    ],
  }} />
);

export default HostelCatering;
