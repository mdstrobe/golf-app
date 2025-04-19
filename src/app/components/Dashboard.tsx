'use client';

import React, { useEffect, useState } from 'react';
import { FiBell, FiCamera, FiBarChart2, FiTarget, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { GiTrophyCup } from 'react-icons/gi';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UserData {
  username: string;
  email: string;
  handicap: number;
  roundsPlayed: number;
  avgScore: number;
}

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        const email = localStorage.getItem('userEmail');
        if (!email) {
          router.push('/login');
          return;
        }

        // In a real app, you would fetch this data from your database
        // For now, we'll use the email and some placeholder data
        const response: UserData = {
          username: email.split('@')[0], // Use the part before @ as username
          email: email,
          handicap: 14.2,
          roundsPlayed: 24,
          avgScore: 82
        };

        setUserData(response);
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  if (loading || !userData) {
    return <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
      <div className="text-green-700">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Top Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10">
              <svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <h1 className="text-xl font-bold text-gray-800">Golf Performance App</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiBell className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={handleSignOut}
              className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center hover:bg-green-800 transition-colors"
            >
              <span className="text-white text-sm font-medium">{userData.username[0].toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Welcome back, {userData.username}</h2>
          <p className="text-gray-600">Current Handicap: {userData.handicap}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => router.push('/round/new')}
            className="bg-green-700 text-white p-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-800 transition-colors"
          >
            <FiCalendar className="w-5 h-5" />
            <span>New Round</span>
          </button>
          <button 
            onClick={() => router.push('/scan-card')}
            className="bg-white border-2 border-green-700 text-green-700 p-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-50 transition-colors"
          >
            <FiCamera className="w-5 h-5" />
            <span>Scan Card</span>
          </button>
          <button className="bg-white border-2 border-green-700 text-green-700 p-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-50 transition-colors md:col-span-2">
            <FiTarget className="w-5 h-5" />
            <span>Practice Session</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Performance Overview</h3>
            <button className="text-green-700 hover:text-green-800 font-medium">
              View Details
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-600 mb-1">Rounds Played</p>
              <p className="text-3xl font-bold text-gray-800">{userData.roundsPlayed}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-1">Average Score</p>
              <p className="text-3xl font-bold text-gray-800">{userData.avgScore}</p>
            </div>
            <div className="text-center col-span-2 md:col-span-1">
              <p className="text-gray-600 mb-1">Handicap Trend</p>
              <div className="flex items-center justify-center gap-2 text-green-600">
                <FiTrendingUp className="w-5 h-5" />
                <p className="text-xl font-bold">Improving</p>
              </div>
            </div>
          </div>
        </div>

        {/* Training Modules */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Training & Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <FiBarChart2 className="w-8 h-8 text-blue-600 mb-3" />
                <h4 className="font-semibold text-gray-800 mb-2">Game Analysis</h4>
                <p className="text-gray-600 text-sm">Deep dive into your statistics and identify areas for improvement</p>
              </div>
              <span className="text-blue-600">→</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
              <div>
                <GiTrophyCup className="w-8 h-8 text-purple-600 mb-3" />
                <h4 className="font-semibold text-gray-800 mb-2">Skills Challenge</h4>
                <p className="text-gray-600 text-sm">Complete challenges to improve specific aspects of your game</p>
              </div>
              <span className="text-purple-600">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 