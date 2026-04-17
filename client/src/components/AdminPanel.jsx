import { useEffect, useState } from "react";
import { http } from "../api/http";

export function AdminPanel({ visible }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    heroTitle: "",
    heroSubtitle: "",
    defaultProvider: "openai",
    newTemplateName: ""
  });

  useEffect(() => {
    if (!visible) return;
    http
      .get("/admin")
      .then((response) => {
        setData(response.data);
        const defaultProvider =
          response.data.config.aiProviders.find((provider) => provider.isDefault)?.key ||
          "openai";
        setForm({
          heroTitle: response.data.config.appBranding.heroTitle,
          heroSubtitle: response.data.config.appBranding.heroSubtitle,
          defaultProvider,
          newTemplateName: ""
        });
      })
      .catch((error) =>
        setStatus(error.response?.data?.message || "Unable to load admin data")
      );
  }, [visible]);

  async function handleSave() {
    if (!data) return;
    const nextProviders = data.config.aiProviders.map((provider) => ({
      ...provider,
      isDefault: provider.key === form.defaultProvider
    }));
    const nextTemplates = form.newTemplateName
      ? [
          ...data.config.notebookTemplates,
          {
            name: form.newTemplateName,
            description: "Admin-created template",
            starterPrompts: ["What should I focus on first?"]
          }
        ]
      : data.config.notebookTemplates;

    try {
      const response = await http.put("/admin", {
        appBranding: {
          ...data.config.appBranding,
          heroTitle: form.heroTitle,
          heroSubtitle: form.heroSubtitle
        },
        aiProviders: nextProviders,
        notebookTemplates: nextTemplates
      });
      setData((current) => ({
        ...current,
        config: response.data.config
      }));
      setForm((current) => ({ ...current, newTemplateName: "" }));
      setStatus("Admin configuration updated.");
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to save admin settings");
    }
  }

  if (!visible) return null;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Admin Control</h2>
          <p>Manage templates, provider preferences, and usage visibility.</p>
        </div>
      </div>
      {status ? <p className="status-text">{status}</p> : null}
      {data ? (
        <div className="admin-grid">
          <article className="content-card">
            <h3>Usage</h3>
            <p>Users: {data.metrics.users}</p>
            <p>Notebooks: {data.metrics.notebooks}</p>
            <p>Uploads: {data.metrics.uploads}</p>
          </article>
          <article className="content-card">
            <h3>Providers</h3>
            <select
              value={form.defaultProvider}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  defaultProvider: event.target.value
                }))
              }
            >
              {data.config.aiProviders.map((provider) => (
                <option key={provider.key} value={provider.key}>
                  {provider.label}
                </option>
              ))}
            </select>
          </article>
          <article className="content-card">
            <h3>Notebook Templates</h3>
            <ul className="option-list">
              {data.config.notebookTemplates.map((template) => (
                <li key={template.name}>{template.name}</li>
              ))}
            </ul>
            <input
              placeholder="New template name"
              value={form.newTemplateName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  newTemplateName: event.target.value
                }))
              }
            />
          </article>
          <article className="content-card">
            <h3>Branding</h3>
            <input
              placeholder="Hero title"
              value={form.heroTitle}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  heroTitle: event.target.value
                }))
              }
            />
            <textarea
              placeholder="Hero subtitle"
              value={form.heroSubtitle}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  heroSubtitle: event.target.value
                }))
              }
            />
            <button className="primary-button" onClick={handleSave}>
              Save Admin Changes
            </button>
          </article>
        </div>
      ) : null}
    </section>
  );
}
