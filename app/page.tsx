import { Suspense } from 'react';
import Hero from '../components/ui/Hero';
import About from '../components/ui/About';
import Products from '../components/ui/Products';
import Cases from '../components/ui/Cases';
import Contact from '../components/ui/Contact';

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Hero />
      <About />
      <Products />
      <Cases />
      <Contact />
    </Suspense>
  );
}