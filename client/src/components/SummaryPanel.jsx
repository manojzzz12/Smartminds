export function SummaryPanel({ uploads }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Structured Summaries</h2>
          <p>Each uploaded source is summarized and indexed for contextual answers.</p>
        </div>
      </div>
      <div className="stack-list">
        {uploads?.length ? (
          uploads.map((upload) => (
            <article key={upload._id} className="content-card">
              <h3>{upload.originalName}</h3>
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
