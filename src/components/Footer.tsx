import { Globe, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { name: "Plan Trip", href: "/plan" },
    { name: "Destinations", href: "/destinations" },
    { name: "Northeast India", href: "/northeast" },
    { name: "Guides", href: "/guides" },
    { name: "Community", href: "/community" },
  ];

  const destinations = [
    { name: "Shillong", href: "/destinations/shillong" },
    { name: "Kaziranga", href: "/destinations/kaziranga" },
    { name: "Tawang", href: "/destinations/tawang" },
    { name: "Majuli Island", href: "/destinations/majuli" },
    { name: "Darjeeling", href: "/destinations/darjeeling" },
  ];

  const support = [
    { name: "Help Center", href: "/help" },
    { name: "Contact Us", href: "/contact" },
    { name: "Trip Insurance", href: "/insurance" },
    { name: "Travel Tips", href: "/tips" },
    { name: "Safety Guidelines", href: "/safety" },
  ];

  const company = [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
    { name: "Partner with Us", href: "/partner" },
    { name: "Affiliate Program", href: "/affiliate" },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-white">TripWeave</span>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              Discover the incredible beauty of India with AI-powered trip planning. 
              From the mystical Northeast to heritage monuments, we make travel planning effortless.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-white/80">hello@tripweave.in</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-white/80">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-white/80">New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-white/70 hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Destinations */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Top Destinations</h3>
            <ul className="space-y-3">
              {destinations.map((destination) => (
                <li key={destination.name}>
                  <a 
                    href={destination.href}
                    className="text-white/70 hover:text-primary transition-colors duration-200"
                  >
                    {destination.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {support.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href}
                    className="text-white/70 hover:text-primary transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href}
                    className="text-white/70 hover:text-primary transition-colors duration-200"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-white/5 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Get Travel Inspiration & Deals
            </h3>
            <p className="text-white/70 mb-4">
              Subscribe to our newsletter for the latest travel guides and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Social Links & Bottom */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-white/70 text-sm">
              © 2024 TripWeave. All rights reserved. Made with ❤️ for Indian travelers.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Facebook className="h-5 w-5 text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Twitter className="h-5 w-5 text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Youtube className="h-5 w-5 text-white" />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-4 text-sm">
              <a href="/privacy" className="text-white/70 hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-white/70 hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;