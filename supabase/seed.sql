insert into roles (code, libelle) values
 ('admin','Administrateur'), ('gestionnaire','Gestionnaire'),
 ('agent','Agent'), ('lecteur','Lecteur');

insert into permissions (code, libelle) values
 ('employes.read','Voir employés'), ('employes.write','Gérer employés'),
 ('clients.read','Voir clients'), ('clients.write','Gérer clients'),
 ('affectations.manage','Gérer affectations'),
 ('badges.manage','Gérer badges'),
 ('reclamations.read','Voir réclamations'), ('reclamations.write','Gérer réclamations'),
 ('rapports.read','Voir rapports'), ('rapports.export','Exporter rapports'),
 ('utilisateurs.manage','Gérer utilisateurs'),
 ('temoignages.manage','Gérer témoignages');

insert into questions_satisfaction (ordre, type_question, libelle, options) values
 (1,'note','Dans quelle mesure êtes-vous satisfait(e) de la qualité du service reçu ?','[]'),
 (2,'note','L''employé(e) était-il/elle ponctuel(le) ?','[]'),
 (3,'note','Le professionnalisme de l''employé(e)','[]'),
 (4,'note','La propreté et le soin du travail effectué','[]'),
 (5,'note','La communication avant et pendant la prestation','[]'),
 (6,'choix','Le service a-t-il été rendu dans les délais convenus ?','["Oui, entièrement","Partiellement","Non"]'),
 (7,'choix','Recommanderiez-vous Haiti Courtier Service ?','["Oui","Peut-être","Non"]'),
 (8,'choix','Comment avez-vous connu nos services ?','["Bouche-à-oreille","Réseaux sociaux","Publicité","Autre"]'),
 (9,'texte','Qu''est-ce que nous pourrions améliorer ?','[]'),
 (10,'texte','Avez-vous un commentaire ou un témoignage à partager ?','[]');

insert into employes (prenom, nom, poste, numero_identifiant, telephone, disponible) values
 ('Jean','Pierre','Chauffeur','HCS-2026-001','+509 34 00 0001', true),
 ('Marie','Jean','Auxiliaire de vie','HCS-2026-002','+509 34 00 0002', true),
 ('Wilson','Desir','Jardinier','HCS-2026-003','+509 34 00 0003', false);

insert into clients (nom, type_client, contact_nom, telephone) values
 ('Famille Innocent','particulier','M. Innocent','+509 31 00 0001'),
 ('Entreprise Tropical S.A.','entreprise','Diane Laurent','+509 31 00 0002');

insert into affectations (employe_id, client_id, date_debut) values
 ((select id from employes where numero_identifiant='HCS-2026-001'),
  (select id from clients where nom='Famille Innocent'), '2026-09-01');
