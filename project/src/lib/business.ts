/**
 * Single source of truth for business details. Every page (Footer, Contact,
 * About, receipts, etc.) should import from here rather than hardcoding
 * phone numbers, emails, or social handles directly — update once, applies
 * everywhere.
 */

export const BUSINESS = {
  name: 'THE BROTHERS CATERING SERVICES',
  shortName: 'The Brothers',
  slogan: 'Quality Services You Can Trust',
  locations: ['Kumasi', 'Nkawkaw', 'Kwahu', 'Accra, Ghana'],
  phones: [
    { display: '+233 54 716 4110', raw: '+233547164110' },
    { display: '+233 25 634 2880', raw: '+233256342880' },
  ],
  email: 'thebrotherscateringservices@gmail.com',
} as const;

export interface SocialLink {
  name: string;
  handle: string;
  url: string;
  // lucide-react doesn't ship TikTok/X-specific icons, so those two are
  // rendered with inline SVG in SocialLinks.tsx; the rest use lucide icons.
  icon: 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'x';
}

export const SOCIAL_LINKS: SocialLink[] = [
  { name: 'TikTok', handle: '@thebrotherscatering', url: 'https://www.tiktok.com/@thebrotherscatering', icon: 'tiktok' },
  { name: 'Instagram', handle: '@thebrotherscateringservices', url: 'https://www.instagram.com/thebrotherscateringservices', icon: 'instagram' },
  { name: 'Facebook', handle: 'thebrotherscateringservices', url: 'https://www.facebook.com/thebrotherscateringservices', icon: 'facebook' },
  { name: 'X', handle: '@de_brodas_cater', url: 'https://x.com/de_brodas_cater', icon: 'x' },
  { name: 'YouTube', handle: '@thebrotherscateringservices', url: 'https://www.youtube.com/@thebrotherscateringservices', icon: 'youtube' },
];

/** wa.me deep link for the primary phone number, with an optional pre-filled message. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${BUSINESS.phones[0].raw.replace('+', '')}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoLink(subject?: string): string {
  return subject ? `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}` : `mailto:${BUSINESS.email}`;
}

export function telLink(raw: string): string {
  return `tel:${raw}`;
}

/** Joins BUSINESS.locations with correct English grammar regardless of count:
 *  "Kumasi" / "Kumasi and Accra" / "Kumasi, Nkawkaw, Kwahu and Accra, Ghana". */
export function locationsList(): string {
  const locs = [...BUSINESS.locations];
  if (locs.length <= 1) return locs.join('');
  if (locs.length === 2) return locs.join(' and ');
  const last = locs.pop();
  return `${locs.join(', ')} and ${last}`;
}
