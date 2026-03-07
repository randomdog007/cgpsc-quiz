-- Diagnose all DB objects that still reference quizzes.subject_id
-- Run this in Supabase SQL editor.

-- 1) Confirm current quizzes columns
select
  c.ordinal_position,
  c.column_name,
  c.data_type
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name = 'quizzes'
order by c.ordinal_position;

-- 2) Check whether RLS is enabled on quizzes and related tables
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in ('quizzes', 'topics', 'subjects', 'questions', 'quiz_attempts')
order by c.relname;

-- 3) Policies that directly/indirectly reference quizzes.subject_id
select
  p.schemaname,
  p.tablename,
  p.policyname,
  p.permissive,
  p.roles,
  p.cmd,
  pg_get_expr(pol.qual, pol.polrelid) as using_expr,
  pg_get_expr(pol.with_check, pol.polrelid) as with_check_expr
from pg_policies p
join pg_policy pol
  on pol.polname = p.policyname
join pg_class cls
  on cls.oid = pol.polrelid
join pg_namespace nsp
  on nsp.oid = cls.relnamespace
where nsp.nspname = p.schemaname
  and cls.relname = p.tablename
  and (
    coalesce(pg_get_expr(pol.qual, pol.polrelid), '') ilike '%quizzes.subject_id%'
    or coalesce(pg_get_expr(pol.with_check, pol.polrelid), '') ilike '%quizzes.subject_id%'
    or coalesce(pg_get_expr(pol.qual, pol.polrelid), '') ilike '%subject_id%'
    or coalesce(pg_get_expr(pol.with_check, pol.polrelid), '') ilike '%subject_id%'
  )
order by p.schemaname, p.tablename, p.policyname;

-- 4) Views/materialized views that reference quizzes.subject_id
select
  v.schemaname,
  v.viewname,
  v.definition
from pg_views v
where v.schemaname = 'public'
  and (
    v.definition ilike '%quizzes.subject_id%'
    or v.definition ilike '%subject_id%'
  )
order by v.viewname;

select
  n.nspname as schemaname,
  c.relname as matview_name,
  pg_get_viewdef(c.oid, true) as definition
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'm'
  and (
    pg_get_viewdef(c.oid, true) ilike '%quizzes.subject_id%'
    or pg_get_viewdef(c.oid, true) ilike '%subject_id%'
  )
order by c.relname;

-- 5) Functions/procedures/triggers with subject_id references
select
  n.nspname as schema_name,
  p.proname as routine_name,
  p.prokind,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and (
    pg_get_functiondef(p.oid) ilike '%quizzes.subject_id%'
    or pg_get_functiondef(p.oid) ilike '%subject_id%'
  )
order by p.proname;

-- 6) Constraints/FKs that may imply expected subject_id links
select
  con.conname as constraint_name,
  con.contype as constraint_type,
  rel.relname as table_name,
  pg_get_constraintdef(con.oid, true) as definition
from pg_constraint con
join pg_class rel on rel.oid = con.conrelid
join pg_namespace n on n.oid = rel.relnamespace
where n.nspname = 'public'
  and (
    pg_get_constraintdef(con.oid, true) ilike '%subject_id%'
    or rel.relname in ('quizzes', 'topics', 'subjects', 'quiz_attempts')
  )
order by rel.relname, con.conname;

-- 7) Optional: quick sanity reads (will error if policy/schema broken)
-- select * from public.quizzes limit 5;
-- select * from public.topics limit 5;
