'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Ensure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local or Vercel.');
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Store user data
      localStorage.setItem('userEmail', email);
      if (data.user) {
        localStorage.setItem('userId', data.user.id);
      }
      router.push('/dashboard'); // Redirect to dashboard on success
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-4 overflow-hidden relative" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 text-gray-600 hover:text-gray-800 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Circular Golf Logo */}
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 relative z-10">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="90" fill="#15803D" />
          <circle cx="100" cy="85" r="35" fill="white" />
          <circle cx="100" cy="85" r="35" fill="url(#golfBallPattern)" />
          <defs>
            <pattern id="golfBallPattern" patternUnits="userSpaceOnUse" width="10" height="10">
              <circle cx="5" cy="5" r="1" fill="#E5E7EB" opacity="0.3" />
              <line x1="0" y1="5" x2="10" y2="5" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.2" />
              <line x1="5" y1="0" x2="5" y2="10" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.2" />
            </pattern>
          </defs>
          <path d="M100 120 L100 150" stroke="#A37B43" strokeWidth="10" strokeLinecap="round" />
        </svg>
      </div>

      {/* App Name */}
      <h1 className="text-2xl font-bold text-gray-900 relative z-10 mb-6">Golf Performance App</h1>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {/* Input Fields */}
      <div className="w-full max-w-md space-y-4">
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-700"
        />
      </div>

      {/* Log In Button */}
      <div className="mt-6 w-full max-w-md">
        <button
          onClick={handleLogin}
          className="w-full bg-black text-white text-center py-3 rounded-full font-medium hover:bg-gray-800 transition"
        >
          Log In
        </button>
      </div>

      {/* Sign Up Link */}
      <p className="mt-4 text-gray-600 text-sm text-center">
        Need an account?{' '}
        <a href="/signup" className="underline hover:text-gray-800">Sign Up</a>
      </p>
    </div>
  );
};

export default LoginPage;