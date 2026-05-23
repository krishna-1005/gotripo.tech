import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Instagram, Twitter, Facebook, Youtube, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/5 pt-20 pb-10 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-8">
            <Link to="/" className="inline-block">
              <Logo className="scale-100 origin-left" />
            </Link>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
              GoTripo is India's leading AI-powered travel ecosystem. We're on a mission to modernize how the subcontinent explores, by combining deep local insights with state-of-the-art generative intelligence.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                <div className="size-8 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                  <Mail className="size-4 text-accent" />
                </div>
                <a href="mailto:gotripo081@gmail.com" className="hover:text-accent transition">gotripo081@gmail.com</a>
              </div>
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                <div className="size-8 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                  <Phone className="size-4 text-accent" />
                </div>
                <a href="tel:+916361890349" className="hover:text-accent transition">+91 63618 90349</a>
              </div>
              <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-sm">
                <div className="size-8 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="size-4 text-accent" />
                </div>
                <span>Level 4, Brigade Tech Gardens, ITPL Main Rd,<br />Brookefield, Bengaluru, Karnataka 560037</span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-8 uppercase tracking-[0.2em] text-[10px]">Services</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/planner-single" className="text-slate-500 hover:text-accent transition">AI Trip Planner</Link></li>
              <li><Link to="/collaborate" className="text-slate-500 hover:text-accent transition">Group Collaboration</Link></li>
              <li><Link to="/yatra/shop" className="text-slate-500 hover:text-accent transition">Yatra Kit Shop</Link></li>
              <li><Link to="/explore-india" className="text-slate-500 hover:text-accent transition">Destination Explore</Link></li>
              <li><Link to="/community" className="text-slate-500 hover:text-accent transition">Travel Community</Link></li>
              <li><Link to="/passport" className="text-slate-500 hover:text-accent transition">Digital Passport</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-8 uppercase tracking-[0.2em] text-[10px]">Company</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/about" className="text-slate-500 hover:text-accent transition">Our Story</Link></li>
              <li><Link to="/careers" className="text-slate-500 hover:text-accent transition flex items-center gap-2">
                Careers <span className="px-1.5 py-0.5 rounded-md bg-accent/10 text-accent text-[8px] font-black uppercase">Hiring</span>
              </Link></li>
              <li><Link to="/pricing" className="text-slate-500 hover:text-accent transition">Pro Membership</Link></li>
              <li><Link to="/cart" className="text-slate-500 hover:text-accent transition">My Cart</Link></li>
              <li><Link to="/orders" className="text-slate-500 hover:text-accent transition">Order History</Link></li>
              <li><a href="#voices" className="text-slate-500 hover:text-accent transition">User Testimonials</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-display font-bold text-slate-900 dark:text-white mb-8 uppercase tracking-[0.2em] text-[10px]">Legal & Social</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/terms" className="text-slate-500 hover:text-accent transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-slate-500 hover:text-accent transition">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-slate-500 hover:text-accent transition">Cookie Policy</Link></li>
            </ul>
            <div className="mt-8 flex items-center gap-3">
              <a href="#" className="size-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-accent hover:text-white transition-all">
                <Instagram className="size-4" />
              </a>
              <a href="#" className="size-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-accent hover:text-white transition-all">
                <Twitter className="size-4" />
              </a>
              <a href="#" className="size-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-accent hover:text-white transition-all">
                <Facebook className="size-4" />
              </a>
              <a href="#" className="size-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-accent hover:text-white transition-all">
                <Youtube className="size-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-4">
            <span>© {currentYear} GoTripo Technology Private Limited.</span>
            <span className="hidden md:block text-slate-700 dark:text-white/10">|</span>
            <span>CIN: U74999KA2026PTC123456</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Status: Operational
            </span>
            <span className="text-slate-700 dark:text-white/10">|</span>
            <span>Handcrafted in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
