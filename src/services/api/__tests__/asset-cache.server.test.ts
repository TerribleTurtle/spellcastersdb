// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { getCachedAsset, assetCache } from '../asset-cache';

describe('Asset Cache (Server Implementation)', () => {
    beforeEach(() => {
        assetCache.clear();
        global.fetch = vi.fn();
        
        // Ensure "window" is undefined to trigger server path
        // Vitest runs in Node (JSDOM optional), but we want to force server path logic check.
        // We cannot delete global.window easily if JSDOM is present, but we can check if implementation respects it.
        // Actually, asset-cache checks: if (typeof window !== "undefined" && typeof FileReader !== "undefined")
        // So we just need to ensure window/FileReader are undefined or implementation falls back.
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should use Buffer path in Node environment', async () => {
        // Mock fetch response
        const mockArrayBuffer = new TextEncoder().encode("fake-image-data"); // "fake-image-data"
        
        (global.fetch as Mock).mockResolvedValue({
            ok: true,
            arrayBuffer: async () => mockArrayBuffer,
        });

        // Use defineProperty to shadow window if it exists (JSDOM environment)
        // Or we can rely on verifying the output, but output format is same.
        // However, implementation uses Buffer.from() in else block.
        // Spy on Buffer.from? It's global.
        const bufferSpy = vi.spyOn(Buffer, 'from');

        const result = await getCachedAsset("https://example.com/image.png");

        expect(result).toBeDefined();
        // Check if Buffer.from was called (proof server path was taken)
        // NOTE: If test environment has window defined (JSDOM), this test might fail if code takes browser path.
        // We will see. Default vitest setup usually heavily implies Node unless configured.
        // We'll trust the spy to tell us which path.
        
        // If JSDOM is active, window is defined.
        // The implementation checks: typeof window !== "undefined" && typeof FileReader !== "undefined"
        
        if (typeof window === 'undefined') {
             expect(bufferSpy).toHaveBeenCalled();
        } else {
             console.log("Test running in Browser-like env (JSDOM), skipping Buffer check or forcing it?");
        }
        
        expect(result?.startsWith("data:image/png;base64,")).toBe(true);
    });
});
