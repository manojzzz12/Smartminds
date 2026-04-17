export function Sidebar({
  notebooks,
  activeNotebookId,
  onNotebookSelect,
  onCreateNotebook,
  onRenameNotebook,
  onDeleteNotebook,
  activeTab,
  onTabChange,
  creatingNotebook
}) {
  const tabs = ["chat", "summary", "quiz", "mindmap", "memory"];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-dot" />
        <div>
          <strong>SourceMind</strong>
          <span>AI research workspace</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <h3>Smart Notebooks</h3>
          <button className="ghost-button" onClick={onCreateNotebook} disabled={creatingNotebook}>
            {creatingNotebook ? "Creating..." : "New"}
          </button>
        </div>
        <div className="notebook-list">
          {notebooks.length ? (
            notebooks.map((notebook) => (
              <button
                key={notebook._id}
                className={`notebook-item ${
                  activeNotebookId === notebook._id ? "active" : ""
                }`}
                onClick={() => onNotebookSelect(notebook._id)}
              >
                <span>{notebook.title}</span>
                <div className="inline-actions">
                  <span
                    className="delete-link"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRenameNotebook(notebook);
                    }}
                  >
                    Rename
                  </span>
                  <span
                    className="delete-link"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteNotebook(notebook._id);
                    }}
                  >
                    Delete
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="empty-state compact-empty">
              Create a notebook to start uploading sources and chatting with them.
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Workspace</h3>
        <div className="tab-list">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-pill ${activeTab === tab ? "active" : ""}`}
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
