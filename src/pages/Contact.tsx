import React from 'react';
import { useSubmitContactForm } from '@/hooks/useCatalog';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { BUSINESS, whatsappLink, mailtoLink, telLink } from '@/lib/business';
import SocialLinks from '@/components/SocialLinks';

const Contact: React.FC = () => {
  const { toast } = useToast();
  const submitContactMutation = useSubmitContactForm();

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContactMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "Message Sent",
          description: "Thank you for contacting us. We will get back to you shortly.",
        });
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      },
      onError: (err: any) => {
        toast({
          title: "Error",
          description: err?.message || "Could not send message. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 mt-12 mb-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-display text-primary mb-6">Contact Us</h1>
          <p className="text-xl font-serif text-muted-foreground italic max-w-2xl mx-auto">
            Let us know how we can elevate your next event.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-display text-foreground mb-6">Get in Touch</h2>
            <p className="text-muted-foreground font-sans text-lg mb-8">
              Whether you are planning a grand wedding reception, a corporate gala, or an intimate private dinner, our team is ready to assist you.
            </p>

            <div className="space-y-6 font-sans">
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-primary mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Location</h4>
                  <p className="text-muted-foreground">{BUSINESS.locations.join(' | ')}<br/>Available for events nationwide.</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-6 h-6 text-primary mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Phone</h4>
                  {BUSINESS.phones.map((phone) => (
                    <p key={phone.raw} className="text-muted-foreground">
                      <a href={telLink(phone.raw)} className="hover:text-primary transition-colors">{phone.display}</a>
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="w-6 h-6 text-primary mr-4 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-foreground">Email</h4>
                  <p className="text-muted-foreground">
                    <a href={mailtoLink('Enquiry from website')} className="hover:text-primary transition-colors break-all">{BUSINESS.email}</a>
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-border/50">
              <h4 className="font-serif font-bold text-lg mb-4 text-foreground">Instant Support</h4>
              <a 
                href={whatsappLink()}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-none font-medium hover:bg-[#128C7E] transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Chat with us on WhatsApp
              </a>
            </div>

            <div className="pt-8 border-t border-border/50">
              <h4 className="font-serif font-bold text-lg mb-5 text-foreground">Follow Us</h4>
              <SocialLinks variant="list" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card border border-border p-8 md:p-10"
          >
            <h2 className="text-2xl font-serif text-foreground mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Your Name</label>
                  <Input required name="name" value={formData.name} onChange={handleChange} className="bg-background rounded-none border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <Input required type="email" name="email" value={formData.email} onChange={handleChange} className="bg-background rounded-none border-border" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number (Optional)</label>
                  <Input name="phone" value={formData.phone} onChange={handleChange} className="bg-background rounded-none border-border" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Subject (Optional)</label>
                  <Input name="subject" value={formData.subject} onChange={handleChange} className="bg-background rounded-none border-border" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Message</label>
                <Textarea required name="message" value={formData.message} onChange={handleChange} rows={6} className="bg-background rounded-none border-border resize-none" />
              </div>
              <Button type="submit" disabled={submitContactMutation.isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-serif text-lg h-12 rounded-none">
                {submitContactMutation.isPending ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
