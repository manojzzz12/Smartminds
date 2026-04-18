export function MemoryPanel({ notebook }) {
  return (
    <section className="panel memory-panel">
      <div className="panel-header">
        <div>
          <h2>Memory Panel</h2>
          <p>Important insights and follow-up recommendations preserved per notebook.</p>
        </div>
        <div className="panel-kicker">Signal Archive</div>
      </div>
      <div className="memory-grid">
        <article className="content-card memory-card insight-card">
          <h3>Insights</h3>
          <ul className="option-list">
            {(notebook?.memory?.insights || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="content-card memory-card recommendation-card">
          <h3>Recommendations</h3>
          <ul className="option-list">
            {(notebook?.memory?.recommendations || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
