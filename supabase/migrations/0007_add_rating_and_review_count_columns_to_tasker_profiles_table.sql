ALTER TABLE public.tasker_profiles
ADD COLUMN rating NUMERIC DEFAULT 0,
ADD COLUMN review_count INTEGER DEFAULT 0;

-- Update existing RLS policies to include new columns if necessary (though SELECT/UPDATE policies usually cover all columns)
-- For simplicity, assuming existing policies are broad enough or will be regenerated.
-- If specific column-level RLS is needed, more granular policies would be required.