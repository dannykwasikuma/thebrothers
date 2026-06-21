import React from 'react';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import { SOCIAL_LINKS, type SocialLink } from '@/lib/business';

/** lucide-react has no TikTok or X (Twitter) icons, so these two are hand-drawn SVGs
 *  matching lucide's stroke style (24x24 viewbox, currentColor, ~2px stroke). */
const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"/>
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const ICONS: Record<SocialLink['icon'], React.FC<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: TikTokIcon,
  x: XIcon,
};

interface SocialLinksProps {
  variant?: 'icons' | 'list';
  className?: string;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ variant = 'icons', className = '' }) => {
  if (variant === 'list') {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {SOCIAL_LINKS.map((social) => {
          const Icon = ICONS[social.icon];
          return (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 text-[#F5F0E8]/70 hover:text-[#C9A84C] transition-colors duration-200"
            >
              <span className="h-9 w-9 rounded-full border border-[#C9A84C]/25 flex items-center justify-center flex-shrink-0 group-hover:border-[#C9A84C] group-hover:bg-[#C9A84C]/10 group-hover:scale-110 transition-all duration-200">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm">
                <span className="text-[#C9A84C]/80 group-hover:text-[#C9A84C]">{social.name}:</span> {social.handle}
              </span>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${className}`}>
      {SOCIAL_LINKS.map((social) => {
        const Icon = ICONS[social.icon];
        return (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.name}
            title={`${social.name}: ${social.handle}`}
            className="h-10 w-10 rounded-full border border-[#C9A84C]/25 flex items-center justify-center text-[#F5F0E8]/70 hover:text-[#C9A84C] hover:border-[#C9A84C] hover:bg-[#C9A84C]/10 hover:scale-110 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
};

export default SocialLinks;
