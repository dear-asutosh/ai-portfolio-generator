import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="card bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 p-12 md:p-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Ready to stand out?</h2>
        <p className="text-lg text-zinc-400 dark:text-zinc-600 mb-10 max-w-xl mx-auto">
          Join thousands of professionals who have upgraded their online presence with PortfolioAI.
        </p>
        <button className="btn-secondary dark:btn-primary text-lg px-8 py-4">
          Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </section>
  );
}
