import { IDificultat, TConfigOpcionsPais } from "../types";

// Pots afegir més opcions de pais a l'array si vols ampliar el joc. 
// Si es modifica, s'ha d'adaptar l'objecte d'opcions de pais.
export const availableCountriesList = ["pv", "ca", "ib"] as const;

// TODO: modificar el backend per obtenir el municipi aleatori?
export const opcionsPais: TConfigOpcionsPais = {
  pv: { id: "pv", placeholder: "del Pais Valencià", nom: "Pais Valencià" },
  ca: { id: "ca", placeholder: "de Catalunya", nom: "Catalunya" },
  ib: { id: "ib", placeholder: "de les Illes Balears", nom: "Illes Balears" },
};

export const dificultatInicial: IDificultat = {
  direccio: true,
  distancia: true,
  pistes: true,
  zoom: 15,
};
