import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
const SECURE_DIR_MODE = 448;
const SECURE_FILE_MODE = 384;
export function ensureSecureDir(dir) {
  mkdirSync(dir, { recursive: true, mode: SECURE_DIR_MODE });
  chmodSync(dir, SECURE_DIR_MODE);
}
export function writeSecureFile(path, data) {
  writeFileSync(path, data, { encoding: "utf8", mode: SECURE_FILE_MODE });
}
