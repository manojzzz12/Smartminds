import { useEffect, useState } from "react";
import { http } from "../api/http";
import { AdminPanel } from "../components/AdminPanel";
import { ChatPanel } from "../components/ChatPanel";
import { MemoryPanel } from "../components/MemoryPanel";
import { MindMapPanel } from "../components/MindMapPanel";
import { QuizPanel } from "../components/QuizPanel";
import { Sidebar } from "../components/Sidebar";
import { SummaryPanel } from "../components/SummaryPanel";
import { UploadPanel } from "../components/UploadPanel";
import { useAuth } from "../context/AuthContext";
import { useDashboardData } from "../hooks/useDashboardData";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeNotebookId, setActiveNotebookId] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedMode, setSelectedMode] = useState("summary");
  const [creatingNotebook, setCreatingNotebook] = useState(false);
  const [workspaceStatus, setWorkspaceStatus] = useState("");
  const { notebooks, notebookDetails, loading, error, refresh } =
    useDashboardData(activeNotebookId);

  useEffect(() => {
    if (!activeNotebookId && notebooks[0]) {
      setActiveNotebookId(notebooks[0]._id);
    }
  }, [notebooks, activeNotebookId]);

  async function handleCreateNotebook() {
    setCreatingNotebook(true);
    setWorkspaceStatus("");
    try {
      const response = await http.post("/notebooks", {
        title: `Research ${notebooks.length + 1}`
      });
      setActiveNotebookId(response.data.notebook._id);
      setActiveTab("chat");
      setWorkspaceStatus("Notebook created. Upload a source to start building context.");
      await refresh();
    } catch (requestError) {
      setWorkspaceStatus(
        requestError.response?.data?.message || "Could not create notebook."
      );
    } finally {
      setCreatingNotebook(false);
    }
  }

  async function handleDeleteNotebook(id) {
    const shouldDelete = window.confirm(
      "Delete this notebook and its uploaded sources? This cannot be undone."
    );
    if (!shouldDelete) return;

    await http.delete(`/notebooks/${id}`);
    const remaining = notebooks.filter((item) => item._id !== id);
    setActiveNotebookId(remaining[0]?._id || "");
    refresh();
  }

  const notebook = notebookDetails?.notebook;
  const uploads = notebookDetails?.uploads || [];
  const messages = notebookDetails?.messages || [];
  const recommendations = notebook?.memory?.recommendations || [];

  return (
    <div className="dashboard-shell">
      <Sidebar
        notebooks={notebooks}
        activeNotebookId={activeNotebookId}
        onNotebookSelect={setActiveNotebookId}
        onCreateNotebook={handleCreateNotebook}
        onRenameNotebook={async (targetNotebook) => {
          const title = window.prompt("Rename notebook", targetNotebook.title);
          if (!title || title === targetNotebook.title) return;
          await http.patch(`/notebooks/${targetNotebook._id}`, { title });
          refresh();
        }}
        onDeleteNotebook={handleDeleteNotebook}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        creatingNotebook={creatingNotebook}
      />

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Knowledge workspace</p>
            <h1>{notebook?.title || "Create your first notebook"}</h1>
          </div>
          <div className="topbar-actions">
            <span>{user?.name}</span>
            <button className="secondary-button" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        {loading ? <div className="panel">Loading notebook...</div> : null}
        {error ? <div className="panel">{error}</div> : null}
        {workspaceStatus ? <div className="panel status-panel">{workspaceStatus}</div> : null}

        {notebook ? (
          <>
            <section className="panel notebook-overview">
              <div className="overview-card">
                <span className="overview-label">Sources</span>
                <strong>{uploads.length}</strong>
              </div>
              <div className="overview-card">
                <span className="overview-label">Messages</span>
                <strong>{messages.length}</strong>
              </div>
              <div className="overview-card">
                <span className="overview-label">Output Mode</span>
                <strong>{selectedMode}</strong>
              </div>
            </section>

            <UploadPanel
              notebookId={notebook._id}
              onUploaded={refresh}
              selectedMode={selectedMode}
              onModeChange={setSelectedMode}
            />

            {activeTab === "chat" ? (
              <ChatPanel
                notebook={notebook}
                messages={messages}
                selectedMode={selectedMode}
                recommendations={recommendations}
                onCompleted={refresh}
              />
            ) : null}
            {activeTab === "summary" ? <SummaryPanel uploads={uploads} /> : null}
            {activeTab === "quiz" ? <QuizPanel uploads={uploads} /> : null}
            {activeTab === "mindmap" ? <MindMapPanel uploads={uploads} /> : null}
            {activeTab === "memory" ? <MemoryPanel notebook={notebook} /> : null}
            <AdminPanel visible={user?.role === "admin"} />
          </>
        ) : !loading ? (
          <section className="panel empty-workspace">
            <p className="eyebrow">Start Here</p>
            <h2>No notebook selected yet.</h2>
            <p>
              Create your first smart notebook to upload sources, keep chat history,
              and generate summaries, quizzes, and mind maps.
            </p>
            <button
              className="primary-button"
              onClick={handleCreateNotebook}
              disabled={creatingNotebook}
            >
              {creatingNotebook ? "Creating..." : "Create First Notebook"}
            </button>
          </section>
        ) : null}
      </main>
    </div>
  );
}
