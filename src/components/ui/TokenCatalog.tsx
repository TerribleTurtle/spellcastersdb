"use client";

const TOKEN_GROUPS = [
  {
    title: "Brand Colors",
    tokens: [
      "--sp-brand-primary",
      "--sp-brand-secondary",
      "--sp-brand-accent",
      "--sp-brand-dark",
    ],
  },
  {
    title: "Surfaces",
    tokens: [
      "--sp-surface-main",
      "--sp-surface-card",
      "--sp-surface-hover",
      "--sp-surface-highlight",
      "--sp-surface-deck",
      "--sp-surface-raised",
      "--sp-surface-dim",
      "--sp-surface-inset",
      "--sp-surface-overlay",
    ],
  },
  {
    title: "Typography",
    tokens: [
      "--sp-text-primary",
      "--sp-text-secondary",
      "--sp-text-muted",
      "--sp-text-dimmed",
      "--sp-text-faint",
    ],
  },
  {
    title: "Borders",
    tokens: ["--sp-border-subtle", "--sp-border-default", "--sp-border-strong"],
  },
  {
    title: "Status",
    tokens: [
      "--sp-status-success",
      "--sp-status-success-text",
      "--sp-status-danger",
      "--sp-status-danger-text",
      "--sp-status-info",
      "--sp-status-info-text",
      "--sp-status-warning",
      "--sp-status-warning-text",
    ],
  },
  {
    title: "Rarity",
    tokens: [
      "--sp-rarity-common",
      "--sp-rarity-rare",
      "--sp-rarity-epic",
      "--sp-rarity-legendary",
    ],
  },
];

export function TokenCatalog() {
  return (
    <div className="space-y-8">
      {TOKEN_GROUPS.map((group) => (
        <div key={group.title}>
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4 border-b border-border-subtle pb-2">
            {group.title}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {group.tokens.map((token) => (
              <div key={token} className="space-y-2">
                <div
                  className="h-16 rounded-lg border border-border-subtle shadow-sm transition-all hover:scale-105"
                  style={{ backgroundColor: `var(${token})` }}
                />
                <div
                  className="text-xs font-mono text-text-muted truncate"
                  title={token}
                >
                  {token.replace("--sp-", "")}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
