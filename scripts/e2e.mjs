import { createRequire } from "node:module"; const { chromium, devices } = createRequire(import.meta.url)("playwright");
// End-to-end run against a local `next start` on :3000 with ADMIN_PASSWORD=woof.
// Usage: node scripts/e2e.mjs <output-dir>   (screenshots go to <output-dir>/shots)
// Truncate the tables first: psql -c "truncate tags, sightings, dogs, photos restart identity cascade"
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";
const S = process.argv[2] ?? "/tmp/pai-e2e";
mkdirSync(S + "/shots", { recursive: true });
const DOG = fileURLToPath(new URL("./test-dog.jpg", import.meta.url));
const B = "http://localhost:3000";
const browser = await chromium.launch();
const log = (...a) => console.log(...a);

// Volunteer phone
const vol = await browser.newContext({ ...devices["iPhone 13"], geolocation: { latitude: 19.3592, longitude: 98.4421 }, permissions: ["geolocation"] });
const p = await vol.newPage();
p.on("pageerror", (e) => log("PAGEERROR", e.message));
await p.goto(B + "/admin");
log("redirected to", p.url());
await p.fill("input[name=password]", "nope"); await p.click("button");
await p.waitForURL(/error=1/); log("bad pw ok");
await p.fill("input[name=password]", "woof"); await p.click("button");
await p.waitForURL(B + "/admin");
await p.goto(B + "/admin/tags");
await p.fill("input[name=name]", "test-batch");
await p.fill("input[name=count]", "12");
await p.click("text=Create batch");
await p.waitForURL(/batch\/test-batch/);
const codes = await p.$$eval("figcaption", (els) => els.map((e) => e.textContent.trim()));
log("codes", codes.length, codes.slice(0, 3));
await p.screenshot({ path: S + "/shots/batch.png", fullPage: true });
const csv = await (await p.request.get(B + "/admin/tags-csv/test-batch")).text();
log("csv:", csv.split("\n").slice(0, 2).join(" | "));

// Scan a blank tag (uppercase URL like the QR encodes)
await p.goto(B + "/D/" + codes[0]);
log("scan landed", p.url());
await p.click("text=Link this tag to a dog");
await p.click("text=Add new dog");
await p.waitForURL(/dogs\/new/);
await p.fill("input[name=name]", "Mango");
await p.selectOption("select[name=sex]", "female");
await p.fill("input[name=description]", "Tan, white chest, medium size");
await p.fill("input[name=area]", "Walking Street, by the night market");
await p.click("text=Set home location");
await p.waitForSelector("text=Home location set");
await p.check("input[name=sterilized]");
await p.fill("input[name=sterilizedOn]", "2026-02-14");
await p.fill("input[name=rabiesVaccinatedOn]", "2026-06-01");
await p.fill("input[name=caretakerName]", "Khun Noi, noodle shop");
await p.fill("input[name=caretakerLine]", "noinoodles");
await p.fill("textarea[name=publicNotes]", "Loves chicken. Sleeps outside the 7-Eleven.");
await p.setInputFiles("input[type=file]:not([name])", DOG);
await p.waitForSelector("label img");
await p.click("button:has-text('Add dog')");
await p.waitForURL(/dogs\/\d+\?saved=1/);
const dogUrl = p.url().split("?")[0];
log("dog created", dogUrl);
// second dog without tag, to test linking an existing dog
await p.goto(B + "/admin/dogs/new");
await p.fill("input[name=name]", "Lucky"); await p.fill("input[name=area]", "Pai bridge");
await p.click("button:has-text('Add dog')"); await p.waitForURL(/saved=1/);
await p.goto(B + "/admin/tags/" + codes[1].toLowerCase());
await p.selectOption("select[name=dogId]", { label: "Lucky • Pai bridge" });
await p.click("text=Link tag"); await p.waitForURL(/saved=1/);
log("lucky tag linked:", await p.isVisible(`text=${codes[1]}`));

// Tourist / local, Thai phone, not logged in
const pub = await browser.newContext({ ...devices["iPhone 13"], locale: "th-TH", extraHTTPHeaders: { "accept-language": "th-TH,th;q=0.9" }, geolocation: { latitude: 19.3611, longitude: 98.4398 }, permissions: ["geolocation"] });
const q = await pub.newPage();
q.on("pageerror", (e) => log("PAGEERROR", e.message));
await q.goto(B + "/D/" + codes[0]);
await q.waitForLoadState("networkidle");
await q.screenshot({ path: S + "/shots/public-th.png", fullPage: true });
log("thai title present:", await q.isVisible("text=หมาชุมชน"));
await q.click("button:has-text('EN')"); await q.waitForSelector("text=I saw this dog");
// Scan as sighting: share location from the card under the photo
await q.click("button:has-text('Share location')");
await q.waitForSelector("text=Added to the map");
log("scan shared");
await q.screenshot({ path: S + "/shots/public-en.png", fullPage: true });
log("edit link hidden for public:", !(await q.isVisible("text=Edit (volunteer)")));
await q.click("text=Get help");
await q.waitForSelector("text=Your location");
log("injured preselected:", await q.isChecked("input[value=injured]"));
await q.fill("textarea[name=note]", "Limping on back left leg near Pai Hospital");
await q.fill("input[name=contact]", "LINE: tourist123");
await q.setInputFiles("input[type=file]:not([name])", DOG);
await q.waitForSelector("label img");
await q.screenshot({ path: S + "/shots/report.png" });
await q.click("button:has-text('Send report')");
await q.waitForSelector("text=Report sent");
log("report sent");
// Add a new dog (no collar)
await q.goto(B + "/add");
await q.setInputFiles("input[type=file]:not([name])", DOG);
await q.waitForSelector("label img");
await q.fill("textarea[name=note]", "Black, white paws, near the hospital");
await q.fill("input[name=contact]", "LINE @mai");
await q.waitForSelector("text=Your location");
await q.screenshot({ path: S + "/shots/add-dog.png", fullPage: true });
await q.click("button:has-text('Add dog')");
await q.waitForSelector("text=Dog added");
log("new dog reported");
// Browse and look up
await q.goto(B + "/dogs"); await q.waitForLoadState("networkidle");
log("browse shows Mango:", await q.isVisible("text=Mango"));
await q.screenshot({ path: S + "/shots/browse.png", fullPage: true });
await q.goto(B + "/lookup");
await q.fill("input[name=code]", codes[0].toLowerCase()); await q.click("button:has-text('Find dog')");
await q.waitForURL(new RegExp("/d/" + codes[0], "i")); log("lookup ok");
// Unauthed admin access
const r = await q.request.get(B + "/admin/tags-csv/test-batch"); log("csv unauthed status", r.status());
await q.goto(B + "/admin"); log("public /admin ->", q.url());
await q.goto(B + "/d/ZZZZZ"); log("unknown code 404 text:", await q.isVisible("text=couldn't find"));

// Volunteer sees report
await p.goto(B + "/admin");
await p.waitForLoadState("networkidle");
await p.waitForTimeout(800);
log("inbox shows report:", await p.isVisible("text=Limping on back left leg"));
await p.screenshot({ path: S + "/shots/admin-home.png", fullPage: true });
log("inbox shows new dog:", await p.isVisible("text=No collar"));
await p.click("button:has-text('Mark done')");
await p.waitForTimeout(800);
log("report cleared:", !(await p.isVisible("text=Limping on back left leg")));
await p.click("a:has-text('Add dog')");
await p.waitForURL(/dogs\/new\?report=/);
await p.fill("input[name=name]", "Khao");
await p.screenshot({ path: S + "/shots/admin-new-from-report.png", fullPage: true });
await p.click("button:has-text('Add dog')");
await p.waitForURL(/dogs\/\d+\?saved=1/);
log("dog from report:", await p.isVisible("img[alt=Khao]"));
await p.goto(B + "/admin"); await p.waitForTimeout(500);
log("inbox cleared:", !(await p.isVisible("text=Reports to check")));
await p.goto(dogUrl);
await p.waitForLoadState("networkidle"); await p.waitForTimeout(800);
await p.screenshot({ path: S + "/shots/admin-dog.png", fullPage: false });
log("scan in history:", await p.isVisible("text=Tag scan"));
await p.goto(B + "/admin/tags/" + codes[2]); await p.waitForLoadState("networkidle");
await p.screenshot({ path: S + "/shots/admin-tag.png", fullPage: true });
await p.goto(B + "/admin/tags"); await p.screenshot({ path: S + "/shots/admin-tags.png", fullPage: true });
const dark = await browser.newContext({ ...devices["iPhone 13"], colorScheme: "dark", locale: "en-US" });
const d = await dark.newPage();
await d.goto(B + "/D/" + codes[0]); await d.waitForLoadState("networkidle");
await d.screenshot({ path: S + "/shots/dark-dog.png", fullPage: true });
await d.goto(B + "/"); await d.screenshot({ path: S + "/shots/dark-home.png" });
const dv = await dark.newPage(); await dv.goto(B + "/admin/login"); await dv.screenshot({ path: S + "/shots/dark-login.png" });
const pl = await vol.newPage(); await pl.goto(B + "/"); await pl.screenshot({ path: S + "/shots/home.png" });
await q.goto(B + "/D/" + codes[0]); await q.waitForLoadState("networkidle");
await q.screenshot({ path: S + "/shots/public-viewport.png" });
await p.goto(dogUrl + "?saved=1"); await p.waitForLoadState("networkidle"); await p.waitForTimeout(600);
await p.screenshot({ path: S + "/shots/admin-dog-top.png" });
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6)); await p.waitForTimeout(300);
await p.screenshot({ path: S + "/shots/admin-dog-form.png" });
await browser.close();
