export const distance = (municipio1, municipio2) => {
  const lat1 = parseFloat(municipio1.latitud);
  const lon1 = parseFloat(municipio1.longitud);
  const lat2 = parseFloat(municipio2.latitud);
  const lon2 = parseFloat(municipio2.longitud);
  return {
    distancia: calcularDistancia(lat1, lon1, lat2, lon2).toFixed(2),
    direccio: calcularDireccio(lat1, lon1, lat2, lon2),
  };
};

const toRadians = (degrees) => degrees * (Math.PI / 180);

export const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const calcularDireccio = (lat1, lon1, lat2, lon2) => {
  const dLon = toRadians(lon2 - lon1);
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);
  const y = Math.sin(dLon) * Math.cos(radLat2);
  const x =
    Math.cos(radLat1) * Math.sin(radLat2) -
    Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(dLon);
  let brng = (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
  return ["⬇️", "↙️", "⬅️", "↖️", "⬆️", "↗️", "➡️", "↘️"][
    Math.round(brng / 45)
  ];
};

export const generarPistaLletres = (nom) => {
  let lletres = nom.split("");
  let indices = [...Array(nom.length).keys()]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  return lletres.map((l, i) => (indices.includes(i) ? l : "_")).join("");
};

export const getPista = (pistaIndex, municipioDiario, pistaLletres) => {
  if (pistaIndex === undefined || pistaIndex === null || !municipioDiario)
    return "";
  switch (pistaIndex) {
    case 0:
      return <p>Provincia: {municipioDiario?.provincia}</p>;
    case 1:
      return (
        <>
          <p>Provincia: {municipioDiario?.provincia}</p>
          <p>Comarca: {municipioDiario?.comarca}</p>
        </>
      );
    case 2:
      return (
        <>
          <p>Provincia: {municipioDiario?.provincia}</p>
          <p>Comarca: {municipioDiario?.comarca}</p>
          <p>Nom: {pistaLletres}</p>
        </>
      );
    default:
      return "";
  }
};

export const getPaisName = (pname, opcionsPais) => {
  return opcionsPais[pname];
};

export const localPais = (opcionsPais) => {
  if (!opcionsPais || Object.keys(opcionsPais).length === 0) {
    return "ca"; // Retornem "ca" si opcioionsPais està buit o no existeix.
  }
  const paisCache = localStorage.getItem("pais");

  // Verificar si el pais del caché existeix a les opcions.
  // Sino es així, retornar el primer pais de les opcions.
  // En cas contrari, tenim per defecte 'ca'.
  if (paisCache && Object.keys(opcionsPais).includes(paisCache)) {
    return paisCache;
  }

  const defaultPais = Object.keys(opcionsPais)[0] || "ca"; // Default to "ca" if opcionsPais.ca is undefined
  localStorage.setItem("pais", defaultPais);
  return defaultPais;
};
