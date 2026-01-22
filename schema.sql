CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'doctor', 'sub_doctor')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Only super_admin can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Shifts table (Definitions of shifts, e.g., 'Morning')
CREATE TABLE shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- e.g. 'Morning', 'Evening'
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shifts Policies
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shifts are viewable by everyone" ON shifts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only super_admin can manage shifts" ON shifts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Shift Assignments (Who is working when)
CREATE TABLE shift_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE NOT NULL,
  assignment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shift_id, assignment_date) -- Only one doctor per shift per day
);

-- Shift Assignments Policies
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assignments are viewable by everyone" ON shift_assignments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only super_admin can manage assignments" ON shift_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Patients table
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  contact_number TEXT,
  age INTEGER,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Keep patient history even if doctor is deleted
  shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients Policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- 1. View Policy
-- Super Admin: All patients
-- Doctors: Only patients they treated OR if super_admin gave permission (omitted for MVP simplicity as per request: "Can see only their own patients")
CREATE POLICY "Doctors see their own patients, Admins see all" ON patients
  FOR SELECT USING (
    auth.uid() = doctor_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- 2. Insert Policy
CREATE POLICY "Doctors can create patients" ON patients
  FOR INSERT WITH CHECK (
    auth.uid() = doctor_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- 3. Update Policy
CREATE POLICY "Doctors can update their own patients, Admins see all" ON patients
  FOR UPDATE USING (
    auth.uid() = doctor_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- 4. Delete Policy
CREATE POLICY "Doctors can delete their own patients, Admins see all" ON patients
  FOR DELETE USING (
    auth.uid() = doctor_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Function to handle new user signup (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (new.id, new.email, 'sub_doctor', new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
