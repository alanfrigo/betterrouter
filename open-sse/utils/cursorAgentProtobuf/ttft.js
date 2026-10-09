import { checkedLen, decodeVarint, WT_LEN, WT_VARINT } from "./wire.js";
const ASM_TTFT_BREAKDOWN = 8; // AgentServerMessage.ttft_breakdown (beside the oneof)
/** Run a telemetry decoder; a malformed body yields undefined instead of dropping the frame. */
export function safely(decode) {
    try {
        return decode();
    }
    catch {
        return undefined;
    }
}
// decodeFields skips fixed64, and every TtftBreakdown field is a double.
function decodeTtftBreakdown(buf) {
    const ms = [0, 0, 0, 0, 0, 0];
    let pos = 0;
    while (pos < buf.length) {
        const [tag, np] = decodeVarint(buf, pos);
        pos = np;
        const fieldNumber = Number(tag >> 3n);
        const wireType = Number(tag & 0x7n);
        if (wireType === 1) {
            if (pos + 8 > buf.length)
                break;
            if (fieldNumber >= 1 && fieldNumber <= 5)
                ms[fieldNumber] = buf.readDoubleLE(pos);
            pos += 8;
        }
        else if (wireType === WT_VARINT) {
            pos = decodeVarint(buf, pos)[1];
        }
        else if (wireType === WT_LEN) {
            const [len, afterLength] = decodeVarint(buf, pos);
            pos = afterLength + checkedLen(len, afterLength, buf);
        }
        else if (wireType === 5) {
            pos += 4;
        }
        else {
            break;
        }
    }
    return {
        serverFirstTokenMs: ms[1],
        preStreamSetupMs: ms[2],
        waitForFirstEventMs: ms[3],
        providerTtftMs: ms[4],
        slowPoolWaitMs: ms[5],
    };
}
/**
 * Handle a top-level AgentServerMessage.ttft_breakdown field: returns true when
 * `top` was the breakdown (pushed onto `out` unless malformed), so the caller skips it.
 */
export function pushTtftBreakdown(top, out) {
    if (top.fieldNumber !== ASM_TTFT_BREAKDOWN || top.wireType !== WT_LEN)
        return false;
    const breakdown = safely(() => decodeTtftBreakdown(top.bytes));
    if (breakdown)
        out.push({ kind: "ttft_breakdown", ...breakdown });
    return true;
}
