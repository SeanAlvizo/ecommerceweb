import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Leaf, Gem, Users } from 'lucide-react';

const values = [
  {
    icon: Gem,
    title: 'Uncompromising Quality',
    description: 'Every piece is crafted from the finest materials, sourced from artisans and workshops renowned for their expertise.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Design',
    description: 'We are committed to responsible sourcing and sustainable manufacturing practices that respect our planet.',
  },
  {
    icon: Award,
    title: 'Timeless Aesthetics',
    description: 'Our designs transcend trends. Each object is created to be cherished for generations, not discarded with fads.',
  },
  {
    icon: Users,
    title: 'Artisan Partnerships',
    description: 'We collaborate directly with master craftspeople worldwide, ensuring fair wages and preserving traditional techniques.',
  },
];

const milestones = [
  { year: '2018', title: 'Founded in Manila', description: 'ALGURA began as a small studio with a vision to redefine modern living spaces.' },
  { year: '2019', title: 'First Collection Launch', description: 'Our debut lighting collection sold out within weeks, earning praise from design critics.' },
  { year: '2021', title: 'Expanded to Furniture', description: 'We introduced our signature furniture line, blending sculptural form with ergonomic precision.' },
  { year: '2023', title: 'International Presence', description: 'ALGURA pieces are now featured in curated spaces across Southeast Asia and beyond.' },
  { year: '2024', title: 'Digital Boutique', description: 'Launching our online experience to bring architectural design directly to your doorstep.' },
];

export const About = () => {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000"
            alt="ALGURA studio"
            className="w-full h-full object-cover scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <span className="inline-block text-white/70 text-sm font-bold uppercase tracking-[0.3em] mb-6">
              Our Story
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl text-white font-extrabold leading-[0.9] mb-8 tracking-tighter">
              CRAFTING <br />
              <span className="italic font-light text-white/90">THE FUTURE.</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              We believe in the power of design to transform everyday spaces into extraordinary experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 md:py-32 bg-surface">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label text-tertiary">
              Our Mission
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 tracking-tighter leading-tight">
              To bridge the gap between <span className="italic font-light">engineering precision</span> and <span className="italic font-light">artistic expression.</span>
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-2xl mx-auto">
              At ALGURA, we curate and create objects that sit at the intersection of functionality and art. 
              Every piece in our collection is a testament to human ingenuity — designed to elevate your space 
              and inspire your daily life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-32 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="section-label text-tertiary">What Drives Us</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Our Core Values</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 bg-surface border border-outline-variant/15 rounded-2xl card-hover"
              >
                <div className="w-14 h-14 bg-primary/8 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:shadow-elevated transition-all duration-500">
                  <value.icon size={24} className="text-primary group-hover:text-on-primary transition-colors duration-500" />
                </div>
                <h3 className="text-lg font-bold mb-3">{value.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 md:py-32 bg-primary text-on-primary overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-tertiary rounded-full blur-[150px] opacity-15 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-light rounded-full blur-[100px] opacity-15 translate-y-1/2 -translate-x-1/4" />
        
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="section-label text-tertiary-fixed">Journey</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Our Milestones</h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-on-primary/15 -translate-x-1/2" />

            <div className="space-y-14">
              {milestones.map((milestone, idx) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-8 ${
                    idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'} pl-16 md:pl-0`}>
                    <span className="text-tertiary-fixed text-3xl font-extrabold block mb-2">{milestone.year}</span>
                    <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                    <p className="text-on-primary/60 text-sm leading-relaxed">{milestone.description}</p>
                  </div>

                  {/* Dot */}
                  <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-tertiary-fixed border-4 border-primary z-10 shadow-lg" />

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team / CTA */}
      <section className="py-24 md:py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="aspect-[4/5] overflow-hidden rounded-3xl shadow-card"
          >
            <img
              src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1000"
              alt="ALGURA craftsmanship"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label text-tertiary">
              Craftsmanship
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 tracking-tighter leading-tight">
              Made by hand, <br />
              <span className="italic font-light">perfected by obsession.</span>
            </h2>
            <p className="text-on-surface-variant text-lg mb-6 leading-relaxed">
              Every ALGURA piece begins its journey with a sketch. From there, our team of designers 
              and engineers work in concert with master artisans to bring each concept to life.
            </p>
            <p className="text-on-surface-variant mb-10 leading-relaxed">
              We don't cut corners. We don't rush. We craft. The result is a collection of objects 
              that are as beautiful as they are functional — pieces that tell a story of skill, 
              patience, and an unwavering commitment to excellence.
            </p>
            <Link
              to="/collections"
              className="btn-primary inline-flex group"
            >
              Explore Our Work
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
