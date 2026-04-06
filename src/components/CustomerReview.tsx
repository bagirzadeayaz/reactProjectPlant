import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { reviews } from '../data/reviews';

const CustomerReview = () => {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  return (
    <section id="customer-review" className="pt-10 sm:pt-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 flex items-center justify-center gap-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary"
        >
          <span className="h-px w-8 bg-plant-border/75" />
          Customer Review
          <span className="h-px w-8 bg-plant-border/75" />
        </motion.div>

        <div className="glass-panel section-shell p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 sm:gap-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="section-card bg-plant-card/80 p-4 sm:p-5"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-plant-border/70 bg-plant-panel text-sm font-semibold text-plant-green">
                  {getInitials(review.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{review.name}</p>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-plant-green text-plant-green" />
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-text-secondary">{review.text}</p>
            </motion.div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReview;
