'use client';

import { useState } from 'react';

export default function TheMirror() {
  const [mood, setMood] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to mirror page with mood
    window.location.href = `/mirror?mood=${encodeURIComponent(mood)}`;
  };

  return (
    <section className="py-32 px-6 bg-black">
      <div className="max-w-2xl mx-auto">
        <div className="border border-zinc-800 p-12 md:p-16">
          {/* Heading */}
          <h2 className="text-xs font-sans uppercase tracking-widest text-gold text-center mb-6">
            The Mirror
          </h2>
          
          {/* Subtext */}
          <p className="text-sm text-zinc-400 text-center mb-12">
            A quiet reading: one validation, one prescription.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Describe your mood in a few words..."
              className="w-full px-6 py-4 bg-transparent border border-zinc-800 text-white placeholder:text-zinc-600 text-sm focus:outline-none focus:border-gold transition-colors duration-160 rounded-none"
            />
            
            <div className="flex justify-center">
              <button
                type="submit"
                className="px-10 py-4 text-xs font-sans uppercase tracking-widest text-black bg-gold hover:bg-gold/90 transition-colors duration-160 rounded-none"
              >
                Receive Reading
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
