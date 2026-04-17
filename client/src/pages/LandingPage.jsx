import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../api/http";

export function LandingPage() {
  const [branding, setBranding] = useState({
    heroTitle: "Turn messy source material into a living knowledge workspace.",
    heroSubtitle:
      "SourceMind combines multi-format ingestion, deep contextual chat, dynamic outputs, and admin-level configuration in one clean interface."
  });

  useEffect(() => {
    http
      .get("/public/config")
      .then((response) => setBranding(response.data.branding))
      .catch(() => {});
  }, []);

  const features = [
    "Upload PDFs, docs, spreadsheets, images, audio, and video",
    "Chat with notebook memory grounded in your own sources",
    "Generate summaries, quizzes, mind maps, and follow-up prompts",
    "Admin controls for AI providers, templates, and global branding"
  ];

  const stats = [
    { label: "Formats", value: "8+" },
    { label: "Output Modes", value: "6" },
    { label: "Contextual Memory", value: "Always On" }
  ];

  return (
    <main className="landing-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">AI-powered research operating system</p>
          <h1>{branding.heroTitle}</h1>
          <p className="hero-text">{branding.heroSubtitle}</p>
          <div className="hero-actions">
            <Link className="primary-button" to="/auth">
              Login
            </Link>
            <Link className="secondary-button" to="/auth?mode=signup">
              Sign Up
            </Link>
          </div>
          <div className="hero-stats">
            {stats.map((stat) => (
              <article key={stat.label} className="hero-stat-card">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </div>
        <div className="feature-board cinematic-board">
          {features.map((feature) => (
            <article key={feature} className="feature-card">
              <span className="feature-index">0{features.indexOf(feature) + 1}</span>
              <p>{feature}</p>
            </article>
          ))}
          <div className="signal-line" />
        </div>
      </section>
    </main>
  );
}
