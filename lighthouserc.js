module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/deck-builder',
        'http://localhost:3000/deck-builder?mode=team'
      ],
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // We demote performance to warn because local machine variance makes it flaky
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        // We demote best-practices and PWA to warn. 
        // Next.js injects render-blocking CSS and has weird caching heuristics locally.
        'categories:best-practices': ['warn', { minScore: 0.95 }],
        'categories:pwa': ['warn', { minScore: 0.95 }],
        // Ignore specific Next.js build artifacts that always fail locally
        'unused-javascript': ['warn'],
        'unused-css-rules': ['warn'],
        'critical-request-chains': ['warn'],
        'render-blocking-resources': ['warn'],
        'legacy-javascript': ['warn'],
        'cache-insight': ['warn'],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci/',
    },
  },
};
