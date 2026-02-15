"use client";

import { useState } from "react";

/**
 * Memphis Page Template
 *
 * This template follows Memphis design principles:
 * - Flat design (no shadows, gradients)
 * - Sharp corners (border-radius: 0)
 * - Thick borders (4px)
 * - Memphis colors only (coral, teal, yellow, purple, dark, cream)
 * - Geometric decorations
 */

export default function PageNamePage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-cream p-8 relative">
      {/* Geometric Decorations */}
      <div className="absolute top-8 right-8 w-16 h-16 bg-coral rotate-45 opacity-20" />
      <div className="absolute bottom-8 left-8 w-12 h-12 rounded-full bg-teal opacity-20" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-coral" />
          <h1 className="text-5xl font-bold uppercase text-dark mt-6 mb-4">
            Page Title
          </h1>
          <p className="text-xl text-dark opacity-70">
            Page description goes here
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Primary Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Card Example */}
            <div className="card border-4 border-dark bg-cream p-8 relative">
              <div className="absolute top-4 right-4 w-8 h-8 bg-yellow rotate-45" />
              <h2 className="text-2xl font-bold uppercase text-dark mb-4">
                Section Title
              </h2>
              <p className="text-dark opacity-70 mb-6">
                Content goes here. Memphis design emphasizes bold colors,
                geometric shapes, and flat design.
              </p>

              {/* Button Group */}
              <div className="flex gap-4">
                <button className="btn bg-coral text-dark border-4 border-dark font-bold uppercase hover:bg-teal transition-colors">
                  Primary Action
                </button>
                <button className="btn bg-transparent text-dark border-4 border-dark font-bold uppercase hover:bg-cream transition-colors">
                  Secondary
                </button>
              </div>
            </div>

            {/* List Example */}
            <div className="card border-4 border-dark bg-cream p-8">
              <h3 className="text-xl font-bold uppercase text-dark mb-6">
                List Items
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((item, index) => {
                  const colors = ['coral', 'teal', 'yellow'];
                  return (
                    <div
                      key={item}
                      className={`border-l-4 border-${colors[index]} bg-cream p-4 flex items-center justify-between`}
                    >
                      <div>
                        <h4 className="font-bold text-dark">Item {item}</h4>
                        <p className="text-dark opacity-70 text-sm">
                          Description for item {item}
                        </p>
                      </div>
                      <button className="btn btn-sm bg-transparent border-2 border-dark hover:bg-dark hover:text-cream transition-colors">
                        <i className="fa-regular fa-chevron-right"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats Card */}
            <div className="card border-4 border-dark bg-purple p-6 relative">
              <div className="absolute top-0 right-0 w-16 h-2 bg-dark" />
              <h3 className="text-lg font-bold uppercase text-dark mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-black text-dark">1,234</div>
                  <div className="text-sm text-dark opacity-70">Total Items</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-dark">56</div>
                  <div className="text-sm text-dark opacity-70">Active</div>
                </div>
              </div>
            </div>

            {/* Action Card */}
            <div className="card border-4 border-dark bg-teal p-6">
              <h3 className="text-lg font-bold uppercase text-dark mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="btn btn-block bg-dark text-cream border-0 font-bold uppercase hover:bg-cream hover:text-dark hover:border-4 hover:border-dark transition-all">
                  <i className="fa-regular fa-plus mr-2"></i>
                  Create New
                </button>
                <button className="btn btn-block bg-transparent text-dark border-4 border-dark font-bold uppercase hover:bg-dark hover:text-cream transition-colors">
                  <i className="fa-regular fa-upload mr-2"></i>
                  Import
                </button>
              </div>
            </div>

            {/* Info Panel */}
            <div className="card border-4 border-dark bg-cream p-6 relative">
              <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-yellow" />
              <h3 className="text-lg font-bold uppercase text-dark mb-3">
                <i className="fa-regular fa-lightbulb mr-2"></i>
                Pro Tip
              </h3>
              <p className="text-dark opacity-70 text-sm">
                This is a helpful tip or piece of information for the user.
                Memphis design uses bold, flat colors and geometric shapes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="mt-16 pt-8 border-t-4 border-dark">
          <div className="flex justify-between items-center">
            <p className="text-dark opacity-70 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <div className="flex gap-2">
              <div className="w-4 h-4 bg-coral" />
              <div className="w-4 h-4 bg-teal" />
              <div className="w-4 h-4 bg-yellow" />
              <div className="w-4 h-4 bg-purple" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
