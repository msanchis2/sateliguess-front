import React from "react";

export const Footer: React.FC = () => {
  return (
    <>
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
        <div> </div>
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
      <span>Versió 1.0.2</span>
    </>
  );
};
