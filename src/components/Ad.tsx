import React, { useState } from "react";

type AdType = "mobile" | "desktop";

interface AdProps {
  type: AdType;
  onInfoClick?: () => void;
}

const Ad: React.FC<AdProps> = ({ type, onInfoClick }) => {
  const [closed, setClosed] = useState(false);

  const config =
    type === "desktop"
      ? {
          key: "63cb4acb4896592533649b465dec1a1c",
          width: 160,
          height: 600,
        }
      : {
          key: "b68f6ab95b3dc30410c09c0e1025fc7b",
          width: 320,
          height: 50,
        };

  if (closed) {
    return (
      <div
        style={{
          width: config.width,
          height: config.height,
          background: "#ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          textAlign: "center",
          padding: "8px",
        }}
      >
        <span
          style={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={onInfoClick}
        >
          Per què veig publicitat?
        </span>
      </div>
    );
  }

  const adHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; overflow: hidden; }
      </style>
    </head>
    <body>
      <script>
        atOptions = {
          key: '${config.key}',
          format: 'iframe',
          height: ${config.height},
          width: ${config.width},
          params: {}
        };
      </script>
      <script src="https://www.highperformanceformat.com/${config.key}/invoke.js"></script>
    </body>
    </html>
  `;

  return (
    <div style={{ position: "relative", width: config.width }}>
      <button
        onClick={() => setClosed(true)}
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          zIndex: 10,
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "20px",
          height: "20px",
          cursor: "pointer",
          fontSize: "12px",
        }}
      >
        ✕
      </button>

      <iframe
        srcDoc={adHTML}
        width={config.width}
        height={config.height}
        style={{ border: "none", overflow: "hidden" }}
        scrolling="no"
        title={`ad-${type}`}
      />
    </div>
  );
};

export default Ad;