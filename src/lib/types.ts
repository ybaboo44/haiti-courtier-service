export type Employe = {
  id: string; prenom: string; nom: string; photo_url: string | null;
  telephone: string | null; email: string | null; adresse: string | null;
  poste: string; numero_identifiant: string; date_embauche: string | null;
  disponible: boolean; actif: boolean; notes: string | null;
};

export type Client = {
  id: string; nom: string; type_client: string; contact_nom: string | null;
  telephone: string; email: string | null; adresse: string | null; notes: string | null;
};

export type Affectation = {
  id: string; employe_id: string; client_id: string;
  date_debut: string; date_fin: string | null; actif: boolean;
  employes?: { prenom: string; nom: string; poste: string };
  clients?: { nom: string };
};

export type Prestation = {
  id: string; affectation_id: string; description: string;
  date_prestation: string;
  statut: "planifiee" | "en_cours" | "terminee" | "annulee";
  cout: number | null;
};

export type Reclamation = {
  id: string; sujet: string; description: string;
  statut: "ouverte" | "en_traitement" | "resolue" | "fermee";
  resolution: string | null; created_at: string;
  clients?: { nom: string } | null;
};

export type QuestionSatisfaction = {
  id: string; ordre: number;
  type_question: "note" | "choix" | "texte";
  libelle: string; options: string[];
};
