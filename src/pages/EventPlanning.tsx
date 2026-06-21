import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { CalendarCheck, ClipboardList, Palette, Users2, Sparkles, MapPin } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const planningSteps = [
  {
    icon: ClipboardList,
    title: 'Discovery Consultation',
    desc: 'We sit down with you to understand your vision, budget, guest list, and the feeling you want your event to leave behind.',
  },
  {
    icon: Palette,
    title: 'Concept & Design',
    desc: 'Our team develops a full event concept — theme, colour palette, décor direction, and flow — presented for your approval.',
  },
  {
    icon: Users2,
    title: 'Vendor Coordination',
    desc: 'We manage every vendor relationship — florists, decorators, photographers, entertainment — so you only have one number to call.',
  },
  {
    icon: CalendarCheck,
    title: 'Timeline & Logistics',
    desc: 'A minute-by-minute run sheet is built and shared with every team on-site, so the day unfolds without a single hitch.',
  },
  {
    icon: MapPin,
    title: 'On-Site Execution',
    desc: 'Our coordinators are on the ground from setup to teardown, managing the room so you can simply enjoy your event.',
  },
  {
    icon: Sparkles,
    title: 'The Final Touch',
    desc: 'From welcome signage to the last guest farewell, every detail is considered — because the small things make the big moments.',
  },
];

const packages = [
  {
    name: 'Day-of Coordination',
    price: 'GHS 1,500',
    unit: 'per event',
    desc: 'You\u2019ve done the planning — we make sure the day itself runs perfectly. Includes a dedicated coordinator and run-sheet management.',
  },
  {
    name: 'Partial Planning',
    price: 'GHS 3,800',
    unit: 'per event',
    desc: 'Ideal if you\u2019ve started planning but need expert hands to finish strong — vendor management, design refinement, and full day-of execution.',
    featured: true,
  },
  {
    name: 'Full-Service Planning',
    price: 'Custom',
    unit: 'quote',
    desc: 'From the very first idea to the last dance — complete concept design, vendor sourcing, budget management, and flawless execution.',
  },
];

const EventPlanning: React.FC = () => {
  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      {/* ── PAGE HERO ── */}
      <div className="bg-[#0D0A07] py-28 px-4 text-center border-b border-[#C9A84C]/20 relative overflow-hidden">
        <div className="absolute inset-0 pattern-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0D0A07]/40 to-[#0D0A07]" />
        <motion.div
          className="relative z-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#C9A84C] text-xs tracking-[0.28em] uppercase font-sans">From Vision to Reality</span>
          <h1 className="text-4xl md:text-6xl font-display text-[#C9A84C] mt-4 mb-6 gold-shimmer">Event Planning</h1>
          <p className="text-xl font-serif text-[#F5F0E8]/90 italic">
            Full-service event design and coordination, so every detail is handled with intention.
          </p>
        </motion.div>
      </div>

      {/* ── INTRO ── */}
      <div className="max-w-4xl mx-auto px-4 mt-20 mb-16 text-center">
        <p className="text-lg font-serif text-muted-foreground leading-relaxed">
          Catering and ushering are at the heart of what we do — but a truly unforgettable event needs a vision
          that ties everything together. Our event planning team designs, coordinates, and executes the entire
          experience, from the first sketch to the final farewell.
        </p>
      </div>

      {/* ── PROCESS ── */}
      <div className="max-w-7xl mx-auto px-4 mb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-display text-primary mb-3">Our Planning Process</h2>
          <div className="section-rule" />
        </div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          {planningSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={fadeIn}
                className="bg-card border border-border p-8 card-hover relative"
              >
                <span className="absolute top-6 right-6 font-display text-3xl text-primary/15">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-serif text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ── PACKAGES ── */}
      <div className="max-w-7xl mx-auto px-4 mb-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-display text-primary mb-3">Planning Packages</h2>
          <div className="section-rule" />
        </div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          {packages.map((pkg) => (
            <motion.div
              key={pkg.name}
              variants={fadeIn}
              className={`bg-card border p-10 text-center flex flex-col card-hover relative ${
                pkg.featured ? 'border-primary/50' : 'border-border'
              }`}
            >
              {pkg.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#8B0000] text-white text-xs font-bold px-4 py-1 uppercase tracking-wider shadow-lg">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-serif text-foreground mb-3 mt-2">{pkg.name}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-grow">{pkg.desc}</p>
              <p className="text-3xl font-serif text-primary mb-1">{pkg.price}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-8">{pkg.unit}</p>
              <Link href="/booking">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-serif rounded-none hover:scale-[1.02] transition-all">
                  Enquire Now
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── CTA ── */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-[#0D0A07] border border-[#C9A84C]/20 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 pattern-overlay opacity-50" />
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-display text-[#C9A84C] mb-4">Let's Plan Something Unforgettable</h3>
            <p className="text-[#F5F0E8]/70 font-serif italic mb-8 max-w-xl mx-auto">
              Tell us about your event and we'll craft a planning approach tailored entirely to you.
            </p>
            <Link href="/contact">
              <Button className="h-13 px-10 bg-[#C9A84C] hover:bg-[#C9A84C]/90 text-[#0D0A07] font-serif rounded-none hover:scale-105 transition-all">
                Start Planning
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPlanning;
