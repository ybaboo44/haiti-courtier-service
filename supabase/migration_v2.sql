-- ============================================================
-- MIGRATION V2 — Refonte : récompenses, sondages, retours, journal
-- À exécuter APRÈS le script SQL principal (schema + rls + seed)
-- ============================================================

-- 1. Extensions des tables existantes
alter table employes add column if not exists date_naissance date;
alter table employes add column if not exists departement text;
alter table affectations add column if not exists responsable boolean default false;
alter table liens_satisfaction add column if not exists sondage_id uuid references sondages(id);

-- 2. BADGES RÉCOMPENSES (distincts des badges physiques QR)
create table if not exists type_badges (
  id uuid primary key default uuid_generate_v4(),
  nom text unique not null,
  description text,
  icone text default '🏅',
  couleur text default '#0E5FA8',
  actif boolean default true
);

create table if not exists employe_badges (
  id uuid primary key default uuid_generate_v4(),
  employe_id uuid references employes(id) on delete cascade not null,
  type_badge_id uuid references type_badges(id) on delete cascade not null,
  attribue_par uuid references profils(id),
  date_attribution date default current_date,
  note text,
  unique (employe_id, type_badge_id, date_attribution)
);

-- 3. SONDAGES (enveloppe de gestion)
create table if not exists sondages (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  description text,
  statut text not null default 'brouillon',  -- brouillon | publie | desactive
  cree_par uuid references profils(id),
  created_at timestamptz default now()
);

-- 4. RETOURS CLIENTS
create table if not exists retours_clients (
  id uuid primary key default uuid_generate_v4(),
  type_retour text not null default 'positif',  -- positif | neutre | negatif | reclamation | suggestion
  statut text not null default 'nouveau',       -- nouveau | en_cours | traite | archive
  client_id uuid references clients(id) on delete set null,
  prestation_id uuid references prestations(id) on delete set null,
  employe_id uuid references employes(id) on delete set null,
  formulaire_id uuid references formulaires_satisfaction(id) on delete set null,
  contenu text not null,
  cree_par uuid references profils(id),
  created_at timestamptz default now(),
  traite_le timestamptz,
  traite_par uuid references profils(id)
);

-- 5. JOURNALISATION AUTOMATIQUE (activité récente du dashboard)
create or replace function log_action()
returns trigger language plpgsql security definer as $$
begin
  insert into journal_activite (utilisateur_id, action, entite, entite_id, details)
  values (auth.uid(), TG_OP, TG_TABLE_NAME, new.id, to_jsonb(new));
  return new;
end $$;

drop trigger if exists log_employes on employes;
create trigger log_employes after insert on employes for each row execute function log_action();
drop trigger if exists log_clients on clients;
create trigger log_clients after insert on clients for each row execute function log_action();
drop trigger if exists log_affectations on affectations;
create trigger log_affectations after insert on affectations for each row execute function log_action();
drop trigger if exists log_prestations on prestations;
create trigger log_prestations after insert on prestations for each row execute function log_action();
drop trigger if exists log_formulaires on formulaires_satisfaction;
create trigger log_formulaires after insert on formulaires_satisfaction for each row execute function log_action();
drop trigger if exists log_retours on retours_clients;
create trigger log_retours after insert on retours_clients for each row execute function log_action();

-- 6. RLS des nouvelles tables
alter table type_badges enable row level security;
alter table employe_badges enable row level security;
alter table sondages enable row level security;
alter table retours_clients enable row level security;

create policy "type_badges_read" on type_badges for select
  using (a_permission('employes.read') or est_admin());
create policy "type_badges_write" on type_badges for all
  using (a_permission('badges.manage') or est_admin())
  with check (a_permission('badges.manage') or est_admin());

create policy "employe_badges_read" on employe_badges for select
  using (a_permission('employes.read') or est_admin());
create policy "employe_badges_write" on employe_badges for all
  using (a_permission('badges.manage') or est_admin())
  with check (a_permission('badges.manage') or est_admin());

create policy "sondages_read" on sondages for select
  using (a_permission('affectations.manage') or est_admin() or statut = 'publie');
create policy "sondages_write" on sondages for all
  using (a_permission('affectations.manage') or est_admin())
  with check (a_permission('affectations.manage') or est_admin());

create policy "retours_read" on retours_clients for select
  using (a_permission('reclamations.read') or est_admin());
create policy "retours_write" on retours_clients for all
  using (a_permission('reclamations.write') or est_admin())
  with check (a_permission('reclamations.write') or est_admin());

-- 7. Catalogue de badges récompenses
insert into type_badges (nom, description, icone, couleur) values
 ('Employé du mois','Excellence globale du mois','🏆','#E8A020'),
 ('Excellent service','Feedback client exceptionnel','🌟','#0E5FA8'),
 ('Ponctualité','Aucun retard constaté','⏰','#059669'),
 ('Performance','Objectifs dépassés','🚀','#7C3AED'),
 ('Satisfaction client','Note moyenne ≥ 4,5','💙','#E11D48'),
 ('Nouveau membre','Bienvenue dans l''équipe','👋','#6B7280'),
 ('Expert','Maîtrise technique reconnue','🎓','#B45309'),
 ('Responsable','Esprit de leadership','👑','#0A4679')
on conflict (nom) do nothing;
