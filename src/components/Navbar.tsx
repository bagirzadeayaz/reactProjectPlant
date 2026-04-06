import { useState } from 'react';
import { ChevronDown, Search, ShoppingBag, Leaf, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { label: 'Home', href: '#home' },
    { label: "Plants Type's", href: '#my-plants', hasMenu: true },
    { label: 'More', href: '#our-sell' },
    { label: 'Contact', href: '#footer' },
  ];

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-linear-to-b from-black/45 to-transparent">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-18 items-center justify-between gap-4 text-white sm:h-20">
          <a href="#home" className="flex items-center gap-2 text-lg font-bold sm:text-xl">
            <Leaf className="h-4 w-4 text-plant-green" />
            <span>Planto.</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-1 text-sm font-medium text-white/85 transition-colors hover:text-white"
              >
                {item.label}
                {item.hasMenu && <ChevronDown className="h-3 w-3" />}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button className="rounded-full p-2 text-white/85 transition hover:text-white" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 text-white/85 transition hover:text-white" aria-label="Cart">
              <ShoppingBag className="h-4 w-4" />
            </button>
            <button className="rounded-full p-2 text-white/85 transition hover:text-white" aria-label="Menu">
              <Menu className="h-4 w-4" />
            </button>
          </div>

          <button
            className="rounded-full border border-white/20 bg-black/25 p-2 text-white md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="animate-pop border-t border-white/10 bg-black/80 px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-6xl space-y-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block text-sm font-medium text-white/80 transition-colors hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}

            <div className="flex items-center gap-3 border-t border-white/15 pt-3">
              <button className="rounded-full border border-white/15 bg-white/5 p-2 text-white/85 transition-colors hover:text-white">
                <Search className="h-4 w-4" />
              </button>
              <button className="rounded-full border border-white/15 bg-white/5 p-2 text-white/85 transition-colors hover:text-white">
                <ShoppingBag className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
