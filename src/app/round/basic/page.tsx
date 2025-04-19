'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Replace these with your actual Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface HoleData {
  score: number | null;
  putts: number | null;
  fairwayHit: boolean | null;
  greenInRegulation: boolean | null;
}

interface Course {
  id: number;
  name: string;
  city: string;
  state: string;
  // Add other course fields as needed
}

const BasicRound = () => {
  const router = useRouter();
  const [roundData, setRoundData] = useState({
    date: new Date().toISOString().split('T')[0],
    courseName: '',
    totalScore: '',
    totalPutts: '',
    fairwaysHit: '',
    greensInRegulation: ''
  });
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('id, name, city, state')
          .order('name');
          
        if (error) {
          console.error('Error fetching courses:', error);
          return;
        }
        
        setCourses(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  // Filter courses when user types
  useEffect(() => {
    if (roundData.courseName.trim() === '') {
      setFilteredCourses([]);
      return;
    }
    
    const filtered = courses.filter(course => 
      course.name.toLowerCase().includes(roundData.courseName.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [roundData.courseName, courses]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Check for scorecard data from AI analysis
    const savedData = localStorage.getItem('scorecard_data');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const holes: HoleData[] = parsedData.holes || [];
      
      setRoundData({
        date: parsedData.date || new Date().toISOString().split('T')[0],
        courseName: parsedData.courseName || '',
        totalScore: holes.reduce((sum: number, hole: HoleData) => sum + (hole.score || 0), 0).toString(),
        totalPutts: holes.reduce((sum: number, hole: HoleData) => sum + (hole.putts || 0), 0).toString(),
        fairwaysHit: holes.filter((hole: HoleData) => hole.fairwayHit).length.toString(),
        greensInRegulation: holes.filter((hole: HoleData) => hole.greenInRegulation).length.toString()
      });

      // Clear the stored data
      localStorage.removeItem('scorecard_data');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would submit the data to your backend
    console.log('Submitting round:', roundData);
    router.push('/dashboard');
  };

  const handleCourseNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoundData({ ...roundData, courseName: e.target.value });
    setShowDropdown(true);
  };

  const handleCourseSelect = (course: Course) => {
    setRoundData({ ...roundData, courseName: course.name });
    setShowDropdown(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.push('/round/new')}
            className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <FiArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Basic Round Entry</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Round Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Played
                </label>
                <input
                  type="date"
                  value={roundData.date}
                  onChange={(e) => setRoundData({ ...roundData, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={roundData.courseName}
                  onChange={handleCourseNameChange}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Enter or select course name"
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                
                {/* Course autocomplete dropdown */}
                {showDropdown && (
                  <div 
                    ref={dropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto"
                  >
                    {isLoading ? (
                      <div className="px-4 py-2 text-sm text-gray-500">Loading courses...</div>
                    ) : filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
                        <div
                          key={course.id}
                          onClick={() => handleCourseSelect(course)}
                          className="cursor-pointer px-4 py-2 hover:bg-gray-100 text-gray-900"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{course.name}</span>
                            <span className="text-sm text-gray-400">
                              {course.city}, {course.state}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : roundData.courseName.trim() !== '' ? (
                      <div className="px-4 py-2 text-sm text-gray-500">No courses found</div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Score
                </label>
                <input
                  type="number"
                  min="18"
                  max="200"
                  value={roundData.totalScore}
                  onChange={(e) => setRoundData({ ...roundData, totalScore: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Putts
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={roundData.totalPutts}
                  onChange={(e) => setRoundData({ ...roundData, totalPutts: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fairways Hit
                </label>
                <input
                  type="number"
                  min="0"
                  max="14"
                  value={roundData.fairwaysHit}
                  onChange={(e) => setRoundData({ ...roundData, fairwaysHit: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Greens in Regulation
                </label>
                <input
                  type="number"
                  min="0"
                  max="18"
                  value={roundData.greensInRegulation}
                  onChange={(e) => setRoundData({ ...roundData, greensInRegulation: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-green-700 text-white rounded-full hover:bg-green-800"
            >
              Save Round
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BasicRound;