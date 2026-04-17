import { useState } from "react";
import { http } from "../api/http";

export function ChatPanel({
  notebook,
  messages,
  selectedMode,
  recommendations,
  onCompleted
}) {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(nextPrompt = prompt) {
    if (!nextPrompt.trim() || !notebook?._id) return;
    setStatus("Thinking with notebook context...");
    try {
      await http.post("/chat", {
        notebookId: notebook._id,
        prompt: nextPrompt,
        outputMode: selectedMode
      });
      setPrompt("");
      setStatus("");
      onCompleted();
    } catch (error) {
      setStatus(error.response?.data?.message || "Message failed.");
    }
  }

  return (
    <section className="panel panel-stretch">
      <div className="panel-header">
        <div>
          <h2>Notebook Chat</h2>
          <p>Ask grounded questions, request summaries, or generate quizzes and mind maps.</p>
        </div>
      </div>

      <div className="chat-thread">
        {messages?.length ? (
          messages.map((message) => (
            <article key={message._id} className={`message ${message.role}`}>
              <div className="message-role">{message.role}</div>
              <pre className="message-content">{message.content}</pre>
              {message.role === "assistant" && message.citations?.length ? (
                <div className="citation-list">
                  {message.citations.map((citation, index) => (
                    <article
                      key={`${message._id}-${citation.fileId}-${citation.chunkIndex || index}`}
                      className="citation-card"
                    >
                      <strong>{citation.label}</strong>
                      {citation.snippet ? (
                        <p className="citation-snippet">{citation.snippet}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <div className="empty-state">
            Start by uploading a source, then ask a question about it.
          </div>
        )}
      </div>

      <div className="recommendations">
        {recommendations?.map((item) => (
          <button key={item} className="recommendation-chip" onClick={() => handleSubmit(item)}>
            {item}
          </button>
        ))}
      </div>

      <div className="chat-compose">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Ask about the uploaded content..."
        />
        <button className="primary-button" onClick={() => handleSubmit()}>
          Send
        </button>
      </div>
      {status ? <p className="status-text">{status}</p> : null}
    </section>
  );
}
