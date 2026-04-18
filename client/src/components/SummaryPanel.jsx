export function SummaryPanel({ uploads }) {
  return (
    <section className="panel summary-panel">
      <div className="panel-header">
        <div>
          <h2>Structured Summaries</h2>
          <p>Each uploaded source is summarized and indexed for contextual answers.</p>
        </div>
        <div className="panel-kicker">Editorial View</div>
      </div>
      <div className="summary-ribbon">
        <span>Executive snapshots</span>
        <span>Source-grounded notes</span>
        <span>Readable briefing format</span>
      </div>
      <div className="stack-list summary-list">
        {uploads?.length ? (
          uploads.map((upload) => (
            <article key={upload._id} className="content-card summary-card">
              <div className="summary-meta">
                <span>Source file</span>
                <strong>{upload.originalName}</strong>
              </div>
              <p className="reading-copy">
                {upload.aiSummary || "Summary will appear after analysis."}
              </p>
            </article>
          ))
        ) : (
          <div className="empty-state">No source summaries yet.</div>
        )}
      </div>
    </section>
  );
}
