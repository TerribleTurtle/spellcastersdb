const { cruise } = require("dependency-cruiser");
const config = require("../.dependency-cruiser.cjs");

(async () => {
  try {
    const result = await cruise(["src"], {
      ...config.options,
      ruleSet: config,
    });

    if (result.output.summary.violations.length > 0) {
      console.log("Violations found:", JSON.stringify(result.output.summary.violations, null, 2));
      process.exit(1);
    } else {
      console.log("No violations found.");
      process.exit(0);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
