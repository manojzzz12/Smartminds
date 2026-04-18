function renderNode(node) {
  return (
    <li key={node.label}>
      <div className="mindmap-node">{node.label}</div>
      {node.children?.length ? <ul>{node.children.map(renderNode)}</ul> : null}
    </li>
  );
}

export function MindMapPanel({ uploads }) {
  const map = uploads?.[0]?.analysis?.mindMap;

  return (
    <section className="panel mindmap-panel">
      <div className="panel-header">
        <div>
          <h2>Mind Map</h2>
          <p>AI-generated concept structure for quick visual understanding.</p>
        </div>
        <div className="panel-kicker">Concept Network</div>
      </div>
      {map ? (
        <div className="mindmap-stage">
          <div className="mindmap-orbit orbit-one" />
          <div className="mindmap-orbit orbit-two" />
          <div className="mindmap-tree">
          <ul>{renderNode(map)}</ul>
        </div>
        </div>
      ) : (
        <div className="empty-state">A mind map appears after source analysis.</div>
      )}
    </section>
  );
}
