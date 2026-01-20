import fs from "fs";
import path from "path";

const DATA_PATH = path.join(
  process.cwd(),
  "data",
  "charmed_dark_products_ready.csv"
);

const toSlug = (value) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parsePrice = (value) => {
  if (!value) return null;
  const normalized = value.toString().replace(/[^0-9.]/g, "");
  if (!normalized) return null;
  return Number.parseFloat(normalized);
};

const parseCsv = (content) => {
  const rows = [];
  let current = "";
  let inQuotes = false;
  let row = [];

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"' && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length || row.length) {
    row.push(current);
    rows.push(row);
  }

  return rows;
};

export const getProducts = () => {
  const csv = fs.readFileSync(DATA_PATH, "utf8");
  const [headerRow, ...dataRows] = parseCsv(csv);
  const headers = headerRow.map((header) => header.trim());

  return dataRows
    .filter((row) => row.length && row.some((cell) => cell.trim() !== ""))
    .map((row, index) => {
      const record = headers.reduce((acc, header, idx) => {
        acc[header] = row[idx] ? row[idx].trim() : "";
        return acc;
      }, {});

      const price = parsePrice(record.Price);
      const salePrice = parsePrice(record["Sale Price"]);
      const qty = Number.parseInt(record.QTY || "0", 10);
      const hidden = String(record.Hidden || "").toLowerCase() === "true";
      const imageUrls = record["Image URL"]
        ? record["Image URL"].split(";").map((url) => url.trim()).filter(Boolean)
        : [];

      return {
        index,
        sku: record.SKU,
        name: record.Name,
        slug: toSlug(record.Name || ""),
        category: record["Suggested Category"],
        price,
        salePrice,
        currency: record.Currency || "USD",
        qty,
        hidden,
        imageUrls,
        description: record.Description || "",
      };
    });
};

export const getProductBySlug = (slug) => {
  const products = getProducts();
  return products.find((product) => product.slug === slug);
};
