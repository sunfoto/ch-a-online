"use strict";
/* =====================================================================
   THIỀN ĐƯỜNG TỊNH TÂM — BRIDGE NỐI TIKTOK LIVE THẬT
   ---------------------------------------------------------------------
   Việc bridge làm:
   1) Phục vụ tĩnh thư mục dự án (trang index.html) qua HTTP
      → mở http://localhost:<PORT> trên trình duyệt.
   2) Mở WebSocket nội bộ tại /live để đẩy sự kiện xuống trang web
      theo thời gian thực (trang tự ánh xạ: chat → handleComment,
      gift → handleGift).
   3) Kết nối tới kênh TikTok đang LIVE bằng thư viện mã mở
      tiktok-live-connector (WebSocket đã ký qua EulerStream) và
      chuyển tiếp sự kiện chat / gift / like / follow / join.
      Tự kết nối lại (reconnect, giãn cách tăng dần) khi rớt mạng.
   4) Chế độ DEMO:  node server.js --demo
      → tự phát sự kiện giả lập, test toàn chuỗi không cần live thật.

   Cấu hình: sao chép .env.example thành .env rồi điền
   TIKTOK_USERNAME (bắt buộc khi live thật), EULER_API_KEY (không
   bắt buộc), PORT (mặc định 8080).
   ===================================================================== */

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const readline = require("readline");
const { spawn } = require("child_process");
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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      out[key] = val;
    }
  } catch (e) { /* chưa có .env — dùng mặc định/biến môi trường */ }
  return out;
}
const fileEnv = loadDotEnv(path.join(__dirname, ".env"));
const cfg = (k) => (process.env[k] !== undefined && process.env[k] !== "" ? process.env[k] : fileEnv[k]);

const PORT = parseInt(cfg("PORT") || "8080", 10) || 8080;
const TIKTOK_USERNAME = (cfg("TIKTOK_USERNAME") || "").replace(/^@/, "").trim();
const EULER_API_KEY = (cfg("EULER_API_KEY") || "").trim();
const DEMO_MODE = process.argv.includes("--demo");
const PROJECT_DIR = path.resolve(__dirname, "..");

function log(...args) {
  console.log("[" + new Date().toLocaleTimeString("vi-VN") + "]", ...args);
}

/* ---------------- HTTP: phục vụ tĩnh thư mục dự án ---------------- */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".wav": "audio/wav",
  ".glb": "model/gltf-binary", ".gltf": "model/gltf+json", ".bin": "application/octet-stream",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon"
};

let tikTokState = { connected: false, roomId: null };

const server = http.createServer((req, res) => {
  let urlPath, urlObj;
  try { urlObj = new URL(req.url, "http://localhost"); urlPath = decodeURIComponent(urlObj.pathname); }
  catch (e) { res.writeHead(400); res.end("Bad request"); return; }

  if (urlPath === "/status") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({
      ok: true,
      mode: DEMO_MODE ? "demo" : "live",
      username: TIKTOK_USERNAME || null,
      tikTokConnected: tikTokState.connected,
      roomId: tikTokState.roomId,
      webClients: wss.clients.size,
      tts: { ready: ttsReady, engine: ttsEngine }   // ĐỢT 21
    }));
    return;
  }

  /* ĐỢT 21: GIỌNG ĐỌC — GET /tts?text=… → WAV do worker TTS local tổng hợp
     (cache theo nội dung). Lỗi/không có TTS → 503 để trang tự rơi xuống
     giọng trình duyệt. Chỉ GET, văn bản được lọc lại ở phía server. */
  if (urlPath === "/tts") {
    if (req.method !== "GET") { res.writeHead(405); res.end("Method Not Allowed"); return; }
    const text = ttsFilterText(urlObj.searchParams.get("text") || "");
    if (!text) { res.writeHead(400); res.end("Bad text"); return; }
    ttsSynthesize(text).then((file) => {
      res.writeHead(200, { "Content-Type": "audio/wav", "Cache-Control": "no-cache" });
      fs.createReadStream(file).pipe(res);
    }).catch((e) => {
      res.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("TTS unavailable: " + (e && e.message ? e.message : e));
    });
    return;
  }

  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.normalize(path.join(PROJECT_DIR, urlPath));
  // Chặn: không phục vụ ngoài thư mục dự án, không phục vụ thư mục bridge
  // (chứa .env và mã nguồn), không phục vụ file ẩn.
  const rel = path.relative(PROJECT_DIR, filePath);
  if (rel.startsWith("..") || rel.split(path.sep)[0] === "bridge" || path.basename(filePath).startsWith(".")) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, {
      "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

/* ---------------- WebSocket nội bộ: đẩy sự kiện xuống trang web ---------------- */
const wss = new WebSocketServer({ server, path: "/live" });

function broadcast(ev) {
  const msg = JSON.stringify(ev);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  }
}

wss.on("connection", (ws) => {
  log("🌐 Một trang web vừa kết nối nhận sự kiện (tổng:", wss.clients.size, "trang).");
  ws.send(JSON.stringify({
    type: "status",
    mode: DEMO_MODE ? "demo" : "live",
    username: TIKTOK_USERNAME || null,
    connected: tikTokState.connected
  }));
  ws.on("close", () => log("🌐 Một trang web đã ngắt kết nối nhận sự kiện."));
});

/* ---------------- Chuẩn hóa sự kiện TikTok → sự kiện của thiền đường ---------------- */
function evName(data) {
  const u = (data && data.user) || {};
  return u.nickname || u.uniqueId || "Ẩn danh";
}
function evUniqueId(data) {
  const u = (data && data.user) || {};
  return u.uniqueId || "";
}
function evAvatar(data) {
  const u = (data && data.user) || {};
  if (u.profilePictureUrl) return u.profilePictureUrl;
  const pp = u.profilePicture || u.avatarThumb || u.avatarMedium || {};
  const urls = pp.urls || pp.urlList || pp.url_list || [];
  return urls[0] || "";
}

function onChat(data) {
  const ev = { type: "chat", name: evName(data), uniqueId: evUniqueId(data), text: data.comment || "", avatar: evAvatar(data) };
  log("💬", ev.name + ":", ev.text);
  broadcast(ev);
}

function onGift(data) {
  // Quà "combo/streak" (giftType 1) phát nhiều sự kiện: chỉ xử lý sự kiện
  // kết thúc streak (repeatEnd = true) để cộng xu đúng tổng số lượng.
  const giftType = data.giftDetails && data.giftDetails.giftType;
  if (giftType === 1 && !data.repeatEnd) return;
  const count = data.repeatCount || 1;
  const ext = data.extendedGiftInfo || {};
  const perCoin = ext.diamond_count != null ? ext.diamond_count
    : ext.diamondCount != null ? ext.diamondCount
    : (data.giftDetails && (data.giftDetails.diamondCount != null ? data.giftDetails.diamondCount : data.giftDetails.diamond_count)) || 0;
  const ev = {
    type: "gift",
    name: evName(data),
    uniqueId: evUniqueId(data),
    giftName: (data.giftDetails && data.giftDetails.giftName) || ext.name || ("Quà #" + (data.giftId || "?")),
    giftId: data.giftId || null,
    count: count,
    coins: perCoin * count,   // tổng xu = giá 1 món × số lượng
    avatar: evAvatar(data)
  };
  log("🎁", ev.name, "tặng", ev.giftName, "×" + ev.count, "(" + ev.coins + " xu)");
  broadcast(ev);
}

function onLike(data) {
  broadcast({ type: "like", name: evName(data), likeCount: data.likeCount || 0, totalLikeCount: data.totalLikeCount || 0 });
}
function onFollow(data) {
  const ev = { type: "follow", name: evName(data), uniqueId: evUniqueId(data), avatar: evAvatar(data) };
  log("👋", ev.name, "vừa follow kênh.");
  broadcast(ev);
}
function onShare(data) {
  broadcast({ type: "share", name: evName(data) });
}
function onMember(data) {
  broadcast({ type: "join", name: evName(data), uniqueId: evUniqueId(data), avatar: evAvatar(data) });
}

/* ---------------- Kết nối TikTok LIVE + tự reconnect ---------------- */
let connection = null;
let reconnectTimer = null;
let backoffMs = 5000;
let stopped = false;

function scheduleReconnect(why) {
  if (stopped || reconnectTimer) return;
  log("🔁 " + why + " — thử kết nối lại sau " + Math.round(backoffMs / 1000) + " giây...");
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    backoffMs = Math.min(backoffMs * 2, 60000);
    startTikTok();
  }, backoffMs);
}

function startTikTok() {
  if (stopped) return;
  if (!TIKTOK_USERNAME) {
    log("⚠️  Chưa có TIKTOK_USERNAME trong file bridge/.env → bridge chỉ phục vụ trang web, KHÔNG bắt được sự kiện TikTok.");
    log("    Hãy sao chép .env.example thành .env, điền username kênh, rồi chạy lại.");
    return;
  }
  let lib;
  try {
    lib = require("tiktok-live-connector");
  } catch (e) {
    log("❌ Chưa cài được thư viện tiktok-live-connector. Chạy:  cd bridge && npm install");
    log("   Chi tiết lỗi:", e.message);
    return;
  }
  const { TikTokLiveConnection, WebcastEvent, ControlEvent } = lib;
  const options = {
    enableExtendedGiftInfo: true,   // để lấy tên + giá xu của quà
    processInitialData: false       // bỏ qua chat cũ lúc mới nối
  };
  if (EULER_API_KEY) {
    options.signApiKey = EULER_API_KEY;   // WebSocket đã ký qua EulerStream bằng key riêng
    log("🔑 Dùng API key EulerStream riêng để ký kết nối.");
  } else {
    log("🔓 Không có EULER_API_KEY — dùng chế độ ký mặc định của thư viện (máy chủ ký công cộng, có thể bị giới hạn tần suất).");
  }

  try { if (connection) connection.disconnect().catch(() => {}); } catch (e) {}
  connection = new TikTokLiveConnection(TIKTOK_USERNAME, options);

  connection.on(ControlEvent.CONNECTED, (state) => {
    tikTokState = { connected: true, roomId: state && state.roomId ? String(state.roomId) : null };
    backoffMs = 5000;
    log("✅ ĐÃ KẾT NỐI tới live của @" + TIKTOK_USERNAME + " (roomId " + tikTokState.roomId + "). Đang chờ comment/gift...");
    broadcast({ type: "status", mode: "live", username: TIKTOK_USERNAME, connected: true });
  });
  connection.on(ControlEvent.DISCONNECTED, (info) => {
    tikTokState.connected = false;
    log("⚠️  Mất kết nối TikTok" + (info && info.reason ? " (" + info.reason + ")" : "") + ".");
    broadcast({ type: "status", mode: "live", username: TIKTOK_USERNAME, connected: false });
    scheduleReconnect("Bị ngắt kết nối");
  });
  connection.on(ControlEvent.ERROR, (err) => {
    log("❌ Lỗi kết nối TikTok:", (err && err.message) || err);
  });
  connection.on(WebcastEvent.STREAM_END, () => {
    log("🛑 Kênh @" + TIKTOK_USERNAME + " đã kết thúc live. Bridge vẫn chạy và sẽ tự nối lại khi kênh live tiếp.");
  });
  connection.on(WebcastEvent.CHAT, onChat);
  connection.on(WebcastEvent.GIFT, onGift);
  connection.on(WebcastEvent.LIKE, onLike);
  connection.on(WebcastEvent.FOLLOW, onFollow);
  connection.on(WebcastEvent.SHARE, onShare);
  connection.on(WebcastEvent.MEMBER, onMember);

  log("🔌 Đang kết nối tới live của @" + TIKTOK_USERNAME + " ...");
  connection.connect()
    .then((state) => { if (state && state.roomId) tikTokState.roomId = String(state.roomId); })
    .catch((err) => {
      const msg = (err && err.message) || String(err);
      if (/offline|not live|UserOffline/i.test(msg) || (err && err.name === "UserOfflineError")) {
        log("💤 Kênh @" + TIKTOK_USERNAME + " hiện CHƯA live. Bridge sẽ tự thử lại — cứ để bridge chạy, khi kênh bắt đầu live là bắt được sự kiện.");
      } else {
        log("❌ Kết nối thất bại:", msg);
      }
      scheduleReconnect("Kết nối chưa thành công");
    });
}

/* ---------------- Chế độ DEMO: tự phát sự kiện giả lập ---------------- */
const DEMO_NAMES = ["Minh Tâm", "An Nhiên", "Quang Huy", "Hoàng Nam", "Bảo Ngọc", "Diệu Linh", "Tuệ Minh", "Thu Hà",
  "Ngọc Lan", "Đức Anh", "Hải Đăng", "Mai Anh", "Phương Thảo", "Trung Kiên", "Hồng Nhung", "Văn Đức",
  "Kim Chi", "Phúc An", "Tâm Như", "Ngọc Trâm", "Hữu Phước", "Mỹ Linh", "Quốc Bảo", "Trúc Ly"];
const DEMO_TEXTS = ["Nam mô A Di Đà Phật 🙏", "Cho con vào thiền với ạ", "nam", "nữ", "sư",
  "A Di Đà Phật", "Ngồi thiền cho tâm an", "Xin một chỗ ngồi thiền", "Tâm an vạn sự an", "Con xin vào thiền đường"];
const DEMO_GIFTS = [
  { giftName: "Hoa hồng", coins: 1 },
  { giftName: "Hoa sen", coins: 10 },
  { giftName: "Tràng hạt", coins: 50 },
  { giftName: "Đèn hoa đăng", coins: 100 }
];
let demoIdx = 0;
function startDemo() {
  log("🎭 CHẾ ĐỘ DEMO: bridge tự phát sự kiện giả lập mỗi ~2,2 giây (comment + quà). Không cần kênh live thật.");
  const tick = () => {
    if (stopped) return;
    const name = DEMO_NAMES[demoIdx % DEMO_NAMES.length];
    if (demoIdx % 4 === 3) {
      const g = DEMO_GIFTS[Math.floor(Math.random() * DEMO_GIFTS.length)];
      const ev = { type: "gift", name: name, uniqueId: "demo_" + (demoIdx % DEMO_NAMES.length), giftName: g.giftName, giftId: null, count: 1, coins: g.coins, avatar: "", demo: true };
      log("🎁 [demo]", ev.name, "tặng", ev.giftName, "(" + ev.coins + " xu)");
      broadcast(ev);
    } else {
      const ev = { type: "chat", name: name, uniqueId: "demo_" + (demoIdx % DEMO_NAMES.length), text: DEMO_TEXTS[demoIdx % DEMO_TEXTS.length], avatar: "", demo: true };
      log("💬 [demo]", ev.name + ":", ev.text);
      broadcast(ev);
    }
    demoIdx++;
    setTimeout(tick, 1800 + Math.random() * 1200);
  };
  setTimeout(tick, 800);
}

/* ---------------- ĐỢT 21: Worker TTS local (thường trú + cache) ----------------
   Worker Python (bridge/tts_worker.py) giữ model trong RAM và nhận yêu cầu
   JSON-lines qua stdin. Bridge khởi động worker LƯỜI ở yêu cầu /tts đầu tiên
   (không làm chậm lúc mở bridge, không tải model khi không dùng giọng đọc).
   File âm cache theo SHA-256 của văn bản tại bridge/tts-cache/ — cùng một
   câu khấn chỉ tổng hợp 1 lần. Tắt hẳn bằng biến môi trường TDTT_TTS=off. */
const TTS_OFF = (process.env.TDTT_TTS || "").toLowerCase() === "off";
const TTS_CACHE_DIR = path.join(__dirname, "tts-cache");
try { fs.mkdirSync(TTS_CACHE_DIR, { recursive: true }); } catch (e) {}
let ttsWorker = null, ttsReady = false, ttsEngine = null, ttsSeq = 0, ttsStarting = null;
const ttsPending = new Map();

function ttsFilterText(s) {
  let t = String(s || "").normalize("NFC");
  t = t.replace(/[\u0000-\u001f\u007f-\u009f\u034f\u061c\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff]/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  if (!t || !/[\p{L}\p{N}]/u.test(t)) return null;
  if (t.length > 220) t = t.slice(0, 220).trim();
  return t;
}

function ttsPython() {
  if (process.env.TDTT_TTS_PYTHON) return process.env.TDTT_TTS_PYTHON;
  const venvPy = path.join(__dirname, "tts-venv", "bin", "python");
  try { if (fs.existsSync(venvPy)) return venvPy; } catch (e) {}
  return "python3";
}

function ensureTtsWorker() {
  if (TTS_OFF) return Promise.reject(new Error("TTS đang tắt (TDTT_TTS=off)"));
  if (ttsReady && ttsWorker) return Promise.resolve();
  if (ttsStarting) return ttsStarting;
  ttsStarting = new Promise((resolve, reject) => {
    const py = ttsPython();
    log("🔊 Đang khởi động worker TTS (" + py + ") — lần đầu sẽ nạp model, các lần sau dùng cache...");
    let child;
    try { child = spawn(py, [path.join(__dirname, "tts_worker.py")], { stdio: ["pipe", "pipe", "pipe"] }); }
    catch (e) { ttsStarting = null; reject(e); return; }
    ttsWorker = child;
    let settled = false;
    const bootTimer = setTimeout(() => {
      if (!settled) { settled = true; ttsStarting = null; try { child.kill(); } catch (e) {} reject(new Error("worker TTS khởi động quá lâu")); }
    }, 240000);
    const rl = readline.createInterface({ input: child.stdout });
    rl.on("line", (line) => {
      let msg; try { msg = JSON.parse(line); } catch (e) { return; }
      if (msg.ready !== undefined && !settled) {
        settled = true; clearTimeout(bootTimer); ttsStarting = null;
        if (msg.ready) {
          ttsReady = true; ttsEngine = msg.engine || "tts";
          log("🔊 Worker TTS sẵn sàng — engine: " + ttsEngine);
          resolve();
        } else {
          ttsReady = false;
          log("🔇 Worker TTS không có engine khả dụng: " + (msg.error || "?"));
          reject(new Error(msg.error || "TTS không khả dụng"));
        }
        return;
      }
      if (msg.id != null && ttsPending.has(msg.id)) {
        const p = ttsPending.get(msg.id); ttsPending.delete(msg.id);
        if (msg.ok) p.resolve(); else p.reject(new Error(msg.error || "tổng hợp thất bại"));
      }
    });
    child.stderr.on("data", (d) => { const s = String(d).trim(); if (s) log("   [tts]", s.slice(0, 300)); });
    child.on("exit", (code) => {
      ttsReady = false; ttsWorker = null;
      for (const p of ttsPending.values()) p.reject(new Error("worker TTS đã dừng (code " + code + ")"));
      ttsPending.clear();
      if (!settled) { settled = true; clearTimeout(bootTimer); ttsStarting = null; reject(new Error("worker TTS thoát sớm (code " + code + ")")); }
      log("🔇 Worker TTS đã dừng (code " + code + "). Yêu cầu /tts tiếp theo sẽ khởi động lại.");
    });
  });
  return ttsStarting;
}

function ttsSynthesize(text) {
  const hash = crypto.createHash("sha256").update(text, "utf8").digest("hex");
  const file = path.join(TTS_CACHE_DIR, hash + ".wav");
  if (fs.existsSync(file) && fs.statSync(file).size > 1000) return Promise.resolve(file);
  return ensureTtsWorker().then(() => new Promise((resolve, reject) => {
    const id = ++ttsSeq;
    const timer = setTimeout(() => { ttsPending.delete(id); reject(new Error("tổng hợp quá lâu")); }, 180000);
    ttsPending.set(id, {
      resolve: () => { clearTimeout(timer); resolve(file); },
      reject: (e) => { clearTimeout(timer); reject(e); }
    });
    ttsWorker.stdin.write(JSON.stringify({ id: id, text: text, out: file }) + "\n");
  }));
}

/* ---------------- Khởi động ---------------- */
server.listen(PORT, () => {
  log("🪷 THIỀN ĐƯỜNG TỊNH TÂM — BRIDGE đã chạy.");
  log("   Mở trang thiền đường:  http://localhost:" + PORT + "/");
  log("   Trạng thái bridge:     http://localhost:" + PORT + "/status");
  if (DEMO_MODE) startDemo();
  else startTikTok();
});

process.on("SIGINT", () => {
  stopped = true;
  log("👋 Đang tắt bridge...");
  try { if (connection) connection.disconnect().catch(() => {}); } catch (e) {}
  try { if (ttsWorker) ttsWorker.kill(); } catch (e) {}   // ĐỢT 21: tắt worker TTS theo bridge
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500);
});
