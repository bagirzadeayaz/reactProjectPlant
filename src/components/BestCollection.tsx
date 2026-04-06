import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { topSellingPlants } from '../data/plants';

const BestCollection = () => {
  const bestPlant = topSellingPlants[0];

  return (
    <section id="our-best" className="pt-10 sm:pt-14">
      <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 sm:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 flex items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary"
        >
          <span className="h-px w-8 bg-plant-border/75" />
          Our Best 02
          <span className="h-px w-8 bg-plant-border/75" />
        </motion.div>

        <div className="glass-panel section-shell overflow-hidden p-5 sm:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
              className="relative"
          >
              <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-plant-green/15 blur-3xl" />
            <img
              src={bestPlant.image}
              alt={bestPlant.name}
              className="relative z-10 mx-auto w-full max-w-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-semibold leading-[1.05] text-white sm:text-4xl lg:text-5xl">
              We Have Small And Best O2 Plants Collection's
            </h2>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary sm:text-lg">
              Discover our carefully selected premium green collection. Every plant is handpicked,
              protected in transit, and delivered in healthy condition for your home.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-plant-green px-6 py-3 text-sm font-bold text-plant-bg transition-colors hover:bg-plant-green-hover">
                Explore
                <ArrowUpRight className="h-4 w-4" />
              </button>

              <button className="rounded-full border border-plant-border/80 bg-plant-card/70 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-plant-green/70 hover:text-plant-green">
                Buy Now
              </button>
            </div>

            <div className="mt-8 flex items-center gap-2">
              {[1, 2, 3].map((dot) => (
                <button
                  key={dot}
                  aria-label={`Slide ${dot}`}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    dot === 1 ? 'bg-plant-green' : 'bg-plant-border/80'
                  }`}
                />
              ))}
            </div>
          </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestCollection;
