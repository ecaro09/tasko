CREATE OR REPLACE FUNCTION public.handle_verification_status_update()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status IS DISTINCT FROM 'approved' THEN
    -- Update the profiles table to mark the user as a verified tasker
    UPDATE public.profiles
    SET is_verified_tasker = TRUE, updated_at = NOW()
    WHERE id = NEW.user_id;
    RAISE NOTICE 'User % marked as verified tasker.', NEW.user_id;
  ELSIF NEW.status = 'rejected' AND OLD.status IS DISTINCT FROM 'rejected' THEN
    -- Update the profiles table to mark the user as not a verified tasker
    UPDATE public.profiles
    SET is_verified_tasker = FALSE, updated_at = NOW()
    WHERE id = NEW.user_id;
    RAISE NOTICE 'User % marked as not verified tasker due to rejection.', NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists to avoid conflicts during recreation
DROP TRIGGER IF EXISTS on_verification_request_updated ON public.verification_requests;

-- Create trigger to call the function after an update on verification_requests
CREATE TRIGGER on_verification_request_updated
AFTER UPDATE ON public.verification_requests
FOR EACH ROW EXECUTE FUNCTION public.handle_verification_status_update();