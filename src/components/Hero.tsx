import React from 'react';

export default function Hero() {
  return (
    <div className="relative">
      <div className="absolute inset-0">
        <img
          className="w-full h-[600px] object-cover"
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Shopping"
        />
        <div className="absolute inset-0 bg-gray-900/40 mix-blend-multiply" />
      </div>
      
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Spring Collection 2024
        </h1>
        <p className="mt-6 max-w-3xl text-xl text-gray-100">
          Discover our latest arrivals featuring fresh styles and seasonal must-haves.
          Shop the collection that brings together comfort and elegance.
        </p>
        <div className="mt-10">
          <button className="inline-block bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
}