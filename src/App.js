import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { debounce } from "lodash";
import Map from "./components/Map";
import Modal from "./components/Modal";
import "./styles/App.css";

const App = () => {
  const route = "https://sateliguess-back-production.up.railway.app/api/";

  const [coordinates, setCoordinates] = useState(null);
  const [municipioDiario, setMunicipioDiario] = useState(null);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [guess, setGuess] = useState("");
  const [pistaGastada, setPistaGastada] = useState(false);
  const [modals, setModals] = useState({
    pistaGastada: false,
    rendirse: false,
    pista: false,
    ajuda: false,
    regio: false,
    dificultat: false,
  });
  const [dificultat, setDificultat] = useState({});
  const [pistaIndex, setPistaIndex] = useState(0);
  const [win, setWin] = useState(false);
  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      nuevoMunicipio();
      firstLoad.current = false;
      const dificultatCache = localStorage.getItem("dificultat");
      dificultatCache
        ? setDificultat(JSON.parse(dificultatCache))
        : setDificultat({ distancia: true, direccio: true, pistes: true });
      console.log(`
         \\    /\\
          )  ( ')  Meow
          (  /  )
           \\(__)|

    Cigró diu hola!
    `);
    }
  }, []);

  const toggleModal = (modal) => {
    setModals((prev) => ({ ...prev, [modal]: !prev[modal] }));
  };

  const cargarMunicipio = () => {
    setAttempts([]);
    setWin(false);
    setGuess("");
    nuevoMunicipio();
  };

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

  const handleInputChange = useCallback(
    debounce((value) => {
      if (value.length < 3) return setSuggestions([]);
  
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
    }, 300),
    [attempts]
  );
  

  const onInputChange = (e) => {
    setInput(e.target.value);
    handleInputChange(e.target.value);
  };

  const handleSelectSuggestion = (municipio) => {
    setGuess(municipio);
    setInput(municipio.municipio);
    setSuggestions([]);
  };

  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
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

  const calcularDireccio = (lat1, lon1, lat2, lon2) => {
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

  const distance = (municipio1, municipio2) => {
    const lat1 = parseFloat(municipio1.latitud);
    const lon1 = parseFloat(municipio1.longitud);
    const lat2 = parseFloat(municipio2.latitud);
    const lon2 = parseFloat(municipio2.longitud);
    return {
      distancia: calcularDistancia(lat1, lon1, lat2, lon2).toFixed(2),
      direccio: calcularDireccio(lat1, lon1, lat2, lon2),
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!municipioDiario || !guess.municipio) return;

    const { distancia, direccio } = distance(municipioDiario, guess);
    setPistaGastada(false);

    if (
      guess.municipio.toLowerCase() === municipioDiario.municipio.toLowerCase()
    ) {
      setWin(true);
    } else {
      if (
        !attempts.some(
          (a) => a.nom.toLowerCase() === guess.municipio.toLowerCase()
        )
      ) {
        setAttempts((prev) => [
          ...prev,
          { nom: guess.municipio, distancia, direccio },
        ]);
      }
    }

    setInput("");
    setGuess("");
  };

  const pista = (e) => {
    e.preventDefault();
    setPistaGastada(true);
    toggleModal("pista");
  };

  const openModal = (e, modal) => {
    e.preventDefault();
    toggleModal(modal);
  };

  const generarPistaLletres = (nom) => {
    let lletres = nom.split("");
    let indices = [...Array(nom.length).keys()]
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    return lletres.map((l, i) => (indices.includes(i) ? l : "_")).join("");
  };

  const getPista = () => {
    switch (pistaIndex) {
      case 0:
        return <p>Provincia: {municipioDiario.provincia}</p>;
      case 1:
        return (
          <>
            <p>Provincia: {municipioDiario.provincia} </p>
            <p>Primera lletra: {municipioDiario.municipio[0]}</p>
          </>
        );
      case 2:
        return (
          <>
            <p>Provincia: {municipioDiario.provincia} </p>
            <p> Nom: {generarPistaLletres(municipioDiario.municipio)}</p>
          </>
        );
      default:
        return "";
    }
  };

  const handleCloseModal = () => {
    setModals((prev) => ({ ...prev, pista: false }));
    if (pistaIndex < 2) {
      setPistaIndex(pistaIndex + 1);
    }
  };

  return (
    <main>
      <div className="title">
        <div className="ajuda">
          <div onClick={(e) => openModal(e, "ajuda")}>❓</div>
          <div>_</div>
        </div>
        <h1>Sateliguess</h1>
        <div className="regio">
          <div onClick={(e) => openModal(e, "dificultat")}>⚙️</div>
          <div onClick={(e) => openModal(e, "regio")}>🗺️</div>
        </div>
      </div>
      <div id="mapa">
        <Map coordinates={coordinates} key={coordinates?.join(",")}/>
      </div>
      <div className="attempts">
        {attempts.length > 0 && (
          <div className="attempts">
            {attempts.map((attempt, index) => (
              <div className="attempt" key={index}>
                <span>❌ {attempt.nom}</span>
                <span>
                  {dificultat.distancia ? `${attempt.distancia} Km ` : " "}
                  {dificultat.direccio ? attempt.direccio : ""}
                </span>
              </div>
            ))}
          </div>
        )}
        {win && (
          <div className="attempt win">
            <span>✅ {municipioDiario.municipio}</span>
            <span>Intents: {attempts.length + 1}</span>
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
                onChange={onInputChange}
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
              {dificultat.pistes && (
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
              )}
              <button onClick={() => toggleModal("rendirse")} className="boton">
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
            href="https://github.com/msanchis2/sateliguess-front"
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="icon2"
              src="https://img.icons8.com/ios11/512/FFFFFF/github.png"
              alt="Github"
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
          <div>{" "}</div>
          <a
            href="https://www.Ko-fi.com/martisanchis"
            target="_blank"
            rel="noreferrer"
          >
            <img
              className="icon3"
              src="https://i.imgur.com/45x8o2E.png"
              alt="Kofi"
            />
            <span>{"Dona'm suport"}</span>
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
      {modals.regio && (
        <Modal
          show={modals.regio}
          onClose={() => toggleModal("regio")}
          title="🚧 Proximament 🚧"
          btnText="D'acord"
        >
          <p>Estem treballant en les versions de distints països i regions</p>
        </Modal>
      )}
      {modals.dificultat && (
        <Modal
          show={modals.dificultat}
          onClose={() => {
            toggleModal("dificultat");
            localStorage.setItem("dificultat", JSON.stringify(dificultat));
          }}
          title="Configura la dificultat"
          btnText="D'acord"
        >
          <div className="checks">
            <div className="check">
              <input
                type="checkbox"
                checked={dificultat.distancia}
                onChange={() =>
                  setDificultat({
                    ...dificultat,
                    distancia: !dificultat.distancia,
                  })
                }
              />
              <label>Mostrar distancia</label>
            </div>
            <div className="check">
              <input
                type="checkbox"
                checked={dificultat.direccio}
                onChange={() =>
                  setDificultat({
                    ...dificultat,
                    direccio: !dificultat.direccio,
                  })
                }
              />
              <label>Mostrar direcció</label>
            </div>
            <div className="check">
              <input
                type="checkbox"
                checked={dificultat.pistes}
                onChange={() =>
                  setDificultat({ ...dificultat, pistes: !dificultat.pistes })
                }
              />
              <label>Habilitar pistes</label>
            </div>
          </div>
        </Modal>
      )}
      {modals.ajuda && (
        <Modal
          show={modals.ajuda}
          onClose={() => toggleModal("ajuda")}
          title="Com jugar"
          btnText="Anem!"
        >
          <p>
            1. Escriu el nom del municipi, i selecciona'l a la llista d'opcions.
          </p>
          <p>
            2. Si no has encertat, voràs a què distància i direcció es troba.
          </p>
          <p>
            3. A partir del cinqué intent fallit, tindràs una pista opcional.
          </p>
        </Modal>
      )}
      {modals.rendirse && (
        <Modal
          show={modals.rendirse}
          onClose={() => {
            toggleModal("rendirse");
            cargarMunicipio();
          }}
          title={`${municipioDiario.municipio} (${municipioDiario.provincia})`}
          btnText="Tornar a jugar"
        ></Modal>
      )}
      {modals.pista && (
        <Modal
          show={modals.pista}
          onClose={() => handleCloseModal()}
          title={`Pista ${pistaIndex + 1}`}
          btnText="Tornar a provar"
        >
          {getPista()}
        </Modal>
      )}
    </main>
  );
};

export default App;
