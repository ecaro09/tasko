-- Create the 'task_images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('task_images', 'task_images', TRUE)
ON CONFLICT (id) DO NOTHING;