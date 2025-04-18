'use client';

import React from 'react';

const LoginPage: React.FC = () => {
  const images = [
    "https://images.unsplash.com/photo-1538648759472-7251f7cb2c2f?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1500932334442-8761ee4810a7?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1592937238247-cd0090e02f65?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1605144884374-ecbb643615f6?q=80&w=1592&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1606443192517-919653213206?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1605147861225-7bcd55f8e513?q=80&w=1608&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8">
      {/* Golf Course Images */}
      <div className="image-container w-full max-w-md overflow-hidden">
        <div className="grid grid-cols-2 gap-2 animate-scroll" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {/* First set of images */}
          {images.map((url, idx) => (
            <img
              key={`first-${idx}`}
              src={url}
              alt={`Golf Course ${idx + 1}`}
              className="w-full h-32 object-cover rounded-lg shadow-sm"
            />
          ))}
          {/* Duplicate set of images for seamless scrolling */}
          {images.map((url, idx) => (
            <img
              key={`second-${idx}`}
              src={url}
              alt={`Golf Course ${idx + 1}`}
              className="w-full h-32 object-cover rounded-lg shadow-sm"
            />
          ))}
        </div>
      </div>

      {/* Circular Golf Logo */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 relative z-10">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="90" fill="#15803D"/>
          <circle cx="100" cy="85" r="35" fill="white"/>
          <circle cx="100" cy="85" r="35" fill="url(#golfBallPattern)"/>
          <defs>
            <pattern id="golfBallPattern" patternUnits="userSpaceOnUse" width="10" height="10">
              <circle cx="5" cy="5" r="1" fill="#E5E7EB" opacity="0.3"/>
              <line x1="0" y1="5" x2="10" y2="5" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.2"/>
              <line x1="5" y1="0" x2="5" y2="10" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.2"/>
            </pattern>
          </defs>
          <path d="M100 120 L100 150" stroke="#A37B43" strokeWidth="10" strokeLinecap="round"/>
        </svg>
      </div>

      {/* App Name and Tagline */}
      <h1 className="text-3xl font-bold text-gray-900 relative z-10">Golf Performance App</h1>
      <p className="mt-2 text-gray-600 text-base relative z-10">Master Your Game with Data</p>

      {/* CTA Buttons */}
      <div className="mt-8 w-full max-w-md space-y-4 relative z-10">
        <a
          href="/signup"
          className="block w-full bg-green-700 text-white text-center py-3 rounded-full font-medium hover:bg-green-500 transition"
        >
          Sign Up
        </a>
        <a
          href="/login"
          className="block w-full bg-white text-gray-800 text-center py-3 rounded-full font-medium border border-gray-300 hover:bg-gray-50 transition"
        >
          Log In
        </a>
      </div>
    </div>
  );
};

export default LoginPage;