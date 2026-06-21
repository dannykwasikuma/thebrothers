import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export interface ServiceCategoryContent {
  title: string;
  tagline: string;
  subcategory: string;
  description: string[];
  highlights: string[];
  image?: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const ServiceCategoryPage: React.FC<{ content: ServiceCategoryContent }> = ({ content }) => {
  const { title, tagline, subcategory, description, highlights, image } = content;
  const bookingHref = `/booking?category=catering&subcategory=${encodeURIComponent(subcategory)}`;

  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      <section className="bg-secondary py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={image || '/images/wedding-catering.png'} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/80 to-secondary/40" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <span className="text-primary text-xs tracking-[0.28em] uppercase font-sans">Our Services</span>
          <h1 className="text-4xl md:text-6xl font-display text-primary mt-4 mb-6">{title}</h1>
          <p className="text-lg md:text-2xl font-serif text-secondary-foreground/90 italic">{tagline}</p>
        </motion.div>
      </section>

      <section className="py-24 px-4 max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start mb-20"
        >
          <div className="space-y-5 text-muted-foreground font-sans leading-relaxed text-lg">
            {description.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            <div className="pt-4">
              <Link href={bookingHref}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-serif h-12 px-8 rounded-none hover:scale-[1.02] transition-all">
                  Book This Service
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-card border border-border p-8">
            <h3 className="text-xl font-serif text-foreground mb-6">What's Included</h3>
            <ul className="space-y-4">
              {highlights.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground font-sans">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-secondary text-secondary-foreground p-12 text-center"
        >
          <h3 className="text-2xl font-display text-primary mb-4">Ready to Book?</h3>
          <p className="font-sans text-secondary-foreground/80 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            Tell us about your event and we'll tailor a {title.toLowerCase()} package to fit your guest count, venue, and budget.
          </p>
          <Link href={bookingHref}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-serif h-12 px-10 rounded-none hover:scale-[1.02] transition-all">
              Start Your Booking
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default ServiceCategoryPage;
