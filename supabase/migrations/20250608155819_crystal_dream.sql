/*
  # Create route history table for ShaktiPath

  1. New Tables
    - `route_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `source_lat` (numeric) - source latitude
      - `source_lng` (numeric) - source longitude
      - `source_address` (text) - source address
      - `destination_lat` (numeric) - destination latitude
      - `destination_lng` (numeric) - destination longitude
      - `destination_address` (text) - destination address
      - `safety_score` (integer) - overall safety score (0-100)
      - `distance` (text) - route distance
      - `duration` (text) - route duration
      - `route_data` (jsonb) - complete route data including coordinates
      - `created_at` (timestamp) - when route was calculated

  2. Security
    - Enable RLS on `route_history` table
    - Add policy for users to read/insert their own route history
*/

-- Create route_history table
CREATE TABLE IF NOT EXISTS route_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_lat numeric NOT NULL,
  source_lng numeric NOT NULL,
  source_address text NOT NULL,
  destination_lat numeric NOT NULL,
  destination_lng numeric NOT NULL,
  destination_address text NOT NULL,
  safety_score integer NOT NULL CHECK (safety_score >= 0 AND safety_score <= 100),
  distance text NOT NULL,
  duration text NOT NULL,
  route_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE route_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own route history"
  ON route_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own route history"
  ON route_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_route_history_user_id ON route_history(user_id);
CREATE INDEX IF NOT EXISTS idx_route_history_created_at ON route_history(created_at DESC);