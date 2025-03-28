import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { debounce, isEmpty } from "lodash";
import Map from "./components/Map";
import Modal from "./components/Modal";
import "./styles/App.css";
import {
  distance,
  generarPistaLletres,
  getPaisName,
  getPista,
  localPais,
} from "./lib/utils";
import { Footer } from "./Footer";

// Pots afegir més opcions de pais al final si vols ampliar el joc.
// TODO: modificar el backend per obtenir el municipi aleatori?
const opcionsPais = {
  pv: { placeholder: "del Pais Valencià", nom: "Pais Valencià", id: "pv" },
  ca: { placeholder: "de Catalunya", nom: "Catalunya", id: "ca" },
  // pb: { placeholder: "del País Basc", nom: "País Basc", id: "pb" },
};

const App = () => {
  const route = "https://sateliguess-back-production.up.railway.app/api/"; //"http://localhost:3000/api/";
  const routeRef = useRef(route);
  const firstLoad = useRef(true);

  const [pais, setPais] = useState(localPais(opcionsPais));
  const [paisToChange, setPaisToChange] = useState(localPais(opcionsPais));
  const [coordinates, setCoordinates] = useState(null);
  const [municipioDiario, setMunicipioDiario] = useState(null);
  const [input, setInput] = useState("");
  const [pistaLletres, setPistaLletres] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [guess, setGuess] = useState("");
  const [pistaGastada, setPistaGastada] = useState(false);
  const [dificultat, setDificultat] = useState({});
  const [pistaIndex, setPistaIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [win, setWin] = useState(false);
  const [modal, setModal] = useState("");

  useEffect(() => {
    if (firstLoad.current) {
      setIsMobile(window.innerWidth <= 768);
      firstLoad.current = false;
      const dificultatCache = localStorage.getItem("dificultat");
      const paisCache = localStorage.getItem("pais");
      if (!paisCache) {
        toggleModal("regio");
      }
      dificultatCache
        ? setDificultat(JSON.parse(dificultatCache))
        : setDificultat({
            distancia: true,
            direccio: true,
            pistes: true,
            zoom: 15,
          });
      console.log(`
         \\    /\\
          )  ( ')  Meow
          (  /  )
           \\(__)|

    Cigró diu hola!
    `);
    }
  }, []);

  useEffect(() => {
    cargarMunicipio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pais]);

  const toggleModal = (modal) => {
    setModal((prev) => (prev === modal ? "" : modal));
  };

  const cargarMunicipio = () => {
    setAttempts([]);
    setWin(false);
    setGuess("");
    setPistaIndex(0);
    nuevoMunicipio();
  };

  const nuevoMunicipio = () => {
    axios
      .get(`${route}municipio-aleatorio?p=${pais}`)
      .then((response) => {
        setMunicipioDiario(response.data);
        setCoordinates([
          parseFloat(response.data.latitud),
          parseFloat(response.data.longitud),
        ]);
        setPistaLletres(generarPistaLletres(response.data.municipio));
      })
      .catch((error) =>
        console.error("Error al obtener el municipio diario:", error)
      );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleInputChange = useCallback(
    debounce((value) => {
      if (value.length < 3) return setSuggestions([]);

      axios
        .get(`${routeRef.current}municipios/${value}?p=${pais}`)
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

  const changePais = () => {
    toggleModal("regio");
    if (paisToChange !== pais) {
      setPais(paisToChange);
      localStorage.setItem("pais", paisToChange);
    }
  };

  const handleCloseModal = () => {
    setModal("");
    if (pistaIndex < 2) {
      setPistaIndex(pistaIndex + 1);
    }
  };

  // Centralitzem totes les configuracions relacionades amb el modal
  const modalConfig = {
    rendirse: {
      show: modal === "rendirse",
      onClose: () => {
        toggleModal("rendirse");
        cargarMunicipio();
      },
      title: `${municipioDiario?.municipio}`,
      btnText: "Tornar a jugar",
      children: (
        <p>
          {municipioDiario?.comarca} ({municipioDiario?.provincia})
        </p>
      ),
    },
    ajuda: {
      show: modal === "ajuda",
      onClose: () => toggleModal("ajuda"),
      title: "Com jugar",
      btnText: "Anem!",
      children: (
        <>
          <p>
            1. Escriu el nom del municipi, i selecciona'l a la llista d'opcions.
          </p>
          <p>
            2. Si no has encertat, voràs a què distància i direcció es troba.
          </p>
          <p>
            3. A partir del cinqué intent fallit, tindràs una pista opcional.
          </p>
        </>
      ),
    },
    dificultat: {
      show: modal === "dificultat",
      onClose: () => {
        toggleModal("dificultat");
        localStorage.setItem("dificultat", JSON.stringify(dificultat));
      },
      title: "Configura la dificultat",
      btnText: "D'acord",
      children: (
        <>
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
          {/* Barra deslizante para el zoom */}
          <div className="zoom-slider">
            <label>Zoom</label>
            <input
              type="range"
              min="13"
              max="18"
              value={dificultat.zoom}
              onChange={(e) =>
                setDificultat({
                  ...dificultat,
                  zoom: parseInt(e.target.value, 10),
                })
              }
            />
            <span>{dificultat.zoom - 13}</span>
          </div>
        </>
      ),
    },
    pista: {
      show: modal === "pista",
      onClose: () => handleCloseModal(),
      title: `Pista ${pistaIndex + 1}`,
      btnText: "Tornar a provar",
      children: getPista(pistaIndex, municipioDiario, pistaLletres),
    },
    regio: {
      show: modal === "regio",
      onClose: () => changePais(),
      title: "Selecciona mapa",
      btnText: "D'acord",
      children: (
        <div className="paisos">
          {Object.values(opcionsPais).map((pais) => (
            <p
              key={pais.id}
              onClick={() => setPaisToChange(pais.id)}
              className={paisToChange === pais.id ? "seleccionat" : ""}
            >
              {pais.nom}
            </p>
          ))}
        </div>
      ),
    },
  };

  return (
    <main>
      <header className="title">
        <div className="ajuda">
          <div onClick={(e) => openModal(e, "ajuda")}>❓</div>
          <div>_</div>
        </div>
        <h1>Sateliguess</h1>
        <div className="regio">
          <div onClick={(e) => openModal(e, "dificultat")}>⚙️</div>
          <div onClick={(e) => openModal(e, "regio")}>🗺️</div>
        </div>
      </header>
      <div id="mapa">
        <Map
          coordinates={coordinates}
          key={coordinates?.join(",")}
          zoom={dificultat.zoom || 15}
        />
      </div>
      <div className="attempts">
        {attempts.length > 0 && (
          <div className="attempts">
            {attempts.map((attempt, index) => (
              <div className="attempt" key={index}>
                <span>❌ {attempt.nom}</span>
                <span className="direccions">
                  {dificultat.distancia ? `${attempt.distancia} Km ` : " "}
                  {dificultat.direccio ? attempt.direccio : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {win && (
        <div className="win">
          <span className="winMunicipi">✅ {municipioDiario.municipio}</span>
          <span>
            {municipioDiario.comarca} ({municipioDiario.provincia})
          </span>
          <span>Intents emprats: {attempts.length + 1}</span>
        </div>
      )}
      <div className="container">
        {!win && (
          <form onSubmit={handleSubmit}>
            <div className="searchInput">
              <input
                type="text"
                value={input}
                onChange={onInputChange}
                placeholder={`Municipi ${
                  getPaisName(pais, opcionsPais).placeholder
                }...`}
                onFocus={() => {
                  if (isMobile)
                    window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: "smooth",
                    });
                }}
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
        <Footer />
      </footer>
      {!isEmpty(modal) && (
        <Modal
          show={modalConfig[modal].show}
          onClose={modalConfig[modal].onClose}
          title={modalConfig[modal].title}
          btnText={modalConfig[modal].btnText}
        >
          {modalConfig[modal]?.children}
        </Modal>
      )}
    </main>
  );
};

export default App;
