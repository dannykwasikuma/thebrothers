import React from 'react';
import { motion } from 'framer-motion';
import { BUSINESS } from '@/lib/business';
import SocialLinks from '@/components/SocialLinks';

const About: React.FC = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Hero */}
      <section className="bg-secondary py-20 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-display text-primary mb-6">Our Story</h1>
          <p className="text-lg md:text-2xl font-serif text-secondary-foreground/90 italic">
            {BUSINESS.slogan}
          </p>
        </motion.div>
      </section>

      {/* Content */}
      <section className="py-24 px-4 max-w-5xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32"
        >
          <div>
            <h2 className="text-3xl font-display text-primary mb-6">The Genesis</h2>
            <div className="space-y-4 text-muted-foreground font-sans leading-relaxed text-lg">
              <p>
                The Brothers Ushering & Catering Services was born out of a profound passion for excellence and a vision to redefine the event experience in Ghana. What started as a small, dedicated team of hospitality enthusiasts has grown into a premier luxury service provider.
              </p>
              <p>
                We realized that true luxury isn't just about what is served on the plate or the uniform worn by the staff; it is about the feeling imparted to every guest. It's about anticipation, grace, and flawless execution.
              </p>
            </div>
          </div>
          <div className="h-[500px] border border-primary/20 p-2">
            <img 
              src="/images/wedding-catering.png" 
              alt="Catering History" 
              className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center flex-row-reverse mb-32"
        >
          <div className="order-2 md:order-1 h-[500px] border border-primary/20 p-2">
            <img 
              src="/images/ushering-team.png" 
              alt="Our Team" 
              className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-display text-primary mb-6">Our Philosophy</h2>
            <div className="space-y-4 text-muted-foreground font-sans leading-relaxed text-lg">
              <p>
                Every event tells a story. At The Brothers, we see ourselves as the invisible orchestrators of your most cherished narratives. Our philosophy rests on three pillars: uncompromising quality, cinematic presentation, and intuitive service.
              </p>
              <p>
                Whether it's a corporate gala at a 5-star hotel in Accra or an intimate private dining experience, our commitment remains the same: to deliver an unhurried, prestigious atmosphere where you and your guests feel truly celebrated.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-card border border-border p-12 text-center"
          >
            <h3 className="text-2xl font-display text-primary mb-4">Our Mission</h3>
            <p className="font-sans text-muted-foreground text-lg leading-relaxed">
              To provide unparalleled catering and ushering services that elevate every occasion, ensuring seamless execution and leaving a lasting impression of elegance and prestige.
            </p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-secondary text-secondary-foreground p-12 text-center"
          >
            <h3 className="text-2xl font-display text-primary mb-4">Our Vision</h3>
            <p className="font-sans text-secondary-foreground/80 text-lg leading-relaxed">
              To be the most sought-after name in African luxury hospitality, setting the gold standard for event services across the continent and beyond.
            </p>
          </motion.div>
        </div>

        {/* Follow Us */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center border-t border-border/50 pt-16"
        >
          <h3 className="text-2xl font-display text-primary mb-2">Follow Our Journey</h3>
          <p className="text-muted-foreground font-sans mb-8">See our latest events and behind-the-scenes moments.</p>
          <SocialLinks variant="icons" className="justify-center" />
        </motion.div>
      </section>
    </div>
  );
};

export default About;
