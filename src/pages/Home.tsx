import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import { motion, useInView } from 'framer-motion';
import { Star, ChevronRight, CheckCircle2, ArrowDown } from 'lucide-react';
import { useListFeaturedServices, useListTestimonials } from '@/hooks/useCatalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import CustomerReviews from '@/components/CustomerReviews';

/* ── animated counter ── */
function AnimatedCounter({ target, suffix = '+' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: 'easeOut' } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const Home: React.FC = () => {
  const { data: featuredServices, isLoading: loadingServices } = useListFeaturedServices();
  const { data: testimonials, isLoading: loadingTestimonials } = useListTestimonials();

  return (
    <div className="w-full bg-background min-h-screen">

      {/* Sits just below the fixed Navbar (~80px tall) so it doesn't overlap
          the logo/menu, but still appears above the hero without disrupting
          the hero's own full-screen layout. */}
      <div className="fixed top-[64px] md:top-[80px] left-0 right-0 z-30">
        <AnnouncementBanner />
      </div>

      {/* ── HERO ── */}
      <section className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero-bg.png"
            alt="Luxury Wedding Reception"
            className="w-full h-full object-cover object-center"
            style={{ animation: 'heroPulse 18s ease-in-out infinite' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D0A07]/80 via-[#0D0A07]/60 to-[#0D0A07]/90" />
          <div className="absolute inset-0 pattern-overlay" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          >
            <motion.span
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, letterSpacing: '0.32em' }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="text-[#C9A84C] font-sans uppercase text-xs md:text-sm font-semibold mb-5 block"
            >
              ✦ Welcome to Prestige Hospitality ✦
            </motion.span>

            <h1
              className="hero-title font-display font-bold text-[#F5F0E8] mb-2 leading-[1.05]"
              style={{ fontSize: 'clamp(3rem, 9vw, 6rem)', animation: 'heroSlideUp 1s ease 0.3s both' }}
            >
              THE BROTHERS
            </h1>
            <p
              className="font-display text-[#C9A84C] mb-4 tracking-[0.18em]"
              style={{ fontSize: 'clamp(0.95rem, 2.2vw, 1.4rem)', animation: 'heroSlideUp 1s ease 0.45s both' }}
            >
              CATERING SERVICES
            </p>

            <div className="w-20 h-[2px] bg-gradient-to-r from-[#8B0000] to-[#C9A84C] mx-auto mb-6" />

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6 }}
              className="text-xl md:text-2xl font-serif text-[#F5F0E8]/85 italic mb-10"
            >
              Ghana's Most Trusted Name in Luxury Catering, Ushering &amp; Event Planning
            </motion.p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center w-full sm:w-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.85 }}
          >
            <Link href="/booking">
              <Button className="w-full sm:w-auto h-14 px-10 btn-shimmer text-[#0D0A07] text-lg font-serif rounded-none transition-all shadow-lg shadow-[#C9A84C]/20 hover:shadow-[#C9A84C]/40 hover:scale-105">
                Book an Event
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="w-full sm:w-auto h-14 px-10 border-[#C9A84C]/60 text-[#C9A84C] hover:bg-[#C9A84C]/10 text-lg font-serif rounded-none transition-all">
                Our Story
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#F5F0E8]/40">
          <span className="text-[10px] tracking-[0.22em] uppercase font-sans">Scroll</span>
          <ArrowDown className="w-4 h-4 scroll-indicator" />
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="bg-[#C9A84C]">
        <motion.div
          className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-[#0D0A07]/15"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          {[
            { value: 500, label: 'Events Delivered' },
            { value: 6,   label: 'Years of Excellence', suffix: '+' },
            { value: 1200,label: 'Happy Clients' },
            { value: 50,  label: 'Expert Staff' },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeIn} className="stat-strip-item py-7 px-6 text-center">
              <p className="font-display text-3xl md:text-4xl font-black text-[#0D0A07]">
                <AnimatedCounter target={s.value} suffix={s.suffix ?? '+'} />
              </p>
              <p className="text-[10px] tracking-[0.22em] uppercase text-[#0D0A07]/60 font-sans mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── INTRO ── */}
      <section className="py-24 px-4 bg-[#0D0A07] border-b border-[#C9A84C]/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeIn}>
            <span className="text-[#C9A84C] text-xs tracking-[0.28em] uppercase font-sans">Our Craft</span>
            <h2 className="text-3xl md:text-5xl font-display text-[#C9A84C] mt-4 mb-8 gold-shimmer">Unforgettable Experiences</h2>
            <div className="section-rule" />
            <p className="text-lg md:text-xl font-serif text-[#F5F0E8]/75 leading-relaxed">
              From intimate private dining to 500-guest wedding receptions, The Brothers brings a cinematic level of
              elegance, meticulous planning, and unparalleled culinary excellence to every event. We don't just cater —
              we orchestrate moments that linger in memory for a lifetime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="py-24 px-4 bg-[#0D0A07]">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <span className="text-[#C9A84C] text-xs tracking-[0.28em] uppercase font-sans">What We Offer</span>
            <h2 className="text-3xl md:text-5xl font-display text-[#C9A84C] mt-4 mb-4">Our Services</h2>
            <div className="section-rule" />
          </motion.div>

          {loadingServices ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => <div key={i} className="h-96 bg-muted/20 animate-pulse rounded-none" />)}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}
            >
              {featuredServices?.slice(0, 3).map((service) => (
                <motion.div key={service.id} variants={fadeIn}>
                  <Card className="h-full border border-[#C9A84C]/15 bg-[#0D0A07] rounded-none overflow-hidden group card-hover card-lift">
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={service.imageUrl || '/images/wedding-catering.png'}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D0A07]/80 via-transparent to-transparent" />
                      <div className="absolute inset-0 bg-[#C9A84C]/0 group-hover:bg-[#C9A84C]/5 transition-all duration-500 flex items-center justify-center">
                        <Link href={service.category === 'catering' ? '/catering' : '/ushering'}>
                          <Button variant="outline" className="border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0D0A07] rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <CardContent className="p-8 text-center">
                      <span className="text-[10px] tracking-[0.22em] uppercase text-[#C9A84C]/70 font-sans">{service.category}</span>
                      <h3 className="text-xl font-serif text-[#F5F0E8] mt-2 mb-3">{service.name}</h3>
                      <div className="w-8 h-[1px] bg-[#C9A84C]/30 mx-auto mb-4" />
                      <p className="text-[#F5F0E8]/60 font-sans line-clamp-3 mb-6 text-sm leading-relaxed">{service.description}</p>
                      <Link href={`/${service.category}`} className="inline-flex items-center text-[#C9A84C] font-medium font-serif hover:text-[#E2C97A] transition-colors text-sm">
                        Discover More <ChevronRight className="ml-1 w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          <div className="text-center mt-14">
            <Link href="/catering">
              <Button variant="outline" className="h-12 px-10 border-[#C9A84C]/50 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0D0A07] font-serif rounded-none transition-all">
                View All Services
              </Button>
            </Link>
          </div>

          {/* Event Planning teaser */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
            className="mt-20 border border-[#C9A84C]/20 bg-gradient-to-r from-[#1A1410] to-[#0D0A07] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div>
              <span className="text-[#C9A84C] text-xs tracking-[0.28em] uppercase font-sans">New</span>
              <h3 className="text-2xl md:text-3xl font-serif text-[#F5F0E8] mt-3 mb-3">Now Offering Full Event Planning</h3>
              <p className="text-[#F5F0E8]/60 font-sans max-w-xl">
                From concept design to day-of coordination — let our planning team handle every detail of your next event.
              </p>
            </div>
            <Link href="/event-planning">
              <Button className="h-13 px-10 bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-serif rounded-none hover:scale-105 transition-all whitespace-nowrap">
                Explore Event Planning
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-24 px-4 bg-[#0A0806]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn} className="relative">
              <div className="absolute -inset-3 border border-[#C9A84C]/15 pointer-events-none" />
              <img
                src="/images/ushering-team.png"
                alt="Professional Ushering Team"
                className="w-full h-[560px] object-cover shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0806] to-transparent" />
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-7">
              <span className="text-[#C9A84C] text-xs tracking-[0.28em] uppercase font-sans">Why Choose Us</span>
              <h2 className="text-3xl md:text-5xl font-display text-[#C9A84C]">The Premium Standard</h2>
              <div className="w-16 h-[2px] bg-gradient-to-r from-[#8B0000] to-[#C9A84C]" />
              <p className="text-lg font-serif text-[#F5F0E8]/70 leading-relaxed">
                We blend traditional Ghanaian warmth with world-class hospitality standards — delivering an unmatched
                service experience at every event we touch.
              </p>

              <ul className="space-y-5">
                {[
                  'Impeccably trained ushering staff for every occasion',
                  'Gourmet culinary experiences rooted in Ghanaian heritage',
                  'Meticulous attention to every last detail',
                  'Cinematic event execution from start to finish',
                  'Dedicated coordinator assigned to every client',
                ].map((item, i) => (
                  <motion.li key={i} variants={fadeIn} className="flex items-start gap-4">
                    <CheckCircle2 className="w-5 h-5 text-[#C9A84C] flex-shrink-0 mt-1" />
                    <span className="text-lg font-serif text-[#F5F0E8]/85">{item}</span>
                  </motion.li>
                ))}
              </ul>

              <Link href="/about" className="inline-block mt-4">
                <Button className="h-13 px-8 bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-serif rounded-none hover:scale-105 transition-all">
                  Learn About Us
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4 bg-[#0D0A07] border-t border-[#C9A84C]/10">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <span className="text-[#C9A84C] text-xs tracking-[0.28em] uppercase font-sans">Client Stories</span>
            <h2 className="text-3xl md:text-5xl font-display text-[#C9A84C] mt-4 mb-4">Words of Praise</h2>
            <div className="section-rule" />
          </motion.div>

          {loadingTestimonials ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3].map(i => <div key={i} className="h-64 bg-muted/10 animate-pulse rounded-none" />)}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            >
              {testimonials?.slice(0, 3).map((t) => (
                <motion.div key={t.id} variants={fadeIn}>
                  <Card className="h-full bg-[#0A0806] border border-[#C9A84C]/12 rounded-none p-8 flex flex-col relative overflow-hidden testimonial-quote card-hover card-lift">
                    <div className="flex text-[#C9A84C] mb-5 relative z-10">
                      {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-[#F5F0E8]/70 font-serif italic mb-7 flex-grow relative z-10 text-sm leading-relaxed">
                      "{t.quote}"
                    </p>
                    <div className="relative z-10 border-t border-[#C9A84C]/10 pt-5">
                      <p className="font-serif font-bold text-[#F5F0E8]">{t.authorName}</p>
                      {t.eventLabel && <p className="text-xs font-sans text-[#C9A84C]/60 mt-1 tracking-wider uppercase">{t.eventLabel}</p>}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <CustomerReviews />

      {/* ── CTA ── */}
      <section className="relative py-36 px-4 overflow-hidden flex items-center justify-center bg-[#0D0A07]">
        <div className="absolute inset-0 z-0">
          <img src="/images/outdoor-catering.png" alt="Outdoor Catering" className="w-full h-full object-cover object-center opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D0A07]/90 via-[#0D0A07]/70 to-[#0D0A07]/90" />
          <div className="absolute inset-0 pattern-overlay" />
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.span variants={fadeIn} className="text-[#C9A84C] text-xs tracking-[0.28em] uppercase font-sans">Get Started</motion.span>
            <motion.h2 variants={fadeIn} className="text-4xl md:text-6xl font-display text-[#C9A84C] my-6 gold-shimmer">
              Ready for Excellence?
            </motion.h2>
            <motion.p variants={fadeIn} className="text-xl font-serif text-[#F5F0E8]/85 mb-10">
              Let us transform your next event into an unforgettable masterpiece.
            </motion.p>
            <motion.div variants={fadeIn}>
              <Link href="/booking">
                <Button className="h-16 px-12 btn-shimmer text-[#0D0A07] text-xl font-serif rounded-none transition-all hover:scale-105 shadow-xl shadow-[#C9A84C]/25">
                  Request a Consultation
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
