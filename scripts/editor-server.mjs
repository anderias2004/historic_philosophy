import { createServer } from "node:http";
import { readFile, writeFile, mkdir, stat, createReadStream } from "node:fs";
import { readFile as readText } from "node:fs/promises";
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
