create extension if not exists "uuid-ossp";

create type role_code as enum ('admin', 'gestionnaire', 'agent', 'lecteur');
create type statut_prestation as enum ('planifiee', 'en_cours', 'terminee', 'annulee');
create type statut_reclamation as enum ('ouverte', 'en_traitement', 'resolue', 'fermee');

create table roles (
  id uuid primary key default uuid_generate_v4(),
  code role_code unique not null,
  libelle text not null
);

create table permissions (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  libelle text not null
);

create table role_permissions (
  role_id uuid references roles(id) on delete cascade,
  permission_id uuid references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table profils (
  id uuid primary key references auth.users(id) on delete cascade,
  nom_utilisateur text unique not null,
  nom_complet text not null,
  role_id uuid references roles(id) not null,
  actif boolean default true,
  permissions_extra uuid[] default '{}',
  permissions_retirees uuid[] default '{}',
  created_at timestamptz default now()
);

create table employes (
  id uuid primary key default uuid_generate_v4(),
  prenom text not null,
  nom text not null,
  photo_url text,
  telephone text,
  email text,
  adresse text,
  poste text not null,
  numero_identifiant text unique not null,
  date_embauche date,
  disponible boolean default true,
  actif boolean default true,
  notes text,
  created_at timestamptz default now()
);

create table contrats (
  id uuid primary key default uuid_generate_v4(),
  employe_id uuid references employes(id) on delete cascade not null,
  type_contrat text not null,
  date_debut date not null,
  date_fin date,
  salaire numeric,
  document_url text,
  created_at timestamptz default now()
);

create table clients (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  type_client text default 'particulier',
  contact_nom text,
  telephone text not null,
  email text,
  adresse text,
  notes text,
  created_at timestamptz default now()
);

create table affectations (
  id uuid primary key default uuid_generate_v4(),
  employe_id uuid references employes(id) not null,
  client_id uuid references clients(id) not null,
  date_debut date not null,
  date_fin date,
  actif boolean default true,
  created_at timestamptz default now()
);

create table prestations (
  id uuid primary key default uuid_generate_v4(),
  affectation_id uuid references affectations(id) on delete cascade not null,
  description text not null,
  date_prestation date not null,
  statut statut_prestation default 'planifiee',
  cout numeric,
  created_at timestamptz default now()
);

create table badges (
  id uuid primary key default uuid_generate_v4(),
  employe_id uuid references employes(id) on delete cascade not null,
  numero_badge text unique not null,
  qr_code_url text,
  date_emission date default current_date,
  date_expiration date,
  actif boolean default true
);

create table questions_satisfaction (
  id uuid primary key default uuid_generate_v4(),
  ordre int not null,
  type_question text not null,
  libelle text not null,
  options jsonb default '[]',
  actif boolean default true
);

create table liens_satisfaction (
  id uuid primary key default uuid_generate_v4(),
  token uuid unique default uuid_generate_v4(),
  prestation_id uuid references prestations(id) on delete cascade not null,
  cree_par uuid references profils(id),
  date_creation timestamptz default now(),
  date_expiration timestamptz,
  utilise boolean default false
);

create table reponses_satisfaction (
  id uuid primary key default uuid_generate_v4(),
  lien_id uuid references liens_satisfaction(id) not null,
  question_id uuid references questions_satisfaction(id) not null,
  note int check (note between 1 and 5),
  reponse_choix text,
  reponse_texte text
);

create table formulaires_satisfaction (
  id uuid primary key default uuid_generate_v4(),
  lien_id uuid references liens_satisfaction(id) unique not null,
  commentaire_global text,
  consentement_temoignage boolean default false,
  note_globale int check (note_globale between 1 and 5),
  date_soumission timestamptz default now()
);

create table reclamations (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id),
  affectation_id uuid references affectations(id),
  creee_par uuid references profils(id),
  sujet text not null,
  description text not null,
  statut statut_reclamation default 'ouverte',
  resolution text,
  date_resolution timestamptz,
  created_at timestamptz default now()
);

create table temoignages (
  id uuid primary key default uuid_generate_v4(),
  formulaire_id uuid references formulaires_satisfaction(id),
  contenu text not null,
  auteur text,
  approuve boolean default false,
  created_at timestamptz default now()
);

create table journal_activite (
  id bigint generated always as identity primary key,
  utilisateur_id uuid references profils(id),
  action text not null,
  entite text,
  entite_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

create index idx_employes_nom on employes(nom);
create index idx_prestations_date on prestations(date_prestation);
create index idx_journal_date on journal_activite(created_at desc);
