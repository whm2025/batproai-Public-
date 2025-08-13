const base = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function ping() {
  const r = await fetch(`${base}/ping`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
