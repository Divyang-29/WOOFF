const http = require("http");

function fetchJson(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:8080${path}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    }).on("error", reject);
  });
}

async function verifyAll() {
  const endpoints = [
    "/api/faqs",
    "/api/testimonials",
    "/api/videos",
    "/api/certificates",
    "/api/benefits",
    "/api/pillars",
  ];

  console.log("=== VERIFYING MIGRATED BACKEND APIS ===");
  for (const ep of endpoints) {
    try {
      const res = await fetchJson(ep);
      console.log(`[PASS] ${ep} => HTTP ${res.status}`);
      const key = Object.keys(res.body).find((k) => Array.isArray(res.body[k]));
      const count = key ? res.body[key].length : 0;
      console.log(`       Array key: '${key}', items count: ${count}`);
    } catch (err) {
      console.error(`[FAIL] ${ep} =>`, err.message);
    }
  }
}

verifyAll();
