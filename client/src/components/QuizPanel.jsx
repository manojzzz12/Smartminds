export function QuizPanel({ uploads }) {
  const quizItems = uploads?.flatMap((upload) => upload.analysis?.quiz || []) || [];

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Quiz Generator</h2>
          <p>Auto-generated comprehension checks from the source material.</p>
        </div>
      </div>
      <div className="stack-list">
        {quizItems.length ? (
          quizItems.map((item, index) => (
            <article key={`${item.question}-${index}`} className="content-card">
              <h3>{index + 1}. {item.question}</h3>
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
