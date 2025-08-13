import { useState } from "react";
import { ping } from "./lib/api";

export default function App() {
  const [result, setResult] = useState<string>("(rien)");

  const handlePing = async () => {
    try {
      const data = await ping();
      setResult(JSON.stringify(data));
    } catch (e) {
      setResult("Erreur: " + String(e));
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>BatProAI Frontend</h1>
      <p>Test de connexion API</p>
      <button onClick={handlePing}>Tester /ping</button>
      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 12,
          marginTop: 12,
        }}
      >
        {result}
      </pre>
    </div>
  );
}
