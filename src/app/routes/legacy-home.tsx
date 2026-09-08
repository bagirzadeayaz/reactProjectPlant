import BestCollection from '../../components/BestCollection';
import CustomerReview from '../../components/CustomerReview';
import Hero from '../../components/Hero';
import TopSelling from '../../components/TopSelling';

/**
 * The landing page as it stands today, still built from the pre-FSD components.
 *
 * It lives in `app` rather than `pages` on purpose: `app` is the one layer
 * allowed to reach into the legacy tree, so wiring the existing page into the
 * new router costs no boundary exemption. Prompts 8-9 rebuild these sections
 * against the Figma comp as a real `pages/home`, and this file goes away.
 */
export const LegacyHomeRoute = () => (
  <>
    <Hero />
    <TopSelling />
    <CustomerReview />
    <BestCollection />
  </>
);
