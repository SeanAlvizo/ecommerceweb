import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Visit Our Showroom',
    lines: ['123 Design District', 'Makati City, Metro Manila', 'Philippines 1200'],
  },
  {
    icon: Phone,
    title: 'Call Us',
    lines: ['+63 (2) 8123 4567', '+63 917 123 4567'],
  },
  {
    icon: Mail,
    title: 'Email Us',
    lines: ['hello@algura.ph', 'support@algura.ph'],
  },
  {
    icon: Clock,
    title: 'Business Hours',
    lines: ['Monday – Friday: 10AM – 7PM', 'Saturday: 10AM – 5PM', 'Sunday: Closed'],
  },
];

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1200));
    setSending(false);
    setSubmitted(true);
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-24 md:py-28 bg-primary text-on-primary overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-tertiary rounded-full blur-[150px] opacity-15 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-light rounded-full blur-[100px] opacity-15 translate-y-1/2 -translate-x-1/4" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="section-label text-tertiary-fixed">
              Get In Touch
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
              LET'S <span className="italic font-light">TALK.</span>
            </h1>
            <p className="text-on-primary/60 text-lg max-w-xl leading-relaxed">
              Whether you have a question about our collections, need design consultation, 
              or want to discuss a custom project — we'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 md:py-20 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 -mt-28 md:-mt-32 relative z-20">
            {contactInfo.map((info, idx) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-surface p-7 shadow-card border border-outline-variant/10 rounded-2xl card-hover group"
              >
                <div className="w-12 h-12 bg-primary/8 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:shadow-elevated transition-all duration-500">
                  <info.icon size={20} className="text-primary group-hover:text-on-primary transition-colors duration-500" />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-widest mb-4">{info.title}</h3>
                {info.lines.map((line, i) => (
                  <p key={i} className="text-on-surface-variant text-sm leading-relaxed">{line}</p>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Map */}
      <section className="py-16 md:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-label text-tertiary">
                Send a Message
              </span>
              <h2 className="text-3xl font-bold tracking-tighter mb-8">
                We'd love to hear from you
              </h2>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-surface-container-low p-12 text-center rounded-2xl"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={36} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Message Sent!</h3>
                  <p className="text-on-surface-variant mb-6 leading-relaxed">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                    }}
                    className="text-primary font-bold text-sm uppercase tracking-widest hover:text-primary-container transition-colors"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="input-premium"
                    />
                    <input
                      type="email"
                      placeholder="Email Address *"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="input-premium"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="input-premium"
                    />
                    <select
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="input-premium text-on-surface-variant"
                    >
                      <option value="">Select Subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Support</option>
                      <option value="custom">Custom Project</option>
                      <option value="wholesale">Wholesale / Trade</option>
                      <option value="collaboration">Collaboration</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Your Message *"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="input-premium resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sending}
                    className={`btn-primary w-full ${sending ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {sending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Map / Location Visual */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-5"
            >
              <div className="flex-1 bg-surface-container-low overflow-hidden min-h-[400px] relative rounded-2xl shadow-card">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.802548418088!2d121.01945927603773!3d14.554729285921726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8e9e5b0d58f%3A0x6dd0f1f7cc7fd4a5!2sMakati%2C%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1700000000000!5m2!1sen!2sph"
                  className="w-full h-full absolute inset-0 border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ALGURA Showroom Location"
                />
              </div>
              <div className="bg-primary text-on-primary p-8 rounded-2xl">
                <h3 className="font-bold text-lg mb-3">Visit Our Showroom</h3>
                <p className="text-on-primary/60 text-sm leading-relaxed mb-4">
                  Experience our collections in person. Our design consultants are on hand to help 
                  you find the perfect pieces for your space.
                </p>
                <p className="text-tertiary-fixed text-sm font-bold uppercase tracking-widest">
                  Walk-ins welcome · By appointment recommended
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
