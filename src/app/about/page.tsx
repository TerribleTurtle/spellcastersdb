import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";

export const metadata = {
  title: "About",
  description: "Learn about SpellcastersDB, a community-driven database and deck builder for Spellcasters Chronicles. Built by fans, for fans.",
  keywords: ["Spellcasters Chronicles", "About", "Community", "Database", "Open Source"],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-main text-foreground pt-28 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary">
          About SpellcastersDB
        </h1>

        <div className="space-y-8">
          {/* Mission */}
          <section className="bg-surface-card border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">Our Mission</h2>
            <p className="text-slate-300 leading-relaxed">
              SpellcastersDB is a community-driven platform dedicated to providing the most comprehensive and up-to-date information about <strong>Spellcasters Chronicles</strong>. Our goal is to help players discover units, build competitive decks, and explore the game&apos;s strategic depth.
            </p>
          </section>

          {/* Data Source */}
          <section className="bg-surface-card border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">Data Source</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              All game data is sourced from the{" "}
              <a
                href="https://github.com/TerribleTurtle/spellcasters-community-api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:text-brand-accent transition-colors inline-flex items-center gap-1"
              >
                Spellcasters Community API
                <ExternalLink size={14} />
              </a>
              , a community-maintained repository that aggregates game information. The API is updated regularly to reflect the latest game balance changes and new content.
            </p>
            <p className="text-slate-400 text-sm">
              <strong>Note:</strong> This is an unofficial, fan-made project and is not affiliated with the official Spellcasters Chronicles development team.
            </p>
          </section>

          {/* Technology */}
          <section className="bg-surface-card border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">Technology</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              SpellcastersDB is built with modern web technologies to ensure fast performance and excellent user experience:
            </p>
            <ul className="list-disc list-inside text-slate-300 space-y-2">
              <li><strong>Next.js</strong> - React framework with static site generation</li>
              <li><strong>TypeScript</strong> - Type-safe code for reliability</li>
              <li><strong>Tailwind CSS</strong> - Modern, responsive design</li>
              <li><strong>Vercel</strong> - Fast, global CDN hosting</li>
            </ul>
          </section>

          {/* Contribute */}
          <section className="bg-surface-card border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">Get Involved</h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              This project is open source and community-driven. You can contribute in several ways:
            </p>
            <div className="space-y-3">
              <a
                href="https://github.com/TerribleTurtle/spellcasters-community-api"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors group"
              >
                <Github size={24} className="text-brand-primary" />
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-brand-accent transition-colors">
                    Contribute to the API
                  </div>
                  <div className="text-sm text-slate-400">
                    Help maintain game data and improve the community API
                  </div>
                </div>
                <ExternalLink size={16} className="ml-auto text-slate-500" />
              </a>
            </div>
          </section>

          {/* Credits */}
          <section className="bg-surface-card border border-white/10 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-brand-accent">Credits</h2>
            <p className="text-slate-300 leading-relaxed">
              Created and maintained by <strong className="text-brand-primary">TerribleTurtle</strong> and the Spellcasters Chronicles community. Special thanks to all contributors who help keep the data accurate and up-to-date.
            </p>
          </section>

          {/* Back to Archive */}
          <div className="text-center pt-4">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-linear-to-r from-brand-primary to-brand-secondary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Back to Archive
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
