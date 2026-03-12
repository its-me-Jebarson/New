
-- Members table
CREATE TABLE public.members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  reg_no TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own members" ON public.members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own members" ON public.members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own members" ON public.members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own members" ON public.members FOR DELETE USING (auth.uid() = user_id);

-- Attendance records table
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(member_id, attendance_date)
);

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attendance" ON public.attendance_records FOR SELECT
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own attendance" ON public.attendance_records FOR INSERT
  WITH CHECK (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own attendance" ON public.attendance_records FOR UPDATE
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own attendance" ON public.attendance_records FOR DELETE
  USING (member_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));
