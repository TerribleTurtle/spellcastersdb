/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "./tsconfig.json",
    },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
    reporterOptions: {
      dot: {
        collapsePattern: "node_modules/[^/]+",
      },
      archi: {
        collapsePattern:
          "^(packages|src|lib|app|bin|test(s?)|spec(s?))/[^/]+|node_modules/[^/]+",
      },
    },
  },
  forbidden: [
    /* rules from the 'recommended' preset can be added here if desired */
    
    /* 1. No Circular Dependencies */
    {
      name: "no-circular",
      severity: "warn",
      comment:
        "This dependency is part of a circular relationship. You might want to revise " +
        "your solution (i.e. use dependency injection, split modules). " +
        "Known: features/shared/inspector has pre-existing cycles (tracked for future cleanup).",
      from: {},
      to: {
        circular: true,
      },
    },

    /* 2. UI Components cannot import Features */
    /* UI components should be dumb and reusable. Features contain business logic. */
    {
      name: "no-ui-importing-features",
      severity: "error",
      comment:
        "Generic UI components (src/components/ui) should not import from domain features (src/features). " +
        "UI components must remain domain-agnostic.",
      from: {
        path: "^src/components/ui",
      },
      to: {
        path: "^src/features",
      },
    },

    /* 3. Features cannot import App (Pages/Layouts) */
    /* Features should be self-contained and not depend on the routing layer. */
    {
      name: "no-features-importing-app",
      severity: "error",
      comment:
        "Features (src/features) should not import from the app directory (src/app). " +
        "Features should be usable in any route context.",
      from: {
        path: "^src/features",
      },
      to: {
        path: "^src/app",
      },
    },
    
    /* 4. No Orphaned Files (Optional, good for hygiene) */
    /*
    {
      name: "no-orphans",
      severity: "warn",
      from: {
        orphan: true,
        pathNot: [
          "(^|/)\\.[^/]+\\.(js|ts|ejs|json)$", // dot files
          "\\.d\\.ts$",                        // type definitions
          "(^|/)tsconfig\\.json$",
          "(^|/)(babel|webpack|jest|vitest|eslint|prettier)\\.config\\.(js|cjs|mjs|ts|json)$", // configs
        ],
      },
      to: {},
    },
    */
  ],
};
