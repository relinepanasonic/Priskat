// Quick debug script - run with: node scripts/test_blog.js
// First set your env vars in .env.local

const https = require("https");
const http = require("http");

// Replace with your actual deployed URL
const SITE_URL = process.env.SITE_URL || "https://apps.priasejatika.my.id";
const CRON_SECRET = process.env.CRON_SECRET || "your_cron_secret_here";

const url = `${SITE_URL}/api/blog/generate`;
const protocol = url.startsWith("https") ? https : http;
const urlObj = new URL(url);

console.log(`\nCalling: ${url}`);
console.log(`With Authorization: Bearer ${CRON_SECRET.slice(0, 8)}...`);

const options = {
  hostname: urlObj.hostname,
  path: urlObj.pathname,
  method: "GET",
  headers: {
    Authorization: `Bearer ${CRON_SECRET}`,
  },
};

const req = protocol.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    console.log(`\nStatus: ${res.statusCode}`);
    try {
      const parsed = JSON.parse(body);
      console.log("Response:", JSON.stringify(parsed, null, 2));
    } catch {
      console.log("Raw response:", body.slice(0, 2000));
    }
  });
});

req.on("error", (e) => console.error("Request error:", e.message));
req.end();

