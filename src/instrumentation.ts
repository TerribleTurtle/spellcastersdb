export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { fetchGameData } = await import("@/services/data/api");
    await fetchGameData();
  }
}
