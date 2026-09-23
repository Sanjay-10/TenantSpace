-- Run this in your Supabase SQL Editor
ALTER TABLE public.announcements 
ADD COLUMN IF NOT EXISTS author_id uuid REFERENCES public.profiles(id);
