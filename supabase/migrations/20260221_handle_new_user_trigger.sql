-- ============================================================
-- Auto-create profile row on new user signup
-- ============================================================
-- Defense-in-depth: ensures a profiles row exists for every
-- auth.users entry. Client-side getOrCreateProfile() handles
-- this too, but the trigger catches edge cases (e.g., client
-- call fails, user signs in from a different device).
--
-- For OAuth users (Google), pulls display_name from provider
-- metadata so WelcomeModal can skip the name step.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, has_onboarded)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NULL
    ),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger fires after INSERT on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
