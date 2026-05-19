import React from 'react';
import Hero from '../components/landing/Hero';
import SocialProof from '../components/landing/SocialProof';
import HowItWorks from '../components/landing/HowItWorks';
import InputMethods from '../components/landing/InputMethods';
import TemplateShowcase from '../components/landing/TemplateShowcase';
import AIChatModifier from '../components/landing/AIChatModifier';
import LiveDeploy from '../components/landing/LiveDeploy';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import FinalCTA from '../components/landing/FinalCTA';
import FeaturesBento from '../components/landing/FeaturesBento';


const LandingPage = () => {
  return (
    <main className="flex flex-col">
      <Hero />
      <SocialProof />
      <FeaturesBento />
      <HowItWorks />
      <InputMethods />
      <TemplateShowcase />
      <AIChatModifier />
      <LiveDeploy />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </main>
  );
};

export default LandingPage;
