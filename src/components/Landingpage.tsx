import React from 'react';
import Ticker from './Ticker';
import Navbar from './Navbar';
import Hero from './HomePage';
import MarketOverview from './MarketOverview';
import Solutions from './Solutions';
import StatsCTA from './StatsCTA';
import Footer from './Footer';


function LandingPage() {
  return (
    <div className="min-h-screen bg-background-light text-navy font-display antialiased">
      <Ticker />
      <Navbar />
      <main>
        <Hero />
        <MarketOverview  />
        <Solutions />
        <StatsCTA />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;