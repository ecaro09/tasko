INSERT INTO storage.buckets (id, name, public)
VALUES ('task_images', 'task_images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Policies for the 'task_images' bucket
CREATE POLICY "Allow authenticated uploads for task images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'task_images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated reads for task images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'task_images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated updates for task images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'task_images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated deletes for task images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'task_images' AND auth.uid() IS NOT NULL);