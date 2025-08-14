CREATE OR REPLACE FUNCTION update_user_profile(p_user_id uuid, p_full_name text, p_bio text, p_website text)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET
    full_name = p_full_name,
    bio = p_bio,
    website = p_website
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
