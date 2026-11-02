"use strict";
/* =====================================================================
   THIỀN ĐƯỜNG TỊNH TÂM — BRIDGE NỐI FACEBOOK LIVE
   ---------------------------------------------------------------------
   Bản song sinh của bridge TikTok (thư mục bridge/), cho buổi live
   trên Facebook trong lúc kênh TikTok chưa đủ 1.000 follower:
   1) Phục vụ tĩnh thư mục dự án (trang index-real.html) qua HTTP
      → mở http://localhost:<PORT> (mặc định 8090, tránh trùng 8080
      của bridge TikTok để hai bridge chạy song song được).
   2) Mở WebSocket nội bộ tại /live, đẩy sự kiện xuống trang web
      ĐÚNG ĐỊNH DẠNG của bridge TikTok (chat / gift / join / status)
      → trang không phải sửa một dòng nào.
   3) Đọc sự kiện Facebook LIVE qua Graph API chính thống:
      - Tìm video đang LIVE của Trang:
        GET /{page-id}/live_videos (Page Access Token).
      - Nhận bình luận thời gian thực qua luồng streaming:
        GET https://streaming-graph.facebook.com/{live-id}/live_comments
        (server-sent events); tự rơi xuống POLLING mỗi FB_POLL_MS
        khi luồng streaming lỗi, và tự tìm lại video live mới.
      - Người xem bình luận lần đầu → phát thêm sự kiện "join"
        (Facebook không có sự kiện "vào phòng" như TikTok).
      - Quà của Facebook là STARS: bình luận gắn Stars (có trường
        attachment nhắc tới stars) được ánh xạ thành sự kiện gift
        "Sao Facebook (Stars)" với coins = số sao đọc được.
        LƯU Ý: dữ kiện Stars qua API hạn chế hơn quà TikTok —
        đây là ánh xạ best-effort, đã ghi rõ trong HUONG-DAN.md.
   4) /tts được UỶ QUYỀN (proxy) sang bridge TikTok ở cổng 8080
      (nơi có worker TTS) — bridge này không chứa engine TTS riêng.
   5) Chế độ DEMO:  node server.js --demo
      → tự phát sự kiện giả lập kiểu Facebook, test toàn chuỗi
      không cần live thật và không cần token.

   Cấu hình: sao chép .env.example thành .env rồi điền
   FB_PAGE_ID + FB_PAGE_ACCESS_TOKEN (xem HUONG-DAN.md mục 2).
   Điều kiện live Facebook: tài khoản ≥ 60 ngày tuổi và Trang /
   hồ sơ chuyên nghiệp ≥ 100 người theo dõi.
   ===================================================================== */

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { WebSocketServer, WebSocket } = require("ws");

/* ---------------- Nạp cấu hình từ file .env (KEY=VALUE) ---------------- */
function loadDotEnv(file) {
  const out = {};
  try {
    const text = fs.readFileSync(file, "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 0) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
      out[key] = val;
    }
  } catch (e) { /* chưa có .env — dùng mặc định/biến môi trường */ }
  return out;
}
const fileEnv = loadDotEnv(path.join(__dirname, ".env"));
const cfg = (k) => (process.env[k] !== undefined && process.env[k] !== "" ? process.env[k] : fileEnv[k]);

const PORT = parseInt(cfg("FB_PORT") || cfg("PORT") || "8090", 10) || 8090;
const PAGE_ID = (cfg("FB_PAGE_ID") || "").trim();
const PAGE_TOKEN = (cfg("FB_PAGE_ACCESS_TOKEN") || "").trim();
const GRAPH_VER = (cfg("FB_GRAPH_VERSION") || "v21.0").trim();
const POLL_MS = Math.max(1500, parseInt(cfg("FB_POLL_MS") || "2500", 10) || 2500);
const TTS_PROXY = (cfg("TTS_PROXY") || "http://127.0.0.1:8080").replace(/\/$/, "");
const DEMO_MODE = process.argv.includes("--demo");
const PROJECT_DIR = path.resolve(__dirname, "..");

function log(...args) { console.log("[" + new Date().toLocaleTimeString("vi-VN") + "]", ...args); }

/* ---------------- HTTP: phục vụ tĩnh thư mục dự án ---------------- */
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg",
  ".wav": "audio/wav", ".glb": "model/gltf-binary", ".gltf": "model/gltf+json",
  ".bin": "application/octet-stream", ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon"
};

let fbState = { connected: false, liveVideoId: null, via: null };

const server = http.createServer((req, res) => {
  let urlPath, urlObj;
  try { urlObj = new URL(req.url, "http://localhost"); urlPath = decodeURIComponent(urlObj.pathname); }
  catch (e) { res.writeHead(400); res.end("Bad request"); return; }

  if (urlPath === "/status") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      ok: true, mode: DEMO_MODE ? "demo" : "live", platform: "facebook",
      pageId: PAGE_ID || null, fbConnected: fbState.connected,
      liveVideoId: fbState.liveVideoId, via: fbState.via, webClients: wss.clients.size
    }));
    return;
  }

  /* Giọng đọc: uỷ quyền sang bridge TikTok (cổng 8080) nơi có worker TTS.
     Lỗi → 503 để trang tự rơi xuống giọng trình duyệt. */
  if (urlPath === "/tts") {
    if (req.method !== "GET") { res.writeHead(405); res.end("Method Not Allowed"); return; }
    const target = TTS_PROXY + "/tts?text=" + encodeURIComponent(urlObj.searchParams.get("text") || "");
    http.get(target, (up) => {
      if (up.statusCode !== 200) { up.resume(); res.writeHead(503); res.end("TTS unavailable"); return; }
      res.writeHead(200, { "Content-Type": up.headers["content-type"] || "audio/wav", "Cache-Control": "no-cache" });
      up.pipe(res);
    }).on("error", () => { if (!res.headersSent) res.writeHead(503); res.end("TTS unavailable"); });
    return;
  }

  if (urlPath === "/") urlPath = "/index-real.html";   // bản chính của thiền đường
  const filePath = path.normalize(path.join(PROJECT_DIR, urlPath));
  const rel = path.relative(PROJECT_DIR, filePath);
  const topDir = rel.split(path.sep)[0];
  if (rel.startsWith("..") || topDir === "bridge" || topDir === "bridge-facebook" || path.basename(filePath).startsWith(".")) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
    fs.createReadStream(filePath).pipe(res);
  });
});

/* ---------------- WebSocket nội bộ: đẩy sự kiện xuống trang web ---------------- */
const wss = new WebSocketServer({ server, path: "/live" });
function broadcast(ev) {
  const msg = JSON.stringify(ev);
  for (const client of wss.clients) if (client.readyState === WebSocket.OPEN) client.send(msg);
}
wss.on("connection", (ws) => {
  log("🌐 Một trang web vừa kết nối nhận sự kiện (tổng:", wss.clients.size, "trang).");
  ws.send(JSON.stringify({ type: "status", mode: DEMO_MODE ? "demo" : "live", username: PAGE_ID || null, connected: fbState.connected }));
  ws.on("close", () => log("🌐 Một trang web đã ngắt kết nối nhận sự kiện."));
});

/* ---------------- Chuẩn hoá sự kiện Facebook → sự kiện của thiền đường ---------------- */
const seenComments = new Set();
const seenUsers = new Set();
function remember(id) {
  seenComments.add(id);
  if (seenComments.size > 5000) { const it = seenComments.values(); for (let i = 0; i < 2000; i++) seenComments.delete(it.next().value); }
}

function starCount(item) {
  // Stars qua live_comments: khi có, attachment mang thông tin sao.
  const att = item.attachment || {};
  const hay = [att.type, att.title, att.description, att.media && att.media.id].filter(Boolean).join(" ");
  if (!/star/i.test(hay)) return 0;
  const m = hay.match(/(\d[\d.,]*)/);
  return m ? parseInt(m[1].replace(/[.,]/g, ""), 10) : 10;   // không đọc được số → 1 lượt 10 sao
}

function onFbComment(item) {
  if (!item || !item.id || seenComments.has(item.id)) return;
  remember(item.id);
  const from = item.from || {};
  const name = from.name || "Khách Facebook";
  const uniqueId = "fb_" + (from.id || name);
  const avatar = (from.picture && from.picture.data && from.picture.data.url) || "";
  if (!seenUsers.has(uniqueId)) {
    seenUsers.add(uniqueId);
    broadcast({ type: "join", name: name, uniqueId: uniqueId, avatar: avatar });
    log("👥", name, "xuất hiện lần đầu qua Facebook → vào khu đứng.");
  }
  const stars = starCount(item);
  if (stars > 0) {
    const ev = { type: "gift", name: name, uniqueId: uniqueId, giftName: "Sao Facebook (Stars)", giftId: 9101, count: 1, coins: stars, avatar: avatar };
    log("⭐", name, "tặng", stars, "Stars");
    broadcast(ev);
    return;
  }
  const ev = { type: "chat", name: name, uniqueId: uniqueId, text: item.message || "", avatar: avatar };
  log("💬", ev.name + ":", ev.text);
  broadcast(ev);
}

/* ---------------- Gọi Graph API ---------------- */
function graphGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "ThienDuongBridge/1.0" } }, (r) => {
      let body = "";
      r.on("data", (c) => { body += c; });
      r.on("end", () => {
        try { resolve({ status: r.statusCode, json: JSON.parse(body) }); }
        catch (e) { reject(new Error("Graph API trả về không phải JSON (HTTP " + r.statusCode + ")")); }
      });
    }).on("error", reject);
  });
}

async function findLiveVideo() {
  const url = "https://graph.facebook.com/" + GRAPH_VER + "/" + encodeURIComponent(PAGE_ID) +
    "/live_videos?fields=id,status,broadcast_start_time&limit=5&access_token=" + encodeURIComponent(PAGE_TOKEN);
  const { status, json } = await graphGet(url);
  if (status !== 200 || !json.data) {
    throw new Error("Không liệt kê được live_videos (HTTP " + status + "): " + ((json.error && json.error.message) || "không rõ"));
  }
  const live = json.data.find((v) => v.status === "LIVE" || v.status === "LIVE_STAGING");
  return live ? live.id : null;
}

/* Luồng streaming (SSE) live_comments — đường chính. */
function streamComments(liveId, onFail) {
  const fields = "from{id,name,picture},message,created_time,attachment";
  const url = "https://streaming-graph.facebook.com/" + liveId + "/live_comments?access_token=" +
    encodeURIComponent(PAGE_TOKEN) + "&fields=" + encodeURIComponent(fields);
  const req = https.get(url, { headers: { "User-Agent": "ThienDuongBridge/1.0", Accept: "text/event-stream" } }, (r) => {
    if (r.statusCode !== 200) { r.resume(); onFail(new Error("Streaming HTTP " + r.statusCode)); return; }
    fbState.via = "stream";
    log("📡 Đang nhận bình luận qua luồng streaming của video live " + liveId);
    let buf = "";
    r.on("data", (chunk) => {
      buf += chunk.toString("utf8");
      let idx;
      while ((idx = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, idx).trim(); buf = buf.slice(idx + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try { onFbComment(JSON.parse(payload)); } catch (e) { /* dòng lỗi — bỏ qua */ }
      }
    });
    r.on("end", () => onFail(new Error("Luồng streaming kết thúc (live có thể đã tắt)")));
    r.on("error", onFail);
  });
  req.on("error", onFail);
  return req;
}

/* Polling live_comments — đường dự phòng. */
let pollTimer = null;
function pollComments(liveId) {
  const fields = "from{id,name,picture},message,created_time,attachment";
  const url = "https://graph.facebook.com/" + GRAPH_VER + "/" + liveId + "/live_comments?fields=" +
    encodeURIComponent(fields) + "&order=reverse_chronological&limit=25&access_token=" + encodeURIComponent(PAGE_TOKEN);
  fbState.via = "poll";
  const tick = async () => {
    try {
      const { status, json } = await graphGet(url);
      if (status === 200 && Array.isArray(json.data)) {
        [...json.data].reverse().forEach(onFbComment);
      }
    } catch (e) { /* lỗi tạm thời — lần poll sau thử lại */ }
    pollTimer = setTimeout(tick, POLL_MS);
  };
  tick();
}

/* ---------------- Vòng đời kết nối Facebook + tự nối lại ---------------- */
let stopped = false;
let retryMs = 5000;
let activeReq = null;

async function fbLoop() {
  if (stopped) return;
  if (!PAGE_ID || !PAGE_TOKEN) {
    log("⚠️  Chưa có FB_PAGE_ID / FB_PAGE_ACCESS_TOKEN trong bridge-facebook/.env → bridge chỉ phục vụ trang web, KHÔNG bắt được sự kiện Facebook.");
    log("    Xem HUONG-DAN.md mục 2 để lấy Page Access Token rồi chạy lại.");
    return;
  }
  try {
    const liveId = await findLiveVideo();
    if (!liveId) {
      fbState.connected = false;
      log("💤 Trang " + PAGE_ID + " hiện CHƯA live. Bridge thử tìm lại sau " + Math.round(retryMs / 1000) + " giây — cứ để bridge chạy, khi Trang bắt đầu live là bắt được sự kiện.");
      setTimeout(fbLoop, retryMs);
      return;
    }
    fbState = { connected: true, liveVideoId: String(liveId), via: "stream" };
    retryMs = 5000;
    log("✅ ĐÃ THẤY video live " + liveId + " của Trang. Đang chờ bình luận Facebook...");
    broadcast({ type: "status", mode: "live", username: PAGE_ID, connected: true });
    let failed = false;
    const onFail = (err) => {
      if (failed || stopped) return;
      failed = true;
      fbState.connected = false;
      log("⚠️  Mất luồng bình luận (" + err.message + "). Chuyển sang POLLING dự phòng; đồng thời vòng tìm live vẫn chạy.");
      broadcast({ type: "status", mode: "live", username: PAGE_ID, connected: false });
      // Dự phòng: polling trên cùng video + hẹn giờ tìm lại live từ đầu.
      if (pollTimer) clearTimeout(pollTimer);
      pollComments(String(liveId));
      setTimeout(() => { if (pollTimer) clearTimeout(pollTimer); fbLoop(); }, 60000);
    };
    activeReq = streamComments(String(liveId), onFail);
  } catch (err) {
    log("❌ Lỗi Graph API:", err.message);
    setTimeout(fbLoop, retryMs);
    retryMs = Math.min(retryMs * 2, 60000);
  }
}

/* ---------------- Chế độ DEMO: tự phát sự kiện giả lập kiểu Facebook ---------------- */
const DEMO_NAMES = ["Minh Tâm", "An Nhiên", "Quang Huy", "Hoàng Nam", "Bảo Ngọc", "Diệu Linh", "Tuệ Minh", "Thu Hà",
  "Ngọc Lan", "Đức Anh", "Hải Đăng", "Mai Anh", "Phương Thảo", "Trung Kiên", "Hồng Nhung", "Văn Đức"];
const DEMO_TEXTS = ["Nam mô A Di Đà Phật 🙏", "Cho con vào thiền với ạ", "nam", "nữ", "sư",
  "A Di Đà Phật", "Ngồi thiền cho tâm an", "Xin một chỗ ngồi thiền", "Tâm an vạn sự an", "Con xin vào thiền đường"];
const DEMO_STARS = [10, 50, 100, 250];
let demoIdx = 0;
function startDemo() {
  log("🎭 CHẾ ĐỘ DEMO (FACEBOOK): bridge tự phát sự kiện giả lập mỗi ~2,2 giây (bình luận + Stars). Không cần live thật, không cần token.");
  const tick = () => {
    if (stopped) return;
    const i = demoIdx % DEMO_NAMES.length;
    const name = DEMO_NAMES[i], uniqueId = "fb_demo_" + i;
    if (!seenUsers.has(uniqueId)) { seenUsers.add(uniqueId); broadcast({ type: "join", name: name, uniqueId: uniqueId, avatar: "", demo: true }); }
    if (demoIdx % 4 === 3) {
      const stars = DEMO_STARS[Math.floor(Math.random() * DEMO_STARS.length)];
      log("⭐ [demo]", name, "tặng", stars, "Stars");
      broadcast({ type: "gift", name: name, uniqueId: uniqueId, giftName: "Sao Facebook (Stars)", giftId: 9101, count: 1, coins: stars, avatar: "", demo: true });
    } else {
      const text = DEMO_TEXTS[demoIdx % DEMO_TEXTS.length];
      log("💬 [demo]", name + ":", text);
      broadcast({ type: "chat", name: name, uniqueId: uniqueId, text: text, avatar: "", demo: true });
    }
    demoIdx++;
    setTimeout(tick, 1800 + Math.random() * 1200);
  };
  setTimeout(tick, 800);
}

/* ---------------- Khởi động ---------------- */
server.listen(PORT, () => {
  log("🪷 THIỀN ĐƯỜNG TỊNH TÂM — BRIDGE FACEBOOK đã chạy.");
  log("   Mở trang thiền đường:  http://localhost:" + PORT + "/");
  log("   Trạng thái bridge:     http://localhost:" + PORT + "/status");
  if (DEMO_MODE) startDemo();
  else fbLoop();
});

process.on("SIGINT", () => {
  stopped = true;
  log("👋 Đang tắt bridge Facebook...");
  try { if (activeReq) activeReq.destroy(); } catch (e) {}
  if (pollTimer) clearTimeout(pollTimer);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500);
});
