import { motion } from 'framer-motion';
import { ArrowUpRight, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { topSellingPlants } from '../data/plants';

const SmallPlantCard = ({ plant, index }: { plant: typeof topSellingPlants[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.25 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="group rounded-3xl border border-plant-border/70 bg-plant-card/78 p-3 transition-colors hover:border-plant-green/60"
  >
    <div className="relative mb-3 overflow-hidden rounded-2xl bg-plant-panel/70">
      <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-plant-green/16 blur-xl" />
      <img
        src={plant.image}
        alt={plant.name}
        className="relative z-10 h-28 w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105 sm:h-32"
      />
    </div>
    <h3 className="text-sm font-semibold text-white sm:text-base">{plant.name}</h3>
    <p className="mt-1 line-clamp-1 text-xs text-text-secondary">{plant.description}</p>

    <div className="mt-3 flex items-center justify-between">
      <div>
        <span className="text-sm font-bold text-plant-green">Rs. {plant.price.toLocaleString('en-IN')}/-</span>
        <p className="mt-1 inline-flex items-center gap-1 text-xs text-text-secondary">
          <Star className="h-3.5 w-3.5 fill-plant-green text-plant-green" />
          {plant.rating?.toFixed(1)}
        </p>
      </div>
      <div className="flex gap-1.5">
        <button className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-plant-border/75 bg-plant-panel/70 text-text-secondary transition hover:border-plant-green hover:text-plant-green">
          <ShoppingBag className="h-3.5 w-3.5" />
        </button>
        <Link to={`/product/${String(plant.id)}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-plant-green text-plant-bg transition-colors hover:bg-plant-green-hover">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  </motion.div>
);

const TopSelling = () => {
  return (
    <section id="our-sell" className="pt-10 sm:pt-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 flex items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary"
        >
          <span className="h-px w-8 bg-plant-border/75" />
          Our Top Selling
          <span className="h-px w-8 bg-plant-border/75" />
        </motion.div>

        <div className="glass-panel section-shell p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {topSellingPlants.slice(0, 6).map((plant, index) => (
            <SmallPlantCard key={plant.id} plant={plant} index={index} />
          ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopSelling;
