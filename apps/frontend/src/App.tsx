import { useEffect, useState } from "react";
import { listProjects, createProject, type Project } from "./lib/projects";
import { listSites, createSite, type Site } from "./lib/sites";

export default function App() {
  const [token, setToken] = useState<string>(
    localStorage.getItem("token") || "",
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // form project
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");

  // form site
  const [siteName, setSiteName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [siteStart, setSiteStart] = useState("");

  async function loadProjects() {
    setError("");
    setLoading(true);
    try {
      const data = await listProjects();
      setProjects(data.items);
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  async function loadSites(pid: number) {
    setError("");
    try {
      const data = await listSites(pid);
      setSites(data.items);
    } catch (e: any) {
      setError(e.message || "Erreur chargement sites");
    }
  }

  useEffect(() => {
    if (token) loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function saveToken() {
    localStorage.setItem("token", token.trim());
    loadProjects();
  }

  async function onCreateProject(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createProject({
        name,
        description: description || undefined,
        startDate: startDate || undefined,
      });
      setName("");
      setDescription("");
      setStartDate("");
      await loadProjects();
    } catch (e: any) {
      setError(e.message || "Erreur création projet");
    }
  }

  async function onCreateSite(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError("");
    try {
      await createSite(selected.id, {
        name: siteName,
        address: siteAddress || undefined,
        startDate: siteStart || undefined,
      });
      setSiteName("");
      setSiteAddress("");
      setSiteStart("");
      await loadSites(selected.id);
    } catch (e: any) {
      setError(e.message || "Erreur création site");
    }
  }

  function selectProject(p: Project) {
    setSelected(p);
    loadSites(p.id);
  }

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "system-ui, sans-serif",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <h1>BatProAI — Projets & Sites</h1>

      <section
        style={{
          marginBottom: 24,
          padding: 12,
          border: "1px solid #333",
          borderRadius: 8,
        }}
      >
        <h3>Token (coller celui du /login)</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Bearer token…"
            style={{ flex: 1, padding: 8 }}
          />
          <button onClick={saveToken}>Enregistrer</button>
        </div>
      </section>

      {error && (
        <div style={{ marginBottom: 12, color: "#d33" }}>
          <strong>Erreur :</strong> {error}
        </div>
      )}

      <section
        style={{
          marginBottom: 24,
          padding: 12,
          border: "1px solid #333",
          borderRadius: 8,
        }}
      >
        <h2>Projets</h2>
        <form
          onSubmit={onCreateProject}
          style={{
            display: "grid",
            gap: 8,
            gridTemplateColumns: "1fr 1fr",
            alignItems: "center",
          }}
        >
          <label>
            Nom
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </label>
          <label>
            Date de début
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
          <label style={{ gridColumn: "1 / span 2" }}>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: 8 }}
            />
          </label>
          <div style={{ gridColumn: "1 / span 2" }}>
            <button type="submit">Créer le projet</button>
          </div>
        </form>

        {loading ? (
          <p>Chargement…</p>
        ) : projects.length === 0 ? (
          <p>Aucun projet.</p>
        ) : (
          <table
            style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #444",
                    padding: 8,
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #444",
                    padding: 8,
                  }}
                >
                  Nom
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #444",
                    padding: 8,
                  }}
                >
                  Statut
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #444",
                    padding: 8,
                  }}
                >
                  Début
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #444",
                    padding: 8,
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: 8 }}>{p.id}</td>
                  <td style={{ padding: 8 }}>{p.name}</td>
                  <td style={{ padding: 8 }}>{p.status}</td>
                  <td style={{ padding: 8 }}>
                    {p.startDate
                      ? new Date(p.startDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => selectProject(p)}>Voir sites</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {selected && (
        <section
          style={{
            marginBottom: 24,
            padding: 12,
            border: "1px solid #333",
            borderRadius: 8,
          }}
        >
          <h2>
            Sites — Projet #{selected.id} « {selected.name} »
          </h2>

          <form
            onSubmit={onCreateSite}
            style={{
              display: "grid",
              gap: 8,
              gridTemplateColumns: "1fr 1fr 1fr",
              alignItems: "center",
            }}
          >
            <label>
              Nom
              <input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
                style={{ width: "100%", padding: 8 }}
              />
            </label>
            <label>
              Adresse
              <input
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </label>
            <label>
              Début
              <input
                type="date"
                value={siteStart}
                onChange={(e) => setSiteStart(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </label>
            <div style={{ gridColumn: "1 / span 3" }}>
              <button type="submit">Ajouter le site</button>
            </div>
          </form>

          {sites.length === 0 ? (
            <p>Aucun site.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: 12,
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #444",
                      padding: 8,
                    }}
                  >
                    ID
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #444",
                      padding: 8,
                    }}
                  >
                    Nom
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #444",
                      padding: 8,
                    }}
                  >
                    Adresse
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #444",
                      padding: 8,
                    }}
                  >
                    Début
                  </th>
                </tr>
              </thead>
              <tbody>
                {sites.map((s) => (
                  <tr key={s.id}>
                    <td style={{ padding: 8 }}>{s.id}</td>
                    <td style={{ padding: 8 }}>{s.name}</td>
                    <td style={{ padding: 8 }}>{s.address || "-"}</td>
                    <td style={{ padding: 8 }}>
                      {s.startDate
                        ? new Date(s.startDate).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}
