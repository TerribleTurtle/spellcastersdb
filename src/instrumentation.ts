export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { fetchGameData } = await import("@/services/api/api");
      await fetchGameData();
    } catch (error) {
      console.error("❌ Instrumentation Hook Failed: Failed to pre-fetch game data.", error);
      // We do NOT rethrow here to allow the server to start even if data is initially bad.
      // The app will attempt to fetch again on first request/ISR.
    }
  }
}
