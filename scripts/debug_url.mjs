
import LZString from 'lz-string';

const target = "NoIglgTg9gdg+gZyhAxgUwhkAaEECGAtgA74QAuOIC5sacARmgBZqFTnNX40EA2cWgHcsuAGaR6BMDCqd8MfLQQgAukA";

function test() {
    console.log("Original Hash:", target);
    console.log("Original Length:", target.length);

    // 1. Decode
    try {
        const json = LZString.decompressFromEncodedURIComponent(target);
        if (!json) {
            console.error("Failed to decompress");
            return;
        }
        console.log("Decompressed JSON:", json);
        
        const deck = JSON.parse(json);
        console.log("Parsed Deck:", deck);

        // 2. Re-encode using current method (Baseline)
        const reEncoded = LZString.compressToEncodedURIComponent(json);
        console.log("Re-encoded Length:", reEncoded.length);

        // 3. Optimization 1: Separator based (Pipe)
        // Format: SpellcasterID|Slot1|Slot2...
        // Replace null with empty string
        const optimizedArray = deck.map(item => item === null ? "" : item);
        const pipeString = optimizedArray.join("|");
        console.log("Pipe String:", pipeString);
        
        const pipeEncoded = LZString.compressToEncodedURIComponent(pipeString);
        console.log("Pipe Encoded Length:", pipeEncoded.length);
        console.log("Pipe Savings:", target.length - pipeEncoded.length);
        
        const rawUri = encodeURIComponent(pipeString);
        console.log("Raw URI Encoded Length:", rawUri.length);
        console.log("Raw URI Savings:", target.length - rawUri.length);

        // 4. Optimization 2: Custom Mapping (Simulation)
        // Assume we can map these specific IDs to 2-char codes (Base64-like)
        // This simulates if we had a lookup table.
        // There are 6 items. 
        // "Kael" -> "01", "fireball" -> "02" etc.
        // 6 * 2 chars = 12 chars + separators = 17 chars.
        console.log("Theoretical Dictionary Implementation (~20 chars) would be huge, but requires maintaining a dictionary.");

    } catch (e) {
        console.error(e);
    }
}

test();
