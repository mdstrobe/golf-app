import { createClient } from '@supabase/supabase-js';
import { Database, Round, HoleDetail, ScannedRoundData } from '../types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function saveRoundData(data: ScannedRoundData): Promise<{ success: boolean; error?: string }> {
  try {
    // Calculate totals
    const total_score = data.holes.reduce((sum, hole) => sum + hole.score, 0);
    const total_putts = data.holes.reduce((sum, hole) => sum + (hole.putts || 0), 0);
    const total_fir = data.holes.reduce((sum, hole) => sum + (hole.fairway_hit ? 1 : 0), 0);
    const total_gir = data.holes.reduce((sum, hole) => sum + (hole.green_in_regulation ? 1 : 0), 0);

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    // Insert round
    const { data: roundData, error: roundError } = await supabase
      .from('rounds')
      .insert({
        user_id: user.data.user.id,
        course_name: data.course_name,
        date_played: data.date_played,
        total_score,
        total_putts,
        total_fir,
        total_gir
      })
      .select()
      .single();

    if (roundError || !roundData) {
      throw new Error(roundError?.message || 'Failed to insert round');
    }

    // Insert hole details
    const holeDetails = data.holes.map((hole, index) => ({
      round_id: roundData.id,
      hole_number: index + 1,
      score: hole.score,
      putts: hole.putts || null,
      fairway_hit: hole.fairway_hit || null,
      green_in_regulation: hole.green_in_regulation || null
    }));

    const { error: holesError } = await supabase
      .from('hole_details')
      .insert(holeDetails);

    if (holesError) {
      // If hole details insertion fails, delete the round
      await supabase.from('rounds').delete().eq('id', roundData.id);
      throw new Error(holesError.message);
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving round data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
} 