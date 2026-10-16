-- The signup trigger should never be callable through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
-- Only signed-in users need to ask "am I a reviewer?".
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
-- Pin search paths on helper functions.
alter function public.set_updated_at() set search_path = public;
alter function public.slugify(text) set search_path = public;
