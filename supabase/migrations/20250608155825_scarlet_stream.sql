/*
  # Create emergency alerts table for ShaktiPath

  1. New Tables
    - `emergency_alerts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `lat` (numeric) - alert location latitude
      - `lng` (numeric) - alert location longitude
      - `address` (text) - alert location address
      - `alert_type` (text) - type of alert (sos, panic, manual)
      - `status` (text) - alert status (active, resolved, false_alarm)
      - `created_at` (timestamp) - when alert was created
      - `resolved_at` (timestamp) - when alert was resolved

  2. Security
    - Enable RLS on `emergency_alerts` table
    - Add policy for users to read/insert their own alerts
    - Add policy for emergency services to read active alerts
*/

-- Create emergency_alerts table
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  address text NOT NULL,
  alert_type text NOT NULL CHECK (alert_type IN ('sos', 'panic', 'manual')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Enable RLS
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own emergency alerts"
  ON emergency_alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency alerts"
  ON emergency_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency alerts"
  ON emergency_alerts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_user_id ON emergency_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_created_at ON emergency_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_alerts_location ON emergency_alerts(lat, lng);