/**
 * Single source of truth for the 14 service category pages, used by both
 * the Navbar dropdown and App.tsx route registration so the two can never
 * drift out of sync (add a service here, it shows up in the menu AND routes).
 */
import type React from 'react';
import EventCatering from '@/pages/services/EventCatering';
import WeddingCatering from '@/pages/services/WeddingCatering';
import HomeCatering from '@/pages/services/HomeCatering';
import HostelCatering from '@/pages/services/HostelCatering';
import CorporateCatering from '@/pages/services/CorporateCatering';
import BuffetServices from '@/pages/services/BuffetServices';
import UsheringServices from '@/pages/services/UsheringServices';
import OutdoorCatering from '@/pages/services/OutdoorCatering';
import IndoorCatering from '@/pages/services/IndoorCatering';
import FuneralCatering from '@/pages/services/FuneralCatering';
import BirthdayCatering from '@/pages/services/BirthdayCatering';
import FingerFoods from '@/pages/services/FingerFoods';
import PastriesDesserts from '@/pages/services/PastriesDesserts';
import FoodDelivery from '@/pages/services/FoodDelivery';

export interface ServiceMenuItem {
  label: string;
  path: string;
  component: React.ComponentType;
}

export const SERVICE_MENU: ServiceMenuItem[] = [
  { label: 'Event Catering',              path: '/services/event-catering',      component: EventCatering },
  { label: 'Wedding Catering',            path: '/services/wedding-catering',    component: WeddingCatering },
  { label: 'Home Catering',               path: '/services/home-catering',       component: HomeCatering },
  { label: 'Hostel Catering',             path: '/services/hostel-catering',     component: HostelCatering },
  { label: 'Corporate Catering',          path: '/services/corporate-catering',  component: CorporateCatering },
  { label: 'Buffet Services',             path: '/services/buffet-services',     component: BuffetServices },
  { label: 'Ushering Services',           path: '/services/ushering-services',   component: UsheringServices },
  { label: 'Outdoor Catering',            path: '/services/outdoor-catering',    component: OutdoorCatering },
  { label: 'Indoor Catering',             path: '/services/indoor-catering',     component: IndoorCatering },
  { label: 'Funeral Catering',            path: '/services/funeral-catering',    component: FuneralCatering },
  { label: 'Birthday Catering',           path: '/services/birthday-catering',   component: BirthdayCatering },
  { label: 'Finger Foods & Small Chops',  path: '/services/finger-foods',        component: FingerFoods },
  { label: 'Pastries & Desserts',         path: '/services/pastries-desserts',   component: PastriesDesserts },
  { label: 'Food Delivery',               path: '/services/food-delivery',       component: FoodDelivery },
];
