import { Leaf, Send } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="footer" className="pb-8 pt-2 sm:pb-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="glass-panel section-shell p-5 sm:p-7">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="#home" className="inline-flex items-center gap-2 text-2xl font-bold text-plant-green">
              <Leaf className="h-5 w-5" />
              Planto.
            </a>

            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Bringing nature closer to you. Premium indoor plants for every space and lifestyle.
            </p>

            <div className="mt-5 flex gap-2">
              {['IG', 'FB', 'X'].map((social) => (
                <a
                  key={social}
                  href="#"
                  aria-label={social}
                  className="rounded-full border border-plant-border/70 bg-plant-bg/75 px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-plant-green hover:text-plant-green"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white">Quick Link's</h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Home', href: '#home' },
                { label: 'My Plants', href: '#my-plants' },
                { label: 'Our Sell', href: '#our-sell' },
                { label: 'Our Best', href: '#our-best' },
              ].map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-text-secondary transition-colors hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white">For Every Update</h3>
            <p className="mb-4 max-w-md text-sm text-text-secondary">
              Subscribe to our newsletter for plant care tips and exclusive offers.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full flex-1 rounded-full border border-plant-border/80 bg-plant-bg/80 px-4 py-3 text-sm text-white placeholder:text-text-secondary focus:border-plant-green focus:outline-none"
              />

              <button className="inline-flex items-center justify-center gap-2 rounded-full bg-plant-green px-5 py-3 text-sm font-bold text-plant-bg transition-colors hover:bg-plant-green-hover">
                Subscribe
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

          <div className="mt-8 border-t border-plant-border/60 pt-6 text-center">
            <p className="text-sm text-text-secondary">Planto | all right reserve</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
