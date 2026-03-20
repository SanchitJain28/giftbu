const fs = require("fs");

const raw = JSON.parse(
  fs.readFileSync("data.json", "utf8").replace(/^\uFEFF/, ""),
);
const entries = raw.Sheet1;

const map = {};
for (const entry of entries) {
  const pin = String(entry.Pincode).trim();
  const city = entry.District?.trim() || entry.City?.trim();
  if (pin && city && !map[pin]) {
    map[pin] = city;
  }
}

fs.writeFileSync("pincode-city.json", JSON.stringify(map));
console.log(`Done — ${Object.keys(map).length} pincodes`);
