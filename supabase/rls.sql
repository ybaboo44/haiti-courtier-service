alter table profils enable row level security;
alter table employes enable row level security;
alter table clients enable row level security;
alter table affectations enable row level security;
alter table prestations enable row level security;
alter table badges enable row level security;
alter table contrats enable row level security;
alter table liens_satisfaction enable row level security;
alter table reponses_satisfaction enable row level security;
alter table formulaires_satisfaction enable row level security;
alter table reclamations enable row level security;
alter table temoignages enable row level security;
alter table journal_activite enable row level security;
alter table questions_satisfaction enable row level security;

create or replace function mes_permissions()
returns setof uuid language sql stable security definer as $$
  select p.id from permissions p
  where p.id in (select permission_id from role_permissions rp
                 join profils pr on pr.role_id = rp.role_id
                 where pr.id = auth.uid())
     or (p.id = any(select unnest(permissions_extra) from profils where id = auth.uid())
         and not p.id = any(select unnest(permissions_retirees) from profils where id = auth.uid()));
$$;

create or replace function a_permission(code text)
returns boolean language sql stable security definer as $$
  select exists(select 1 from permissions p
    where p.code = code and p.id in (select id from mes_permissions()));
$$;

create or replace function est_admin()
returns boolean language sql stable security definer as $$
  select exists(select 1 from profils where id = auth.uid()
    and role_id = (select id from roles where code = 'admin'));
$$;

create policy "employes_read" on employes for select
  using (a_permission('employes.read') or a_permission('employes.write'));
create policy "employes_write" on employes for all
  using (a_permission('employes.write')) with check (a_permission('employes.write'));

create policy "clients_read" on clients for select
  using (a_permission('clients.read') or a_permission('clients.write'));
create policy "clients_write" on clients for all
  using (a_permission('clients.write')) with check (a_permission('clients.write'));

create policy "affectations_read" on affectations for select
  using (a_permission('affectations.manage'));
create policy "affectations_write" on affectations for all
  using (a_permission('affectations.manage')) with check (a_permission('affectations.manage'));

create policy "prestations_read" on prestations for select
  using (a_permission('affectations.manage'));
create policy "prestations_write" on prestations for all
  using (a_permission('affectations.manage')) with check (a_permission('affectations.manage'));

create policy "badges_read" on badges for select
  using (a_permission('badges.manage'));
create policy "badges_write" on badges for all
  using (a_permission('badges.manage')) with check (a_permission('badges.manage'));

create policy "reclamations_read" on reclamations for select
  using (a_permission('reclamations.read') or a_permission('reclamations.write'));
create policy "reclamations_write" on reclamations for all
  using (a_permission('reclamations.write')) with check (a_permission('reclamations.write'));

create policy "rapports" on formulaires_satisfaction for select
  using (a_permission('rapports.read') or est_admin());

create policy "temoignages_read" on temoignages for select using (true);
create policy "temoignages_write" on temoignages for all
  using (a_permission('temoignages.manage')) with check (a_permission('temoignages.manage'));

-- Accès public anonyme (formulaire via token unique)
create policy "lien_public" on liens_satisfaction for select using (true);
create policy "reponse_publique" on reponses_satisfaction for insert with check (true);
create policy "formulaire_public" on formulaires_satisfaction for insert with check (true);
create policy "questions_publiques" on questions_satisfaction for select using (actif = true);

create policy "journal_admin" on journal_activite for select using (est_admin());
create policy "journal_write" on journal_activite for insert with check (true);

create or replace function creer_profil()
returns trigger language plpgsql security definer as $$
begin
  insert into profils (id, nom_utilisateur, nom_complet, role_id)
  values (new.id,
          new.raw_user_meta_data->>'nom_utilisateur',
          new.raw_user_meta_data->>'nom_complet',
          (select id from roles where code = coalesce(new.raw_user_meta_data->>'role', 'agent')));
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function creer_profil();

-- Attribution des permissions par rôle
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.code = 'admin';

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.code = 'gestionnaire'
  and p.code in ('employes.read','employes.write','clients.read','clients.write',
    'affectations.manage','badges.manage','reclamations.read','reclamations.write',
    'rapports.read','rapports.export','temoignages.manage');

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.code = 'agent'
  and p.code in ('employes.read','clients.read','reclamations.read');

insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.code = 'lecteur'
  and p.code in ('employes.read','clients.read');
