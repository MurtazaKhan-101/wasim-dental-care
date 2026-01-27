-- Add gender column
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('Male', 'Female', 'Other'));

-- Add diagnosis column with character limit (e.g., 2000 characters)
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS diagnosis TEXT;

ALTER TABLE patients 
DROP CONSTRAINT IF EXISTS diagnosis_length_check;

ALTER TABLE patients 
ADD CONSTRAINT diagnosis_length_check CHECK (char_length(diagnosis) <= 2000);
-- Add RLS policies for update and delete
DROP POLICY IF EXISTS "Doctors can update their own patients, Admins see all" ON patients;
CREATE POLICY "Doctors can update their own patients, Admins see all" ON patients
  FOR UPDATE USING (
    auth.uid() = doctor_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "Doctors can delete their own patients, Admins see all" ON patients;
CREATE POLICY "Doctors can delete their own patients, Admins see all" ON patients
  FOR DELETE USING (
    auth.uid() = doctor_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Update Insert policy to allow super_admin
DROP POLICY IF EXISTS "Doctors can create patients" ON patients;
CREATE POLICY "Doctors can create patients" ON patients
  FOR INSERT WITH CHECK (
    auth.uid() = doctor_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Create doctors table (separate from Auth profiles)
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialization TEXT,
  qualification TEXT,
  contact_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone (Authenticated) can view doctors (needed for print page)
CREATE POLICY "Doctors are viewable by everyone" ON doctors
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only super_admin can insert, update, delete
CREATE POLICY "Super admins can insert doctors" ON doctors
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admins can update doctors" ON doctors
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admins can delete doctors" ON doctors
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );
