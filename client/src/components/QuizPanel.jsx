export function QuizPanel({ uploads }) {
  const quizItems = uploads?.flatMap((upload) => upload.analysis?.quiz || []) || [];

  return (
    <section className="panel quiz-panel">
      <div className="panel-header">
        <div>
          <h2>Quiz Generator</h2>
          <p>Auto-generated comprehension checks from the source material.</p>
        </div>
        <div className="panel-kicker">Review Lab</div>
      </div>
      <div className="quiz-grid">
        {quizItems.length ? (
          quizItems.map((item, index) => (
            <article key={`${item.question}-${index}`} className="content-card quiz-card">
              <div className="quiz-card-top">
                <span className="quiz-badge">{index + 1}</span>
                <h3>{item.question}</h3>
              </div>
              <ul className="option-list">
                {item.options?.map((option) => (
                  <li key={option}>{option}</li>
                ))}
              </ul>
              <p className="answer-line">Answer: {item.answer}</p>
            </article>
          ))
        ) : (
          <div className="empty-state">Upload a source to generate quiz questions.</div>
        )}
      </div>
    </section>
  );
}
