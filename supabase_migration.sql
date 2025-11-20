-- Create user_cards table to store user's saved cards
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS user_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    character TEXT NOT NULL,
    pinyin TEXT NOT NULL,
    definition TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, character)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS user_cards_user_id_idx ON user_cards(user_id);

-- Enable Row Level Security
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own cards
CREATE POLICY "Users can read their own cards"
    ON user_cards
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own cards
CREATE POLICY "Users can insert their own cards"
    ON user_cards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own cards
CREATE POLICY "Users can delete their own cards"
    ON user_cards
    FOR DELETE
    USING (auth.uid() = user_id);

