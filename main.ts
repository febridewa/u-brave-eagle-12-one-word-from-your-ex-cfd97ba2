// One Word From Your Ex — entry program.
// Writes exactly one word to /output/entry.txt: the word an ex would use
// to describe the entrant. The word is "unread": every message left
// unread, every apology never even opened. It stings because it is true,
// it lands instantly, and anyone who has ever been left on read knows it.
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

const WORD = "unread";
const OUT = "/output/entry.txt";
const MAX_CHARS = 24;

// Gate self-check, mirroring the sealed scorer: UTF-8 text, 1-24 chars,
// not only whitespace, and exactly one word (no spaces, no punctuation).
function gateCheck(text: string): string[] {
  const problems: string[] = [];
  if (text.length < 1 || text.length > MAX_CHARS) {
    problems.push(`length ${text.length} outside 1-${MAX_CHARS}`);
  }
  if (text.trim().length === 0) problems.push("only whitespace");
  if (/\s/.test(text)) problems.push("contains whitespace: not one word");
  if (!/^[A-Za-z]+$/.test(text)) problems.push("not a single plain word");
  return problems;
}

const problems = gateCheck(WORD);
if (problems.length > 0) {
  console.error(`gate failed for word ${JSON.stringify(WORD)}: ${problems.join("; ")}`);
  process.exit(1);
}

// Extra hardening: the file must hold exactly the word — no trailing
// newline, no BOM, no hidden bytes — and its UTF-8 byte length must equal
// its character length (plain ASCII word, so the size tie-break is minimal).
const byteLen = Buffer.byteLength(WORD, "utf8");
if (byteLen !== WORD.length) {
  console.error(`gate failed: byte length ${byteLen} != char length ${WORD.length}`);
  process.exit(1);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, WORD, "utf8");

// Verify what was written, byte for byte.
const written = readFileSync(OUT, "utf8");
if (written !== WORD) {
  console.error(`verify failed: wrote ${JSON.stringify(WORD)}, read ${JSON.stringify(written)}`);
  process.exit(1);
}
if (written.endsWith("\n") || written.startsWith("\uFEFF")) {
  console.error("verify failed: entry carries a trailing newline or BOM");
  process.exit(1);
}
console.log(`wrote ${JSON.stringify(written)} (${written.length} chars) to ${OUT}`);
