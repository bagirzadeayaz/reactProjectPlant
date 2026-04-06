import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TopSelling from './components/TopSelling';
import CustomerReview from './components/CustomerReview';
import BestCollection from './components/BestCollection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-plant-bg text-plant-ink">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-45 h-115 w-115 rounded-full bg-plant-green/14 blur-3xl" />
        <div className="absolute -right-30 top-95 h-130 w-130 rounded-full bg-plant-green/10 blur-3xl" />
      </div>
      <Navbar />
      <main className="relative z-10 pb-6 sm:pb-10">
        <Hero />
        <TopSelling />
        <CustomerReview />
        <BestCollection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
