import { chromium } from "playwright";

const outDir = "C:\\Users\\Blade\\AppData\\Local\\Temp\\claude\\c--Users-Blade-Documents-GitHub-paradise-tour\\c2131ff2-356c-48f1-9d01-87b9023e28a0\\scratchpad";
const BASE = "http://localhost:8080";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", (msg) => { if (msg.type() === "error") errors.push(`[console] ${msg.text()}`); });
page.on("pageerror", (err) => errors.push(`[pageerror] ${String(err)}`));

// Mock tour_extras response since the migration hasn't been run on the live DB yet
const FAKE_EXTRAS = [
  { id: "extra-6", tour_id: "4", name: "Pasamontañas de protección", description: "Protección facial para la tirolesa", price: 6, created_at: "2025-01-01" },
  { id: "extra-7", tour_id: "4", name: "Pañuelo/buff multiusos", description: "Protección para cuello y rostro", price: 5, created_at: "2025-01-01" },
  { id: "extra-8", tour_id: "4", name: "Guantes de seguridad", description: "Mejor agarre en tirolesas y rappel", price: 7, created_at: "2025-01-01" },
];
await page.route("**/rest/v1/tour_extras*", (route) => {
  route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(FAKE_EXTRAS) });
});

// 1. Navbar
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}\\nav-1-home.png` });

await page.getByRole("button", { name: /abrir menú/i }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${outDir}\\nav-2-menu-open.png` });
await page.keyboard.press("Escape");

// 2. Nosotros / Contacto
await page.goto(BASE + "/nosotros", { waitUntil: "networkidle" });
console.log("NOSOTROS TITLE:", await page.title());
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}\\nav-3-nosotros.png` });

await page.goto(BASE + "/contacto", { waitUntil: "networkidle" });
console.log("CONTACTO TITLE:", await page.title());
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}\\nav-4-contacto.png` });

// 3. Tour detail with extras (mocked)
await page.goto(BASE + "/tour/4", { waitUntil: "networkidle" });
await page.waitForSelector("text=Accesorios y recomendaciones", { timeout: 10000 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}\\extras-1-before.png` });

// select date
await page.getByRole("button", { name: /Selecciona una fecha/i }).click();
await page.waitForTimeout(300);
await page.locator('button[name="day"]:not([disabled])').first().click();
await page.waitForTimeout(300);

// check first two extras
const extraLabels = page.locator("label", { hasText: "Pasamontañas" });
await extraLabels.first().click();
await page.waitForTimeout(200);
await page.locator("label", { hasText: "Pañuelo" }).first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${outDir}\\extras-2-selected.png` });

// add to cart
await page.getByRole("button", { name: /Agregar al Carrito/i }).click();
await page.waitForURL(/\/carrito/, { timeout: 10000 });
await page.waitForTimeout(600);
await page.screenshot({ path: `${outDir}\\extras-3-cart.png` });

await browser.close();
console.log("ERRORS:", JSON.stringify(errors, null, 2));
