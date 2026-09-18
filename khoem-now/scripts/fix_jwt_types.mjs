import { readFileSync, writeFileSync } from "fs";

const path = "src/server.ts";
const content = readFileSync(path, "utf8");

const old1 = `        {
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
        }`;
const count1 = content.split(old1).length - 1;
if (count1 !== 1) { console.error("ERROR: expected 1 (access), found " + count1); process.exit(1); }
const new1 = `        {
          expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"],
        }`;

const old2 = `        {
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
        }`;
const count2 = content.split(old2).length - 1;
if (count2 !== 1) { console.error("ERROR: expected 1 (refresh), found " + count2); process.exit(1); }
const new2 = `        {
          expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
        }`;

let updated = content.replace(old1, new1);
updated = updated.replace(old2, new2);
writeFileSync(path, updated, "utf8");
console.log("Fixed jwt.sign() expiresIn type mismatches on both accessToken and refreshToken.");
