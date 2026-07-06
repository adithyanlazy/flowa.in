-- Public-read bucket (product photos need to render for every visitor) but
-- writes are admin-only, reusing the same public.is_admin() helper defined
-- in supabase-schema.sql so this doesn't hit the same policy-recursion issue those fixed.
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

create policy "public read product photos" on storage.objects
  for select using (bucket_id = 'product-photos');

create policy "admin upload product photos" on storage.objects
  for insert with check (bucket_id = 'product-photos' and public.is_admin(auth.uid()));

create policy "admin update product photos" on storage.objects
  for update using (bucket_id = 'product-photos' and public.is_admin(auth.uid()));

create policy "admin delete product photos" on storage.objects
  for delete using (bucket_id = 'product-photos' and public.is_admin(auth.uid()));
