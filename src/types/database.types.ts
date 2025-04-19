export interface Round {
  id: string;
  user_id: string;
  course_name: string;
  date_played: string;
  total_score: number;
  total_putts: number | null;
  total_fir: number | null;
  total_gir: number | null;
  created_at: string;
  updated_at: string;
}

export interface HoleDetail {
  id: string;
  round_id: string;
  hole_number: number;
  score: number;
  putts: number | null;
  fairway_hit: boolean | null;
  green_in_regulation: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ScannedRoundData {
  course_name: string;
  date_played: string;
  holes: {
    score: number;
    putts?: number;
    fairway_hit?: boolean;
    green_in_regulation?: boolean;
  }[];
}

export type Database = {
  public: {
    Tables: {
      rounds: {
        Row: Round;
        Insert: Omit<Round, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Round, 'id' | 'created_at' | 'updated_at'>>;
      };
      hole_details: {
        Row: HoleDetail;
        Insert: Omit<HoleDetail, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<HoleDetail, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}; 