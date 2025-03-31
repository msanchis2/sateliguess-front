import { availableCountriesList } from "../config";

export interface IMunicipio {
  id: number;
  provincia: string;
  municipio: string;
  comarca: string;
  latitud: string;
  longitud: string;
}

export type TKeyPais = typeof availableCountriesList[number];
// Define the type for the options object using a mapped type
export type TConfigOpcionsPais = {
  [T in TKeyPais]: IPais;
};

export interface IPais {
  id: TKeyPais;
  nom: string;
  placeholder: string;
}

export interface IDificultat {
  distancia: boolean;
  direccio: boolean;
  pistes: boolean;
  zoom: number;
}

export interface IAttempt {
  nom: string;
  distancia: string;
  direccio: string;
}

export type TModal = "rendirse" | "ajuda" | "dificultat" | "pista" | "regio";


