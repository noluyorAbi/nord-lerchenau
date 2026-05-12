const CLUBSHOP_URL =
  "https://www.11teamsports.com/de-de/clubshop/sv-nord-muenchen-lerchenau/";
const ORIGIN = "https://www.11teamsports.com";

export type ClubshopProduct = {
  id: string;
  name: string;
  manufacturer: string | null;
  price: string | null;
  listPrice: string | null;
  discountPct: string | null;
  imageUrl: string | null;
  url: string;
};

const PRODUCT_BLOCK_RE =
  /<div class="card product-box box-image">([\s\S]*?)<input type="hidden"\s+name="product-name"/g;

const DATA_ATTR_RE = (name: string) =>
  new RegExp(`data-${name}="([^"]*)"`, "i");
const IMG_SRC_RE =
  /<img[^>]+class="product-image is-cover"[^>]*src="([^"]+)"|<img[^>]+src="([^"]+)"[^>]*class="product-image is-cover"/i;
const PRODUCT_LINK_RE =
  /<a\s+href="([^"]+)"[^>]*class="product-image-link is-cover"/i;
const PRICE_RE = /<span class="product-price[^"]*"[^>]*>\s*([0-9.,]+\s*€\*?)/i;
const LIST_PRICE_RE =
  /<span class="list-price-price">\s*([0-9.,]+\s*€\*?)(?:\s*UVP)?/i;
const DISCOUNT_RE = /<span>\s*(\d+)\s*&#37;\s*<\/span>/;

function pick(html: string, re: RegExp): string | null {
  const m = html.match(re);
  if (!m) return null;
  return (m[1] ?? m[2] ?? "").trim() || null;
}

function decode(s: string | null): string | null {
  if (!s) return s;
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#37;/g, "%")
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function absolutize(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${ORIGIN}${url}`;
  return url;
}

function parseProducts(html: string): ClubshopProduct[] {
  const out: ClubshopProduct[] = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(PRODUCT_BLOCK_RE)) {
    const block = match[1];
    const id = pick(block, DATA_ATTR_RE("product-id")) ?? `idx-${out.length}`;
    if (seen.has(id)) continue;
    const name = decode(pick(block, DATA_ATTR_RE("product-name")));
    const manufacturer = decode(pick(block, DATA_ATTR_RE("manufacturer-name")));
    const imageRaw = pick(block, IMG_SRC_RE);
    const linkRaw = pick(block, PRODUCT_LINK_RE);
    const price = decode(pick(block, PRICE_RE));
    const listPrice = decode(pick(block, LIST_PRICE_RE));
    const discountPct = pick(block, DISCOUNT_RE);

    if (!name || !linkRaw) continue;

    seen.add(id);
    out.push({
      id,
      name,
      manufacturer,
      price,
      listPrice,
      discountPct,
      imageUrl: absolutize(imageRaw),
      url: absolutize(linkRaw) ?? linkRaw,
    });
  }
  return out;
}

async function fetchViaFirecrawl(apiKey: string): Promise<string> {
  const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: CLUBSHOP_URL,
      formats: ["html"],
      onlyMainContent: false,
      waitFor: 1500,
    }),
    next: { revalidate: 600 },
  });
  if (!res.ok) {
    throw new Error(`firecrawl HTTP ${res.status}`);
  }
  const data = (await res.json()) as {
    success?: boolean;
    data?: { html?: string; rawHtml?: string };
    error?: string;
  };
  const html = data?.data?.html ?? data?.data?.rawHtml ?? "";
  if (!html) {
    throw new Error(data?.error ?? "firecrawl empty html");
  }
  return html;
}

async function fetchDirect(): Promise<string> {
  const res = await fetch(CLUBSHOP_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "de-DE,de;q=0.9,en;q=0.8",
      Referer: "https://www.11teamsports.com/",
    },
    next: { revalidate: 600 },
  });
  if (!res.ok) {
    throw new Error(`direct HTTP ${res.status}`);
  }
  return res.text();
}

export async function fetchClubshopProducts(): Promise<{
  products: ClubshopProduct[];
  shopUrl: string;
  ok: boolean;
  reason?: string;
}> {
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  try {
    const html = firecrawlKey
      ? await fetchViaFirecrawl(firecrawlKey)
      : await fetchDirect();
    const products = parseProducts(html);
    if (products.length === 0) {
      return {
        products: [],
        shopUrl: CLUBSHOP_URL,
        ok: false,
        reason: firecrawlKey ? "firecrawl-parsed-zero" : "direct-parsed-zero",
      };
    }
    return { products, shopUrl: CLUBSHOP_URL, ok: true };
  } catch (err) {
    return {
      products: [],
      shopUrl: CLUBSHOP_URL,
      ok: false,
      reason: err instanceof Error ? err.message : "unknown",
    };
  }
}
