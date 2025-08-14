import { useEffect, useMemo, useState } from "react";
import { listProjects, createProject, type Project } from "./lib/projects";
import { listSites, createSite, type Site } from "./lib/sites";
import { listTasks, createTask, type Task, type Priority } from "./lib/tasks";

export default function App() {
  const [token, setToken] = useState<string>(
    localStorage.getItem("token") || "",
  );
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<Project | null>(null);

  const [sites, setSites] = useState<Site[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

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

  // form task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState<Priority>("MEDIUM");
  const [taskDue, setTaskDue] = useState("");
  const [taskSiteId, setTaskSiteId] = useState<number | "">("");

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

  async function loadTasks(pid: number) {
    setError("");
    try {
      const data = await listTasks(pid);
      setTasks(data.items);
    } catch (e: any) {
      setError(e.message || "Erreur chargement tâches");
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

  async function onCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError("");
    try {
      await createTask(selected.id, {
        title: taskTitle,
        description: taskDesc || undefined,
        priority: taskPriority,
        dueDate: taskDue || undefined,
        siteId: taskSiteId === "" ? undefined : Number(taskSiteId),
      });
      setTaskTitle("");
      setTaskDesc("");
      setTaskPriority("MEDIUM");
      setTaskDue("");
      setTaskSiteId("");
      await loadTasks(selected.id);
    } catch (e: any) {
      setError(e.message || "Erreur création tâche");
    }
  }

  async function selectProject(p: Project) {
    setSelected(p);
    await Promise.all([loadSites(p.id), loadTasks(p.id)]);
  }

  const siteOptions = useMemo(
    () => sites.map((s) => ({ value: s.id, label: `${s.name} (#${s.id})` })),
    [sites],
  );

  return (
    <div
      style={{
        padding: 24,
        fontFamily: "system-ui, sans-serif",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <h1>BatProAI — Projets, Sites & Tâches</h1>

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

      {/* Projets */}
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
                    <button onClick={() => selectProject(p)}>
                      Voir sites & tâches
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Sites */}
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

      {/* Tâches */}
      {selected && (
        <section
          style={{
            marginBottom: 24,
            padding: 12,
            border: "1px solid #333",
            borderRadius: 8,
          }}
        >
          <h2>Tâches — Projet #{selected.id}</h2>

          <form
            onSubmit={onCreateTask}
            style={{
              display: "grid",
              gap: 8,
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              alignItems: "center",
            }}
          >
            <label>
              Titre
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
                style={{ width: "100%", padding: 8 }}
              />
            </label>
            <label>
              Priorité
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as Priority)}
                style={{ width: "100%", padding: 8 }}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </label>
            <label>
              Échéance
              <input
                type="date"
                value={taskDue}
                onChange={(e) => setTaskDue(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </label>
            <label>
              Site (optionnel)
              <select
                value={taskSiteId}
                onChange={(e) =>
                  setTaskSiteId(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                style={{ width: "100%", padding: 8 }}
              >
                <option value="">—</option>
                {siteOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ gridColumn: "1 / span 4" }}>
              Description
              <textarea
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                rows={2}
                style={{ width: "100%", padding: 8 }}
              />
            </label>
            <div style={{ gridColumn: "1 / span 4" }}>
              <button type="submit">Ajouter la tâche</button>
            </div>
          </form>

          {tasks.length === 0 ? (
            <p>Aucune tâche.</p>
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
                    Titre
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #444",
                      padding: 8,
                    }}
                  >
                    Priorité
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
                    Échéance
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #444",
                      padding: 8,
                    }}
                  >
                    Site
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td style={{ padding: 8 }}>{t.id}</td>
                    <td style={{ padding: 8 }}>{t.title}</td>
                    <td style={{ padding: 8 }}>{t.priority}</td>
                    <td style={{ padding: 8 }}>{t.status}</td>
                    <td style={{ padding: 8 }}>
                      {t.dueDate
                        ? new Date(t.dueDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td style={{ padding: 8 }}>{t.siteId ?? "-"}</td>
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
