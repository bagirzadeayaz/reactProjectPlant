import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, ChevronLeft, Heart, Minus, Plus, Truck, ShieldCheck, Droplets, Sun, Wind, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import type { Plant } from '../types';
import { trendyPlants, topSellingPlants, featuredPlant } from '../data/plants';

const allPlants: Plant[] = [...trendyPlants, ...topSellingPlants, featuredPlant];

/* ───────────────────── care-tip badge ───────────────────── */
const CareTip = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex flex-col items-center gap-2 rounded-2xl border border-plant-border/60 bg-plant-panel/60 px-4 py-4 text-center backdrop-blur-md transition-colors hover:border-plant-green/50">
    <Icon className="h-5 w-5 text-plant-green" />
    <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</span>
    <span className="text-sm font-bold text-white">{value}</span>
  </div>
);

/* ──────────────── related-product card ──────────────── */
const RelatedCard = ({ plant }: { plant: Plant }) => (
  <Link
    to={`/product/${String(plant.id)}`}
    className="group flex-shrink-0 w-48 sm:w-56"
    onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}
  >
    <div className="relative overflow-hidden rounded-2xl border border-plant-border/60 bg-plant-card/70 p-3 transition-all duration-300 hover:border-plant-green/50 hover:shadow-lg hover:shadow-plant-green/5">
      <div className="relative mb-3 overflow-hidden rounded-xl bg-plant-panel/70">
        <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-plant-green/16 blur-xl" />
        <img
          src={plant.image}
          alt={plant.name}
          className="relative z-10 h-32 w-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <h4 className="truncate text-sm font-semibold text-white">{plant.name}</h4>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-sm font-bold text-plant-green">Rs. {plant.price.toLocaleString('en-IN')}/-</span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-plant-green text-plant-bg transition-transform duration-300 group-hover:scale-110">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  </Link>
);

/* ═══════════════════════════════ MAIN PAGE ═══════════════════════════════ */
const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);
  const product = allPlants.find((p) => p.id === productId);

  const [qty, setQty] = useState(1);
  const [liked, setLiked] = useState(false);

  /* ── 404 ── */
  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pt-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-white">Oops!</h1>
          <p className="mt-4 text-text-secondary">The plant you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-plant-green px-6 py-3 text-sm font-bold text-plant-bg transition-colors hover:bg-plant-green-hover"
          >
            <ChevronLeft className="h-4 w-4" /> Back Home
          </Link>
        </motion.div>
      </div>
    );
  }

  const rating = product.rating;

  const relatedPlants = allPlants.filter((p) => p.id !== product.id).slice(0, 6);

  /* ── care data (static demo) ── */
  const care = [
    { icon: Droplets, label: 'Water', value: 'Weekly' },
    { icon: Sun, label: 'Light', value: 'Indirect' },
    { icon: Wind, label: 'Humidity', value: 'Medium' },
  ];

  return (
    <div className="min-h-screen pt-24 sm:pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ── breadcrumb ── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <button
            onClick={() => {
              void navigate(-1);
            }}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary transition-colors hover:text-plant-green"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        </motion.div>

        {/* ════════════════════ product hero ════════════════════ */}
        <div className="section-shell overflow-hidden bg-[#0c1a10]">
          {/* ambient glow */}
          <div className="pointer-events-none absolute -left-24 -top-16 h-96 w-96 rounded-full bg-plant-green/15 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-32 h-72 w-72 rounded-full bg-plant-green/10 blur-3xl" />

          <div className="relative z-10 grid items-center gap-8 p-5 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
            {/* ── image column ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative flex items-center justify-center"
            >
              <div className="absolute h-64 w-64 rounded-full bg-plant-green/12 blur-3xl sm:h-80 sm:w-80" />
              <img
                src={product.image}
                alt={product.name}
                className="relative z-10 max-h-[26rem] w-full max-w-md animate-float object-contain drop-shadow-2xl"
              />
            </motion.div>

            {/* ── info column ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-6"
            >
              {/* category pill */}
              <span className="inline-block rounded-full border border-plant-green/30 bg-plant-green/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-plant-green">
                {product.category}
              </span>

              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">{product.name}</h1>

              {/* rating */}
              {rating !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-plant-green text-plant-green' : 'text-plant-border'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-text-secondary">{rating.toFixed(1)}</span>
                </div>
              )}

              <p className="max-w-md text-base leading-relaxed text-text-secondary sm:text-lg">{product.description}</p>

              {/* price */}
              <p className="text-3xl font-bold text-plant-green sm:text-4xl">
                Rs. {product.price.toLocaleString('en-IN')}/-
              </p>

              {/* quantity + actions */}
              <div className="flex flex-wrap items-center gap-4">
                {/* qty selector */}
                <div className="inline-flex items-center gap-3 rounded-full border border-plant-border/70 bg-plant-panel/60 px-2 py-1.5">
                  <button
                    onClick={() => { setQty((q) => Math.max(1, q - 1)); }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-plant-green hover:text-plant-bg"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-white">{qty}</span>
                  <button
                    onClick={() => { setQty((q) => q + 1); }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-plant-green hover:text-plant-bg"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* add to cart */}
                <button
                  onClick={() => { alert(`Added ${String(qty)}× ${product.name} to cart!`); }}
                  className="inline-flex items-center gap-2 rounded-full bg-plant-green px-7 py-3 text-sm font-bold text-plant-bg transition-all duration-300 hover:bg-plant-green-hover hover:shadow-lg hover:shadow-plant-green/20"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart
                </button>

                {/* wishlist */}
                <button
                  onClick={() => { setLiked(!liked); }}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 ${
                    liked
                      ? 'border-red-400/50 bg-red-500/15 text-red-400'
                      : 'border-plant-border/70 bg-plant-panel/60 text-text-secondary hover:border-red-400/40 hover:text-red-400'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${liked ? 'fill-red-400' : ''}`} />
                </button>
              </div>

              {/* trust badges */}
              <div className="flex flex-wrap gap-4 pt-2 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-plant-green" /> Free Shipping
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-plant-green" /> 30-Day Guarantee
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ════════════════════ care tips ════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10"
        >
          <h2 className="mb-5 text-center text-xl font-semibold text-white sm:text-2xl">Plant Care</h2>
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            {care.map((c) => (
              <CareTip key={c.label} {...c} />
            ))}
          </div>
        </motion.div>

        {/* ════════════════════ product details ════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-panel section-shell mt-10 p-5 sm:p-8"
        >
          <h2 className="mb-4 text-xl font-semibold text-white sm:text-2xl">Product Details</h2>
          <div className="grid gap-4 text-sm sm:grid-cols-2 sm:gap-6 sm:text-base">
            <div className="space-y-3">
              <div className="flex justify-between border-b border-plant-border/40 pb-2">
                <span className="text-text-secondary">Category</span>
                <span className="font-medium capitalize text-white">{product.category}</span>
              </div>
              <div className="flex justify-between border-b border-plant-border/40 pb-2">
                <span className="text-text-secondary">SKU</span>
                <span className="font-medium text-white">PLT-{String(product.id).padStart(4, '0')}</span>
              </div>
              <div className="flex justify-between border-b border-plant-border/40 pb-2">
                <span className="text-text-secondary">Availability</span>
                <span className="font-medium text-plant-green">In Stock</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-plant-border/40 pb-2">
                <span className="text-text-secondary">Pot Size</span>
                <span className="font-medium text-white">6″ Ceramic</span>
              </div>
              <div className="flex justify-between border-b border-plant-border/40 pb-2">
                <span className="text-text-secondary">Height</span>
                <span className="font-medium text-white">30 – 45 cm</span>
              </div>
              <div className="flex justify-between border-b border-plant-border/40 pb-2">
                <span className="text-text-secondary">Difficulty</span>
                <span className="font-medium text-white">Easy</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ════════════════════ related products ════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-10 pb-10"
        >
          <div className="mb-5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
            <span className="h-px w-8 bg-plant-border/75" />
            You May Also Like
            <span className="h-px w-8 bg-plant-border/75" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {relatedPlants.map((p) => (
              <RelatedCard key={p.id} plant={p} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;