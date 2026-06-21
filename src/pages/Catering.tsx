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

const Catering: React.FC = () => {
  const { data: services, isLoading } = useListServices({ category: 'catering' });

  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      {/* ── PAGE HERO ── */}
      <div className="bg-[#0D0A07] py-28 px-4 text-center border-b border-[#C9A84C]/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-25">
          <img src="/images/corporate-catering.png" alt="Catering" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0A07]/60 via-[#0D0A07]/75 to-[#0D0A07]" />
        <div className="absolute inset-0 pattern-overlay" />
        <motion.div
          className="relative z-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#C9A84C] text-xs tracking-[0.28em] uppercase font-sans">Gourmet Excellence</span>
          <h1 className="text-4xl md:text-6xl font-display text-[#C9A84C] mt-4 mb-6 gold-shimmer">Culinary Excellence</h1>
          <p className="text-xl font-serif text-[#F5F0E8]/90 italic">
            Gourmet menus crafted with passion, presented with cinematic flair.
          </p>
        </motion.div>
      </div>

      {/* ── INTRO ── */}
      <div className="max-w-4xl mx-auto px-4 mt-20 mb-16 text-center">
        <p className="text-lg font-serif text-muted-foreground leading-relaxed">
          From regal wedding banquets to discreet executive dining, our culinary team blends traditional Ghanaian
          flavour with refined international technique. Every package below can be tailored to your guest count,
          venue, and vision.
        </p>
      </div>

      {/* ── SERVICES GRID ── */}
      <div className="max-w-7xl mx-auto px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4].map(i => (
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
                      src={service.imageUrl || '/images/wedding-catering.png'}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {service.featured && (
                      <div className="absolute top-4 left-4 bg-[#8B0000] text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider shadow-lg">
                        Most Popular
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

      {/* ── CTA STRIP ── */}
      <div className="max-w-5xl mx-auto px-4 mt-24">
        <div className="bg-[#0D0A07] border border-[#C9A84C]/20 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 pattern-overlay opacity-50" />
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-display text-[#C9A84C] mb-4">Not Sure Which Package?</h3>
            <p className="text-[#F5F0E8]/70 font-serif italic mb-8 max-w-xl mx-auto">
              Our team will help you design the perfect catering experience for your event — no two menus are alike.
            </p>
            <Link href="/contact">
              <Button className="h-13 px-10 bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-serif rounded-none hover:scale-105 transition-all">
                Talk to Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catering;
