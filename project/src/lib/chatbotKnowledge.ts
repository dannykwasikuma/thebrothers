import { BUSINESS, whatsappLink, locationsList } from '@/lib/business';
import { SERVICE_MENU } from '@/lib/serviceMenu';

/**
 * The site has no backend server to host a true AI model behind (it's
 * static-hosted on Netlify, talking only to Supabase). Rather than leave
 * the assistant calling a /api/chat endpoint that doesn't exist — which
 * silently fails every single message — this answers from the same real
 * business data (BUSINESS, SERVICE_MENU) that powers the rest of the site,
 * so its answers are always accurate and never invented.
 */

interface Rule {
  keywords: string[];
  reply: () => string;
}

const serviceList = SERVICE_MENU.map((s) => `• ${s.label}`).join('\n');
const phoneList = BUSINESS.phones.map((p) => p.display).join(' or ');

const RULES: Rule[] = [
  {
    keywords: ['service', 'offer', 'what do you do', 'catering type'],
    reply: () => `We offer a wide range of catering and ushering services:\n\n${serviceList}\n\nWant details on a specific one, or shall I point you to our Services menu?`,
  },
  {
    keywords: ['price', 'pricing', 'cost', 'how much', 'rate', 'fee'],
    reply: () => `Pricing depends on your guest count, service type, and event details, so we tailor a quote for every booking. The fastest way to get an exact price is to submit a booking request — our team replies with full pricing, usually within a few hours. Want me to point you to the Booking page?`,
  },
  {
    keywords: ['book', 'booking', 'reserve', 'how do i book', 'schedule'],
    reply: () => `Booking is easy:\n1. Create a free account (or sign in)\n2. Go to the Booking page\n3. Choose your service, event date, location, and guest count\n4. Submit — our team confirms shortly after\n\nYou can start at the "Booking" link in the menu, or I can take you there.`,
  },
  {
    keywords: ['location', 'where', 'based', 'address'],
    reply: () => `We're based in ${locationsList()}, and we cater events across all these areas and beyond. Where is your event taking place?`,
  },
  {
    keywords: ['phone', 'call', 'number', 'contact'],
    reply: () => `You can reach our team directly at ${phoneList}, or email us at ${BUSINESS.email}. Prefer WhatsApp? Tap the WhatsApp button in our footer or Contact page for an instant chat.`,
  },
  {
    keywords: ['email', 'mail'],
    reply: () => `Our email is ${BUSINESS.email} — feel free to reach out with any questions, and we typically respond within 24 hours.`,
  },
  {
    keywords: ['wedding'],
    reply: () => `We'd love to cater your wedding! Our Wedding Catering service covers everything from cocktail hour to the dessert table, with menus rooted in Ghanaian tradition. You'll find it under Services → Wedding Catering, or I can help you start a booking.`,
  },
  {
    keywords: ['funeral'],
    reply: () => `We provide dignified, culturally-sensitive funeral catering for gatherings of any size. You can find more details under Services → Funeral Catering, or start a booking whenever you're ready.`,
  },
  {
    keywords: ['corporate', 'office', 'conference', 'meeting'],
    reply: () => `Our Corporate Catering service covers conferences, board dinners, AGMs, and office events with punctual, professional service. Check it out under Services → Corporate Catering.`,
  },
  {
    keywords: ['usher', 'ushering'],
    reply: () => `Our ushering teams handle guest greeting, seating, and event flow with trained, uniformed staff. You can find this under Services → Ushering Services.`,
  },
  {
    keywords: ['delivery', 'deliver'],
    reply: () => `Yes, we offer Food Delivery across ${locationsList()} — great for office lunches or smaller gatherings without full on-site service.`,
  },
  {
    keywords: ['payment', 'pay', 'momo', 'mobile money'],
    reply: () => `We accept Mobile Money (MTN, Vodafone Cash, AirtelTigo Money) and pay-on-arrival for select services. Payment details are confirmed during checkout or booking.`,
  },
  {
    keywords: ['staff', 'job', 'career', 'work for', 'hiring', 'employment'],
    reply: () => `We're always glad to hear from people interested in joining the team! Please reach out via our Contact page or email ${BUSINESS.email} and our team will follow up.`,
  },
  {
    keywords: ['cancel', 'refund', 'change booking'],
    reply: () => `For cancellations or changes to an existing booking, please contact us directly at ${phoneList} or ${BUSINESS.email} as early as possible — we'll do our best to accommodate you.`,
  },
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    reply: () => `Hello! Welcome to ${BUSINESS.name}. I can help with questions about our services, pricing, booking process, or contact details — what would you like to know?`,
  },
  {
    keywords: ['thank', 'thanks'],
    reply: () => `You're very welcome! Is there anything else I can help you with?`,
  },
];

const FALLBACK = `I'm not entirely sure how to answer that one — but our team can help! Reach us at ${phoneList}, email ${BUSINESS.email}, or chat with us directly on WhatsApp.`;

export function getAssistantReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.reply();
    }
  }
  return FALLBACK;
}

export { whatsappLink };
