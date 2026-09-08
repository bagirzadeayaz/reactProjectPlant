import { motion } from 'framer-motion';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trendyPlants } from '../data/plants';

const PlantCard = ({ plant, index }: { plant: typeof trendyPlants[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-plant-card border border-plant-border rounded-2xl p-4 min-w-[280px] sm:min-w-[300px] group hover:border-plant-green/50 transition-colors"
  >
    <div className="relative overflow-hidden rounded-xl mb-4">
      <img
        src={plant.image}
        alt={plant.name}
        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
    <h3 className="text-lg font-semibold">{plant.name}</h3>
    <p className="text-text-secondary text-sm mt-1">{plant.description}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="text-plant-green font-bold text-lg">Rs. {plant.price}/-</span>
        <div className="flex gap-2">
          <Link to={`/product/${String(plant.id)}`} className="bg-plant-green hover:bg-plant-green-hover text-plant-bg px-4 py-2 rounded-full text-sm font-semibold transition-colors inline-flex items-center gap-1">
            Explore
            <ChevronRight className="w-3 h-3" />
          </Link>
          <button className="border border-plant-border hover:border-plant-green text-text-secondary hover:text-plant-green p-2 rounded-full transition-colors">
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
  </motion.div>
);

const TrendyPlants = () => {
  return (
    <section id="our-trendy-plants" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block bg-plant-card border border-plant-border rounded-full px-4 py-2 text-sm text-plant-green mb-8"
        >
          Our Trendy plants
        </motion.div>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {trendyPlants.map((plant, index) => (
            <PlantCard key={plant.id} plant={plant} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendyPlants;
