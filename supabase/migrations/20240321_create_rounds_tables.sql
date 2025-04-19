-- Drop existing tables if they exist
DROP TABLE IF EXISTS hole_details;
DROP TABLE IF EXISTS rounds;

-- Create rounds table
CREATE TABLE rounds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    course_name TEXT NOT NULL,
    date_played DATE NOT NULL,
    total_score INTEGER NOT NULL,
    total_putts INTEGER,
    total_fir INTEGER,
    total_gir INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create hole_details table
CREATE TABLE hole_details (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
    hole_number INTEGER NOT NULL CHECK (hole_number BETWEEN 1 AND 18),
    score INTEGER NOT NULL,
    putts INTEGER,
    fairway_hit BOOLEAN,
    green_in_regulation BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(round_id, hole_number)
);

-- Create indexes for better query performance
CREATE INDEX idx_rounds_user_id ON rounds(user_id);
CREATE INDEX idx_hole_details_round_id ON hole_details(round_id);
CREATE INDEX idx_rounds_date_played ON rounds(date_played DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE hole_details ENABLE ROW LEVEL SECURITY;

-- Create policies for rounds table
CREATE POLICY "Users can view their own rounds"
    ON rounds FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rounds"
    ON rounds FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rounds"
    ON rounds FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rounds"
    ON rounds FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for hole_details table
CREATE POLICY "Users can view hole details of their rounds"
    ON hole_details FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM rounds
        WHERE rounds.id = hole_details.round_id
        AND rounds.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert hole details for their rounds"
    ON hole_details FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM rounds
        WHERE rounds.id = hole_details.round_id
        AND rounds.user_id = auth.uid()
    ));

CREATE POLICY "Users can update hole details of their rounds"
    ON hole_details FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM rounds
        WHERE rounds.id = hole_details.round_id
        AND rounds.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM rounds
        WHERE rounds.id = hole_details.round_id
        AND rounds.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete hole details of their rounds"
    ON hole_details FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM rounds
        WHERE rounds.id = hole_details.round_id
        AND rounds.user_id = auth.uid()
    )); 