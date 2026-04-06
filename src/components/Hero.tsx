import { motion } from 'framer-motion';
import { ChevronRight, Play, ShoppingBag, Star } from 'lucide-react';
import { trendyPlants } from '../data/plants';

const Hero = () => {
  const rightCardPlant = trendyPlants[2] ?? trendyPlants[0];
  const firstPlant = trendyPlants[0];
  const secondPlant = trendyPlants[1] ?? trendyPlants[0];
  const heroMainPlant = trendyPlants[1] ?? trendyPlants[0];

  return (
    <section id="home" className="relative pt-24 sm:pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="section-shell relative min-h-245 overflow-hidden bg-[#09150d]">
          <div className="absolute inset-0 bg-[radial-gradient(85%_65%_at_45%_45%,rgba(116,173,91,0.26),transparent_68%),linear-gradient(180deg,rgba(6,13,8,0.68)_0%,rgba(8,20,11,0.78)_38%,rgba(8,15,10,0.88)_100%)]" />
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/12" />
          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-plant-green/15 blur-3xl" />
          <div className="absolute right-0 top-56 h-80 w-80 rounded-full bg-plant-green/10 blur-3xl" />

          <motion.img
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 0.38, scale: 1.08, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1 }}
            src={heroMainPlant.image}
            alt=""
            className="pointer-events-none absolute left-1/2 top-28 z-10 w-136 -translate-x-1/2 blur-xl"
          />
          <motion.img
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            src={heroMainPlant.image}
            alt={heroMainPlant.name}
            className="pointer-events-none absolute left-1/2 top-30 z-20 w-132 -translate-x-1/2 animate-float"
          />

          <div className="relative z-30 px-5 pb-8 pt-16 sm:px-10 sm:pt-20 lg:px-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl"
            >
              <h1 className="font-sans text-5xl font-bold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
                Breath Natureal
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/72 sm:text-base">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <a
                  href="#my-plants"
                  className="inline-flex h-11 items-center rounded-xl border border-white/60 px-8 text-base font-medium text-white transition-colors hover:bg-white/10"
                >
                  Explore
                </a>
                <button className="inline-flex items-center gap-2 text-sm text-white/90 transition-colors hover:text-white">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/10">
                    <Play className="h-3.5 w-3.5 fill-white text-white" />
                  </span>
                  Live Demo...
                </button>
              </div>
            </motion.div>

            <motion.article
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.3 }}
              className="section-card absolute right-4 top-20 z-40 w-56 bg-black/35 px-5 pb-7 pt-6 backdrop-blur-xl sm:right-10 sm:top-20 sm:w-72"
            >
              <img
                src={rightCardPlant.image}
                alt={rightCardPlant.name}
                className="mx-auto -mt-14 h-44 w-44 object-contain"
              />
              <p className="text-xs text-white/65">Trendy House Plant</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <h3 className="text-2xl font-medium text-white">Calathea plant</h3>
                <ChevronRight className="h-4 w-4 text-white/80" />
              </div>
              <button className="mt-3 inline-flex h-10 items-center rounded-lg border border-white/55 px-5 text-base text-white transition hover:bg-white/10">
                Buy Now
              </button>
              <div className="mt-3 text-xl leading-none tracking-[0.35em] text-white/70">...</div>
            </motion.article>

            <motion.article
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.35 }}
              className="section-card absolute left-4 top-98 z-40 w-64 bg-black/30 p-4 backdrop-blur-xl sm:left-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/80 text-sm font-semibold text-white">
                  AP
                </div>
                <div>
                  <p className="text-sm font-medium text-white">alena Patel</p>
                  <div className="mt-0.5 inline-flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-3 w-3 fill-[#d7e96d] text-[#d7e96d]" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/62">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor
                incididunt...
              </p>
            </motion.article>

            <div id="my-plants" className="pt-108 sm:pt-112">
              <p className="text-center text-4xl font-semibold leading-none text-white/95 sm:text-[2.6rem]">
                <span className="rounded-full border border-white/20 bg-black/25 px-6 py-2 text-3xl sm:text-[2.45rem]">
                  Our Trendy plants
                </span>
              </p>

              <div className="mt-5 space-y-4">
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55 }}
                  className="section-card grid items-center gap-3 bg-black/28 p-4 backdrop-blur-xl sm:grid-cols-[13rem_1fr] sm:gap-6 sm:p-6"
                >
                  <img src={firstPlant.image} alt={firstPlant.name} className="mx-auto h-40 w-40 object-contain sm:h-48 sm:w-48" />
                  <div>
                    <h3 className="text-3xl font-medium text-white">For Small Decs Ai Plat</h3>
                    <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/70 sm:text-sm">
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <p className="mt-3 text-4xl font-semibold text-white">Rs. 599/-</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button className="inline-flex h-9 items-center rounded-lg border border-white/55 px-5 text-sm text-white transition hover:bg-white/10">
                        Explore
                      </button>
                      <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/40 text-white/85 transition hover:bg-white/10">
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.article>

                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                  className="section-card grid items-center gap-3 bg-black/28 p-4 backdrop-blur-xl sm:grid-cols-[1fr_12rem] sm:gap-6 sm:p-6"
                >
                  <div>
                    <h3 className="text-3xl font-medium text-white">For Fresh Decs Ai Plat</h3>
                    <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/70 sm:text-sm">
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <p className="mt-3 text-4xl font-semibold text-white">Rs. 579/-</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button className="inline-flex h-9 items-center rounded-lg border border-white/55 px-5 text-sm text-white transition hover:bg-white/10">
                        Explore
                      </button>
                      <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/40 text-white/85 transition hover:bg-white/10">
                        <ShoppingBag className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <img src={secondPlant.image} alt={secondPlant.name} className="mx-auto h-36 w-36 object-contain sm:h-44 sm:w-44" />
                </motion.article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
