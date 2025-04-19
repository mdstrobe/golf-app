'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Round {
  id: string;
  course_name: string;
  date_played: string;
  total_score: number;
  total_putts: number | null;
  total_fir: number | null;
  total_gir: number | null;
  created_at: string;
}

const RoundsPage = () => {
  const router = useRouter();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterYear, setFilterYear] = useState<string>('all');

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('rounds')
          .select('*')
          .eq('user_id', session.user.id)
          .order('date_played', { ascending: false });

        if (error) throw error;
        setRounds(data || []);
      } catch (error) {
        console.error('Error fetching rounds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRounds();
  }, [router]);

  const getAvailableYears = () => {
    const years = new Set(rounds.map(round => new Date(round.date_played).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  };

  const filteredRounds = rounds.filter(round => {
    if (filterYear === 'all') return true;
    return new Date(round.date_played).getFullYear().toString() === filterYear;
  });

  const sortedRounds = [...filteredRounds].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'asc' 
        ? new Date(a.date_played).getTime() - new Date(b.date_played).getTime()
        : new Date(b.date_played).getTime() - new Date(a.date_played).getTime();
    } else {
      return sortOrder === 'asc' 
        ? a.total_score - b.total_score
        : b.total_score - a.total_score;
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center">Loading rounds...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.push('/dashboard')}
            className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
          </button>
          <h1 className="text-xl font-bold text-gray-800">My Rounds</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Years</option>
              {getAvailableYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Rounds List */}
        <div className="space-y-4">
          {sortedRounds.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No rounds found for the selected filters
            </div>
          ) : (
            sortedRounds.map(round => (
              <div
                key={round.id}
                className="bg-gray-50 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/rounds/${round.id}`)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{round.course_name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span>{formatDate(round.date_played)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{round.total_score}</div>
                    <div className="text-sm text-gray-500">Total Score</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="text-gray-500">Putts</div>
                    <div className="font-medium">{round.total_putts || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Fairways</div>
                    <div className="font-medium">{round.total_fir || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">GIR</div>
                    <div className="font-medium">{round.total_gir || '-'}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RoundsPage; 