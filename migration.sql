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
