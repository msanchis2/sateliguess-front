import React, { useState, useEffect, useRef, useCallback } from "react";
import axios, { AxiosResponse } from "axios";
import { debounce, isEmpty, isNull } from "lodash";
import "./styles/App.css";
import {
  distance,
  generarPistaLletres,
  getPais,
  getPista,
  localPais,
} from "./lib/utils";
import { Footer } from "./Footer";
import { IAttempt, IDificultat, IMunicipio, TKeyPais, TModal } from "./types";
import Map from "./components/Map";
import Modal, { IModalProps } from "./components/Modal";
import { dificultatInicial, opcionsPais } from "./config";

const App: React.FC = () => {
  const route = "https://sateliguess-back-production.up.railway.app/api/"; //"http://localhost:3000/api/";
  const routeRef = useRef(route);
  const firstLoad = useRef(true);

  const [pais, setPais] = useState<TKeyPais>(localPais(opcionsPais));
  const [paisToChange, setPaisToChange] = useState<TKeyPais>(
    localPais(opcionsPais)
  );
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [municipioDiario, setMunicipioDiario] = useState<IMunicipio | null>(
    null
  );
  const [input, setInput] = useState("");
  const [pistaLletres, setPistaLletres] = useState("");
  const [suggestions, setSuggestions] = useState<IMunicipio[]>([]);
  const [attempts, setAttempts] = useState<IAttempt[]>([]);
  const [guess, setGuess] = useState<IMunicipio | null>(null);
  const [pistaGastada, setPistaGastada] = useState(false);
  const [dificultat, setDificultat] = useState<IDificultat>(dificultatInicial);
  const [pistaIndex, setPistaIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [win, setWin] = useState(false);
  const [modal, setModal] = useState<TModal | null>(null);

  const cargarMunicipio = useCallback(async () => {
    setAttempts([]);
    setWin(false);
    setGuess(null);
    setPistaIndex(0);
    nuevoMunicipio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pais]);

  const nuevoMunicipio = () => {
    axios
      .get(`${route}municipio-aleatorio?p=${pais}`)
      .then((response: AxiosResponse<IMunicipio>) => {
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

  useEffect(() => {
    if (firstLoad.current) {
      setIsMobile(window.innerWidth <= 768);
      firstLoad.current = false;
      const dificultatCache = localStorage.getItem("dificultat");
      const paisCache = localStorage.getItem("pais");
      if (!paisCache) {
        toggleModal("regio");
      }
      setDificultat(
        dificultatCache ? JSON.parse(dificultatCache) : dificultatInicial
      );

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
    if (!isEmpty(pais)) {
      cargarMunicipio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pais]);

  const toggleModal = (modal: TModal) => {
    setModal((prev) => (prev === modal ? null : modal));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleInputChange = useCallback(
    debounce((value: string) => {
      if (value.length < 3) return setSuggestions([]);

      axios
        .get(`${routeRef.current}municipios/${value}?p=${pais}`)
        .then((response: AxiosResponse<IMunicipio[]>) => {
          const filteredSuggestions = response.data.filter(
            (m: IMunicipio) =>
              !attempts.some(
                (attempt: IAttempt) =>
                  attempt.nom.toLowerCase() === m.municipio.toLowerCase()
              )
          );
          setSuggestions(filteredSuggestions);
        })
        .catch((error) => console.error("Error en la búsqueda:", error));
    }, 300),
    [attempts]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    handleInputChange(e.target.value);
  };

  const handleSelectSuggestion = (municipio: IMunicipio) => {
    setGuess(municipio);
    setInput(municipio.municipio);
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!municipioDiario || !guess?.municipio) return;

    const { distancia, direccio } = distance(municipioDiario, guess);
    setPistaGastada(false);

    if (
      guess.municipio.toLowerCase() === municipioDiario.municipio.toLowerCase()
    ) {
      setWin(true);
    } else {
      if (
        !attempts.some(
          (a: IAttempt) => a.nom.toLowerCase() === guess.municipio.toLowerCase()
        )
      ) {
        setAttempts((prev) => [
          ...prev,
          { nom: guess.municipio, distancia, direccio },
        ]);
      }
    }

    setInput("");
    setGuess(null);
  };

  const pista = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setPistaGastada(true);
    toggleModal("pista");
  };

  const openModal = (e: React.MouseEvent<HTMLDivElement>, modal: TModal) => {
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
    setModal(null);
    if (pistaIndex < 2) {
      setPistaIndex(pistaIndex + 1);
    }
  };

  // Centralitzem totes les configuracions relacionades amb el modal
  const modalConfig: Record<TModal, IModalProps> = {
    rendirse: {
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
      onClose: () => toggleModal("ajuda"),
      title: "Com jugar",
      btnText: "Anem!",
      children: (
        <>
          <p>
            1. Escriu el nom del municipi, i selecciona'l a la llista d'opcions.
          </p>
          <p>
            2. Si no has encertat, veuràs a què distància i direcció es troba.
          </p>
          <p>
            3. A partir del cinqué intent fallit, tindràs una pista opcional.
          </p>
        </>
      ),
    },
    dificultat: {
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
                checked={dificultat?.distancia}
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
      onClose: () => handleCloseModal(),
      title: `Pista ${pistaIndex + 1}`,
      btnText: "Tornar a provar",
      children: municipioDiario
        ? getPista(pistaIndex, municipioDiario, pistaLletres)
        : null,
    },
    regio: {
      onClose: () => changePais(),
      title: "Selecciona mapa",
      btnText: "D'acord",
      children: (
        <div className="paisos">
          {Object.values(opcionsPais).map((pais) => (
            <p
              key={pais.id}
              onClick={() => setPaisToChange(pais.id as TKeyPais)}
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
                <div className="direccions">
                  <span>{dificultat.distancia ? `${attempt.distancia} Km ` : " "}</span>
                  <span className="fletxa">{dificultat.direccio ? attempt.direccio : ""}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {win && (
        <div className="win">
          <span className="winMunicipi">✅ {municipioDiario?.municipio}</span>
          <span>
            {municipioDiario?.comarca} ({municipioDiario?.provincia})
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
                  getPais(pais, opcionsPais).placeholder
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
            Carrega'n un altre
          </button>
        )}
      </div>
      <footer>
        <Footer />
      </footer>
      {!isNull(modal) && (
        <Modal
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
