import React from 'react';
import { useListServices } from '@/hooks/useCatalog';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const fadeIn = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const Ushering: React.FC = () => {
  const { data: services, isLoading } = useListServices({ category: 'ushering' });

  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      {/* ── PAGE HERO ── */}
      <div className="bg-[#0D0A07] py-28 px-4 text-center border-b border-[#C9A84C]/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img src="/images/ushering-team.png" alt="Ushering" className="w-full h-full object-cover object-top" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0A07]/60 via-[#0D0A07]/75 to-[#0D0A07]" />
        <div className="absolute inset-0 pattern-overlay" />
        <motion.div
          className="relative z-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#C9A84C] text-xs tracking-[0.28em] uppercase font-sans">Grace in Motion</span>
          <h1 className="text-4xl md:text-6xl font-display text-[#C9A84C] mt-4 mb-6 gold-shimmer">Event Ushering</h1>
          <p className="text-xl font-serif text-[#F5F0E8]/90 italic">
            Impeccable coordination and poised hospitality for your most prestigious guests.
          </p>
        </motion.div>
      </div>

      {/* ── INTRO ── */}
      <div className="max-w-4xl mx-auto px-4 mt-20 mb-16 text-center">
        <p className="text-lg font-serif text-muted-foreground leading-relaxed">
          A flawless event is felt before it's seen — in the calm greeting at the door, the seamless seating,
          the quiet anticipation of every guest's need. Our ushers are trained to deliver exactly that, every time.
        </p>
      </div>

      {/* ── SERVICES GRID ── */}
      <div className="max-w-7xl mx-auto px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[500px] bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            {services?.map((service) => (
              <motion.div key={service.id} variants={fadeIn}>
                <Card className="h-full border border-border/50 bg-card rounded-none overflow-hidden flex flex-col group card-hover">
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={service.imageUrl || '/images/ushering-team.png'}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {service.featured && (
                      <div className="absolute top-4 left-4 bg-[#8B0000] text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider shadow-lg">
                        Featured
                      </div>
                    )}
                  </div>
                  <CardContent className="p-8 flex flex-col flex-grow text-center">
                    <h3 className="text-2xl font-serif text-foreground mb-2">{service.name}</h3>
                    {service.subcategory && (
                      <p className="text-primary text-sm font-sans uppercase tracking-widest mb-4">{service.subcategory}</p>
                    )}
                    <div className="w-12 h-[1px] bg-primary/30 mx-auto mb-6" />
                    <p className="text-muted-foreground font-sans mb-8 flex-grow leading-relaxed">{service.description}</p>

                    <div className="mt-auto">
                      <p className="text-2xl font-serif text-foreground mb-6">
                        GHS {service.price.toFixed(2)}
                        {service.priceUnit && <span className="text-sm font-sans text-muted-foreground ml-1">/ {service.priceUnit}</span>}
                      </p>
                      <Link href={`/booking?service=${service.id}`}>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-serif rounded-none transition-all hover:scale-[1.02]">
                          Book This Service
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── WHAT'S INCLUDED ── */}
      <div className="max-w-5xl mx-auto px-4 mt-24">
        <div className="bg-card border border-border p-10 md:p-12 text-center">
          <h3 className="text-2xl font-display text-primary mb-10">Every Package Includes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              ['Pre-event briefing & walkthrough', 'Professional uniforms, colour-coordinated', 'Event-specific training'],
              ['Dedicated team leader on-site', 'Guest seating management', 'Programme distribution'],
              ['VIP & special needs assistance', 'Post-event debrief report', 'Emergency protocol readiness'],
            ].map((col, i) => (
              <ul key={i} className="space-y-4">
                {col.map(item => (
                  <li key={item} className="flex items-start gap-3 text-muted-foreground text-sm">
                    <span className="text-primary mt-0.5">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA STRIP ── */}
      <div className="max-w-5xl mx-auto px-4 mt-16">
        <div className="bg-[#0D0A07] border border-[#C9A84C]/20 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 pattern-overlay opacity-50" />
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-display text-[#C9A84C] mb-4">Let's Discuss Your Event</h3>
            <p className="text-[#F5F0E8]/70 font-serif italic mb-8 max-w-xl mx-auto">
              Custom team sizes and packages are available for every occasion, from intimate dinners to 500-guest galas.
            </p>
            <Link href="/contact">
              <Button className="h-13 px-10 bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-serif rounded-none hover:scale-105 transition-all">
                Request a Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ushering;
