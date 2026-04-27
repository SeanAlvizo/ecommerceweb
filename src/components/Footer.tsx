import { Link } from 'react-router-dom';
import { ArrowRight, Instagram, Twitter, Facebook } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-primary text-on-primary pt-20 pb-10 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary-light rounded-full blur-[120px] opacity-10 -translate-y-1/2 translate-x-1/4" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="text-2xl font-headline font-extrabold tracking-tighter text-white mb-6 block">
              ALGURA
            </Link>
            <p className="text-on-primary/60 text-sm leading-relaxed max-w-xs">
              Curating architectural objects and precision-engineered technology for the modern environment.
            </p>
            <div className="flex gap-3 mt-6">
              {[Instagram, Twitter, Facebook].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-10 h-10 rounded-lg border border-on-primary/15 flex items-center justify-center text-on-primary/50 hover:text-white hover:border-tertiary-fixed hover:bg-tertiary-fixed/10 transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-headline font-bold text-sm uppercase tracking-widest mb-6 text-tertiary-fixed">Shop</h4>
            <ul className="space-y-3.5">
              <li><Link to="/collections/lighting" className="text-on-primary/60 text-sm hover:text-white transition-colors duration-300">Lighting</Link></li>
              <li><Link to="/collections/furniture" className="text-on-primary/60 text-sm hover:text-white transition-colors duration-300">Furniture</Link></li>
              <li><Link to="/collections/objects" className="text-on-primary/60 text-sm hover:text-white transition-colors duration-300">Objects</Link></li>
              <li><Link to="/collections" className="text-on-primary/60 text-sm hover:text-white transition-colors duration-300">All Collections</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline font-bold text-sm uppercase tracking-widest mb-6 text-tertiary-fixed">Company</h4>
            <ul className="space-y-3.5">
              <li><Link to="/about" className="text-on-primary/60 text-sm hover:text-white transition-colors duration-300">About Us</Link></li>
              <li><Link to="/contact" className="text-on-primary/60 text-sm hover:text-white transition-colors duration-300">Contact</Link></li>
              <li><Link to="/order-tracking" className="text-on-primary/60 text-sm hover:text-white transition-colors duration-300">Track Order</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-headline font-bold text-sm uppercase tracking-widest mb-6 text-tertiary-fixed">Newsletter</h4>
            <p className="text-on-primary/60 text-sm mb-6 leading-relaxed">
              Join our list for exclusive releases and editorial content.
            </p>
            <form className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="flex-1 bg-white/10 border border-on-primary/15 px-4 py-3 text-sm text-white placeholder:text-on-primary/40 rounded-lg focus:outline-none focus:border-tertiary-fixed/50 focus:ring-2 focus:ring-tertiary-fixed/10 transition-all duration-300"
              />
              <button className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-3 text-sm font-bold rounded-lg hover:opacity-90 transition-all duration-300 flex items-center gap-1.5">
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-on-primary/10 gap-6">
          <p className="text-on-primary/40 text-xs">
            © {new Date().getFullYear()} ALGURA Cartify. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link to="/privacy" className="text-on-primary/40 text-xs hover:text-on-primary/70 transition-colors duration-300">Privacy Policy</Link>
            <Link to="/terms" className="text-on-primary/40 text-xs hover:text-on-primary/70 transition-colors duration-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
