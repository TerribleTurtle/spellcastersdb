export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { fetchGameData } = await import("@/lib/api");
    console.log("[Instrumentation] Pre-loading game data...");
    await fetchGameData();
    console.log("[Instrumentation] Game data pre-loaded.");
  }
}
