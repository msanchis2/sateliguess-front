import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // Importamos axios
import Map from "./Map";
import "./App.css";

const App = () => {
  const route = "https://sateliguess-back-production.up.railway.app/api/";
  const [coordinates, setCoordinates] = useState(null);
  const [municipioDiario, setMunicipioDiario] = useState(null);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [guess, setGuess] = useState("");
  const [pistaGastada, setPistaGastada] = useState(false);
  const [showModalRendirse, setShowModalRendirse] = useState(false);
  const [showModalPista, setShowModalPista] = useState(false);
  const [showModalAjuda, setShowModalAjuda] = useState(false);
  const [showModalRegio, setShowModalRegio] = useState(false);
  const [pistaIndex, setPistaIndex] = useState(0);
  const [win, setWin] = useState(false);
  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      nuevoMunicipio();
      firstLoad.current = false;
      console.log(`
         \\    /\\
          )  ( ')  Meow
          (  /  )
           \\(__)|

    Cigró diu hola!
    `);
    }
  }, []);

  const nuevoMunicipio = () => {
    axios
      .get(`${route}municipio-aleatorio`)
      .then((response) => {
        setMunicipioDiario(response.data);
        setCoordinates([
          parseFloat(response.data.latitud),
          parseFloat(response.data.longitud),
        ]);
      })
      .catch((error) =>
        console.error("Error al obtener el municipio diario:", error)
      );
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (value.length >= 3) {
      axios
        .get(`${route}municipios/${value}`)
        .then((response) => {
          const filteredSuggestions = response.data.filter(
            (m) =>
              !attempts.some(
                (attempt) =>
                  attempt.nom.toLowerCase() === m.municipio.toLowerCase()
              )
          );
          setSuggestions(filteredSuggestions);
        })
        .catch((error) => console.error("Error en la búsqueda:", error));
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (municipio) => {
    setGuess(municipio);
    setInput(municipio.municipio);
    setSuggestions([]);
  };

  const distance = (municipio1, municipio2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);
    // Extraer coordenadas y convertir a números
    const lat1 = parseFloat(municipio1.latitud);
    const lon1 = parseFloat(municipio1.longitud);
    const lat2 = parseFloat(municipio2.latitud);
    const lon2 = parseFloat(municipio2.longitud);
    // Radio de la Tierra en km
    const R = 6371;
    // Diferencias de coordenadas en radianes
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    // Convertir coordenadas a radianes
    const radLat1 = toRadians(lat1);
    const radLat2 = toRadians(lat2);
    // Fórmula de Haversine
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // Distancia en km
    const distancia = R * c;
    // Cálculo del ángulo de dirección
    const y = Math.sin(dLon) * Math.cos(radLat2);
    const x =
      Math.cos(radLat1) * Math.sin(radLat2) -
      Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(dLon);
    let brng = Math.atan2(y, x) * (180 / Math.PI);
    // Convertir el ángulo a positivo (0 a 360)
    brng = (brng + 360) % 360;
    // Determinar la dirección cardinal
    const direcciones = [
      "nord",
      "norest",
      "est",
      "surest",
      "sud",
      "sudoest",
      "oest",
      "noroest",
      "nord",
    ];
    const index = Math.round(brng / 45); // Dividir el círculo en 8 sectores de 45°
    const direccion = direcciones[index];

    return { distancia: distancia.toFixed(2), direccion };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!municipioDiario || !guess.municipio) return;

    const { distancia } = distance(municipioDiario, guess);
    setPistaGastada(false);
    if (
      guess.municipio.toLowerCase() === municipioDiario.municipio.toLowerCase()
    ) {
      setWin(true);
    } else {
      if (!attempts.includes(guess.municipio)) {
        setAttempts([...attempts, { nom: guess.municipio, distancia }]);
      }
    }
    setInput("");
  };

  const cargarMunicipio = () => {
    window.location.reload();
  };

  const rendirse = (e) => {
    e.preventDefault();
    setShowModalRendirse(true);
  };

  const pista = (e) => {
    e.preventDefault();
    setPistaGastada(true);
    setShowModalPista(true);
  };

  const ajuda = (e) => {
    e.preventDefault();
    setShowModalAjuda(true);
  };

  const regio = (e) => {
    e.preventDefault();
    setShowModalRegio(true);
  };

  const getPista = () => {
    if (pistaIndex === 0) {
      return (
        <div className="pista">
          <p>Provincia: {municipioDiario.provincia}</p>
        </div>
      );
    }
    if (pistaIndex === 1) {
      return (
        <div className="pista">
          <p>Provincia: {municipioDiario.provincia}</p>
          <p>Primera lletra: {municipioDiario.municipio[0]} </p>
        </div>
      );
    }
    if (pistaIndex === 2) {
      const nombre = municipioDiario.municipio;
      const letrasAleatorias = [...nombre];
      const indicesAleatorios = [];
      while (indicesAleatorios.length < 2) {
        const index = Math.floor(Math.random() * nombre.length);
        if (!indicesAleatorios.includes(index)) {
          indicesAleatorios.push(index);
        }
      }
      const letrasOcultas = letrasAleatorias.map((letra, index) => {
        return indicesAleatorios.includes(index) ? letra : "_";
      });
      return (
        <div className="pista">
          <p>Provincia: {municipioDiario.provincia}</p>
          <p>Nom: {letrasOcultas.join("")}</p>
        </div>
      );
    }
    return "";
  };

  const handleCloseModal = () => {
    setShowModalPista(false);
    if (pistaIndex < 2) {
      setPistaIndex(pistaIndex + 1);
    }
  };

  return (
    <main>
      <div className="title">
        <div className="ajuda" onClick={(e) => ajuda(e)}>
          ❓
        </div>
        <h1>Sateliguess</h1>
        <div className="regio" onClick={(e) => regio(e)}>
          🗺️
        </div>
      </div>
      <div id="mapa">
        <Map coordinates={coordinates} />
      </div>
      <div className="attempts">
        {attempts.length > 0 && (
          <div className="attempts">
            {attempts.map((attempt, index) => (
              <div className="attempt" key={index}>
                <span>❌ {attempt.nom}</span>
                <span>{attempt.distancia} Km</span>
              </div>
            ))}
          </div>
        )}
        {win && (
          <div className="attempt win">
            <span>✅ {municipioDiario.municipio}</span>
            <span>Intents: {attempts.length}</span>
          </div>
        )}
      </div>
      <div className="container">
        {!win && (
          <form onSubmit={handleSubmit}>
            <div className="searchInput">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Escriu el nom del municipi..."
              />
              {suggestions.length > 0 && (
                <div className="resultBox">
                  {suggestions.map((m) => (
                    <div key={m.id} onClick={() => handleSelectSuggestion(m)}>
                      {m.municipio}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="boton">
              🔎 ENDEVINA
            </button>
            <div className="botones">
              <button
                onClick={(e) => pista(e)}
                className={
                  attempts.length < 5 || pistaGastada
                    ? "boton disabled"
                    : "boton"
                }
                disabled={attempts.length < 5 || pistaGastada}
              >
                Pista{" "}
                <span className="intents">
                  {attempts.length < 5 && `Intents: ${attempts.length}/5`}
                </span>
              </button>
              <button onClick={(e) => rendirse(e)} className="boton">
                Em rendisc
              </button>
            </div>
          </form>
        )}
        {win && (
          <button onClick={() => cargarMunicipio()} className="boton">
            Carregar altre
          </button>
        )}
      </div>
      <footer>
        <div className="xarxes">
          <a
            href="mailto:martisanchis2000@gmail.com"
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="icon2"
              src="https://i.imgur.com/i1sA0YE.png"
              alt="Email"
            />
          </a>
          <a
            href="https://www.linkedin.com/in/msanchis2/"
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="icon"
              src="https://i.imgur.com/58x5aRC.png"
              alt="Linkedin"
            />
          </a>
          <a
            href="https://www.Ko-fi.com/martisanchis"
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="icon3"
              src="https://i.imgur.com/45x8o2E.png"
              alt="Kofi"
            />{" "}
            Contribueix
          </a>
        </div>
        <span>
          © 2025 Martí Sanchis Román - Codi obert baix llicència{" "}
          <a
            href="https://www.gnu.org/licenses/gpl-3.0.html"
            target="_blank"
            rel="noreferrer"
          >
            GPLv3
          </a>
        </span>
      </footer>
      {showModalRegio && (
        <div className="modal">
          <div className="modal-content">
            <h2>🚧 Proximament 🚧</h2>
            <p>Estem treballant en les versions de distints països i regions</p>
            <button
              className="boton-modal"
              onClick={() => setShowModalRegio(false)}
            >
              Continuar
            </button>
          </div>
        </div>
      )}
      {showModalAjuda && (
        <div className="modal">
          <div className="modal-content">
            <h2>Com jugar</h2>
            <p>
              1. Escriu el nom del municipi, i selecciona'l a la llista
              d'opcions. Si no el trobes, revisa si l'has escrit en la toponímia
              oficial (No fiques "Játiva" o "Carcagente", fes el favor).
            </p>
            <p>
              2. Si no has encertat, voràs a què distància es troba el municipi
              seleccionar del de la imatge.
            </p>
            <p>
              3. A partir del cinqué intent fallit, per cada intent següent
              tindràs una pista opcional.
            </p>
            <button
              className="boton-modal"
              onClick={() => setShowModalAjuda(false)}
            >
              Anem-hi!
            </button>
          </div>
        </div>
      )}
      {showModalRendirse && (
        <div className="modal">
          <div className="modal-content">
            <h2>
              {municipioDiario.municipio} ({municipioDiario.provincia})
            </h2>
            <button className="boton-modal" onClick={() => cargarMunicipio()}>
              Torna a jugar
            </button>
          </div>
        </div>
      )}
      {showModalPista && (
        <div className="modal">
          <div className="modal-content">
            <h2>Pista {pistaIndex + 1}</h2>
            {getPista()}
            <button
              className="boton-modal"
              onClick={() => handleCloseModal(false)}
            >
              Tornar a provar
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default App;
