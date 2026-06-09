-- Run once if you already applied an older schema with separate Vice President office.

-- Merge into single ticket office (skip if president-ticket already exists)
insert into positions (slug, title, sort_order)
values ('president-ticket', 'President & Vice President', 10)
on conflict (slug) do update set title = excluded.title;

-- Deactivate separate VP office (optional: delete after moving candidates)
delete from positions where slug = 'vice-president';

-- Reassign any VP candidates to president-ticket manually before delete, or re-import CSV.
