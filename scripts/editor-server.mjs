import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { writeFile, mkdir, stat, readFile as readText } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const contentPath = resolve(root, "content/reel.json");
const editorPath = resolve(root, "public/editor.html");
const videoPath = resolve(root, "out/preview.mp4");
const port = Number(process.env.PORT || 3000);
let renderState = { running: false, success: false, message: "هنوز رندری اجرا نشده است." };

const send = (res, status, body, type = "application/json; charset=utf-8") => {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(type.startsWith("application/json") ? JSON.stringify(body) : body);
};

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && (req.url === "/" || req.url === "/editor")) {
      return send(res, 200, await readText(editorPath), "text/html; charset=utf-8");
    }
    if (req.method === "POST" && req.url === "/api/image") {
      let raw = "";
      for await (const chunk of req) {
        raw += chunk.toString();
        if (raw.length > 12_000_000) return send(res, 413, { error: "حجم تصویر بیش از حد مجاز است؛ تصویر کوچک‌تری انتخاب کن." });
      }
      const data = JSON.parse(raw);
      if (typeof data.dataUrl !== "string" || !data.dataUrl.startsWith("data:image/")) return send(res, 400, { error: "فایل انتخاب‌شده تصویر معتبر نیست." });
      const match = data.dataUrl.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
      if (!match) return send(res, 400, { error: "فقط تصویرهای JPG، PNG یا WEBP پشتیبانی می‌شوند." });
      const image = Buffer.from(match[2], "base64");
      if (!image.length || image.length > 8 * 1024 * 1024) return send(res, 413, { error: "حجم تصویر باید کمتر از ۸ مگابایت باشد." });
      const extension = match[1] === "jpeg" ? "jpg" : match[1];
      const imagesDir = resolve(root, "public/images");
      await mkdir(imagesDir, { recursive: true });
      const filename = "scene-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + extension;
      await writeFile(resolve(imagesDir, filename), image);
      return send(res, 201, { ok: true, imageFile: "images/" + filename, message: "تصویر با موفقیت بارگذاری شد." });
    }
    if (req.method === "POST" && req.url === "/api/image/search") {
      let raw = "";
      for await (const chunk of req) { raw += chunk.toString(); if (raw.length > 20_000) return send(res, 413, { error: "عبارت جست‌وجو بیش از حد طولانی است." }); }
      const data = JSON.parse(raw);
      const query = typeof data.query === "string" ? data.query.trim() : "";
      if (query.length < 3 || query.length > 180) return send(res, 400, { error: "برای جست‌وجوی تصویر، عبارت انگلیسی ۳ تا ۱۸۰ حرفی وارد کن." });
      const api = new URL("https://commons.wikimedia.org/w/api.php");
      api.search = new URLSearchParams({ action: "query", generator: "search", gsrsearch: query + " filetype:bitmap", gsrnamespace: "6", gsrlimit: "10", prop: "imageinfo", iiprop: "url|mime|extmetadata", iiurlwidth: "1200", format: "json" }).toString();
      const searchResponse = await fetch(api, { headers: { "User-Agent": "HistoricPhilosophyReelBuilder/1.0 (educational project)" } });
      if (!searchResponse.ok) throw new Error("جست‌وجو در Wikimedia Commons ناموفق بود.");
      const searchData = await searchResponse.json();
      const pages = Object.values(searchData.query?.pages || {});
      const candidate = pages.find(page => page.imageinfo?.[0]?.thumburl && page.imageinfo[0].mime?.startsWith("image/"));
      if (!candidate) return send(res, 404, { error: "تصویر مناسبی پیدا نشد؛ عبارت انگلیسی دقیق‌تری امتحان کن." });
      const info = candidate.imageinfo[0];
      const imageUrl = new URL(info.thumburl);
      if (imageUrl.hostname !== "upload.wikimedia.org" || !imageUrl.pathname.startsWith("/wikipedia/commons/")) return send(res, 400, { error: "منبع تصویر قابل‌اعتماد نیست." });
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) throw new Error("دریافت فایل تصویر ناموفق بود.");
      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      if (!imageBuffer.length || imageBuffer.length > 8 * 1024 * 1024) return send(res, 413, { error: "تصویر آرشیوی بیش از ۸ مگابایت است." });
      const contentType = imageResponse.headers.get("content-type") || "";
      const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
      const imagesDir = resolve(root, "public/images");
      await mkdir(imagesDir, { recursive: true });
      const filename = "commons-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) + "." + extension;
      const imageFile = "images/" + filename;
      await writeFile(resolve(imagesDir, filename), imageBuffer);
      const meta = info.extmetadata || {};
      const clean = value => String(value?.value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      const credit = [clean(meta.Artist), clean(meta.LicenseShortName), clean(meta.Credit)].filter(Boolean).join(" | ");
      const license = { title: candidate.title, source: info.descriptionurl, artist: clean(meta.Artist), license: clean(meta.LicenseShortName), usageTerms: clean(meta.UsageTerms), credit, downloadedAt: new Date().toISOString() };
      await writeFile(resolve(imagesDir, filename + ".license.json"), JSON.stringify(license, null, 2) + "\n", "utf8");
      return send(res, 201, { ok: true, imageFile, credit: credit || "منبع: Wikimedia Commons؛ شرایط استفاده را در صفحه منبع بررسی کن.", source: info.descriptionurl, license: license.license });
    }
    if (req.method === "GET" && req.url === "/api/content") {
      return send(res, 200, JSON.parse(await readText(contentPath, "utf8")));
    }
    if (req.method === "POST" && req.url === "/api/content") {
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 200_000) return send(res, 413, { error: "حجم اطلاعات بیش از حد مجاز است." });
      }
      const data = JSON.parse(raw);
      if (!data || typeof data.title !== "string" || typeof data.hook !== "string" ||
          typeof data.handle !== "string" || !Array.isArray(data.scenes) || data.scenes.length === 0) {
        return send(res, 400, { error: "عنوان، هوک، آیدی و حداقل یک صحنه لازم است." });
      }
      for (const [i, scene] of data.scenes.entries()) {
        if (typeof scene.text !== "string" || !scene.text.trim() ||
            !Number.isFinite(scene.start) || !Number.isFinite(scene.end) ||
            scene.start < 7 || scene.end > 65 || scene.end <= scene.start) {
          return send(res, 400, { error: `اطلاعات صحنه ${i + 1} معتبر نیست. زمان باید بین ثانیه ۷ تا ۶۵ باشد.` });
        }
        if (scene.imageFile !== undefined && typeof scene.imageFile !== "string") {
          return send(res, 400, { error: `مسیر تصویر صحنه ${i + 1} معتبر نیست.` });
        }
      }
      await writeFile(contentPath, JSON.stringify(data, null, 2) + "\n", "utf8");
      return send(res, 200, { ok: true, message: "محتوای ریلز در پروژه ذخیره شد." });
    }
    if (req.method === "POST" && req.url === "/api/render") {
      if (renderState.running) return send(res, 409, { error: "رندر دیگری در حال اجراست." });
      renderState = { running: true, success: false, message: "در حال آماده‌سازی رندر..." };
      await mkdir(resolve(root, "out"), { recursive: true });
      const child = spawn("npm", ["run", "render:preview"], { cwd: root, env: process.env });
      let output = "";
      child.stdout.on("data", chunk => { output = (output + chunk.toString()).slice(-5000); });
      child.stderr.on("data", chunk => { output = (output + chunk.toString()).slice(-5000); });
      child.on("error", error => { renderState = { running: false, success: false, message: error.message }; });
      child.on("close", code => {
        renderState = {
          running: false,
          success: code === 0,
          message: code === 0 ? "رندر با موفقیت تمام شد." : "رندر ناموفق بود. خروجی ترمینال را بررسی کن.",
          details: output.slice(-1800),
        };
      });
      return send(res, 202, { ok: true, message: "فرآیند رندر شروع شد." });
    }
    if (req.method === "GET" && req.url === "/api/render-status") {
      return send(res, 200, renderState);
    }
    if (req.method === "GET" && req.url === "/preview.mp4") {
      const info = await stat(videoPath);
      res.writeHead(200, {
        "Content-Type": "video/mp4",
        "Content-Length": info.size,
        "Content-Disposition": 'inline; filename="historic-philosophy-preview.mp4"',
        "Cache-Control": "no-store",
      });
      return createReadStream(videoPath).pipe(res);
    }
    return send(res, 404, { error: "مسیر پیدا نشد." });
  } catch (error) {
    return send(res, 500, { error: error instanceof Error ? error.message : "خطای ناشناخته" });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Historic Philosophy Editor is running on port ${port}`);
});
