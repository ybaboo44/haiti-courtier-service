# Haiti Courtier Service

Plateforme de gestion des employés, clients, affectations, badges professionnels,
formulaires de satisfaction, réclamations et rapports — Next.js 14 + Supabase.

## Structure
- `src/app` : pages Next.js (App Router)
- `src/lib` : clients Supabase, auth, types
- `src/components` : composants UI
- `src/app/actions` : Server Actions (mutations)
- `supabase/` : schéma SQL, politiques RLS, données de démo

## Installation
1. Copier le dossier, puis :
   ```bash
   npm install
   cp .env.example .env.local   # renseigner vos clés Supabase
   ```
2. Dans Supabase → SQL Editor, exécuter dans l'ordre :
   - `supabase/schema.sql`
   - `supabase/rls.sql`
   - `supabase/seed.sql`
3. Dans Authentication → Providers : activer Email, désactiver "Confirm email" (démo).
4. Créer un bucket Storage public nommé `documents` (photos employés / contrats).
5. Créer le premier admin : Authentication → Add User
   - Email : `admin@hcs.local`
   - Mot de passe : au choix
   - User metadata : `{"nom_utilisateur":"admin","nom_complet":"Administrateur","role":"admin"}`
   - Connexion à l'app : identifiant `admin`, mot de passe choisi.

## Lancement
```bash
npm run dev   # http://localhost:3000
```

## Formulaire public de satisfaction
Lien généré par prestation : `/satisfaction/<token>` (public, sans compte).

## ⚠️ Avant le déploiement
- [ ] Remplacer les données fictives du seed
- [ ] Personnaliser les 10 questions (table `questions_satisfaction`)
- [ ] Définir `NEXT_PUBLIC_SITE_URL`
- [ ] Réactiver la confirmation d'e-mail
- [ ] Auditer les politiques RLS
- [ ] La conversion nom d'utilisateur → email (`@hcs.local`) est un raccourci de
      démo ; en production, utiliser un RPC serveur sécurisé (voir README § Sécurité).

## v2.0 — Refonte
1. Exécuter `supabase/migration_v2.sql` dans SQL Editor (après les scripts v1).
2. `npm install` (nouvelle dépendance : `recharts`).
3. Nouveaux modules : Prestations, Retours clients, Distinctions (badges récompenses),
   Sondages (CRUD/publier/dupliquer), Analyse de satisfaction, Paramètres,
   profil employé à onglets, navigation groupée + menu mobile, dashboard avec
   graphiques et activité récente.
