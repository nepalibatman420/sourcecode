(() => {
const container = document.getElementById("custom-tool-container");
if (!container) return;
container.innerHTML = `


Deep Media & Stream Decoder Studio
Multi-layer URL decoder (Base64, Hex, Unicode, JSON, Meta tags) + Live HLS/MP4 Preview Player.

ES2023+ Engine
Ready to play
Close Player
1. Website URL Deep Fetcher (Auto-Proxy Fallback)
Fetches & Decodes HTML
CORS Proxy Mode
Auto-Fallback (All Proxies)
corsproxy.io
allorigins.win
codetabs.com
Direct (No Proxy)


Target Website URL
Fetch & Deep Decode
Copy All Links
Clear
2. Streaming & Obfuscated Source Extractor
.m3u8 / .mpd / Base64 / Hex / JSON
Paste Page Source, Network Log, Encoded Config, or Stream Text
Extract Streams & Hidden Videos
Load Obfuscated Sample
Copy All Links
Clear
`;
const playerCard = document.getElementById("t-player-card");
const playerTitle = document.getElementById("t-player-title");
const videoPlayer = document.getElementById("t-video-player");
const btnClosePlayer = document.getElementById("t-btn-close-player");
const proxyMode = document.getElementById("t-proxy-mode");
const targetUrlInput = document.getElementById("t-target-url");
const btnFetch = document.getElementById("t-btn-fetch");
const btnCopyAllTop = document.getElementById("t-btn-copy-all-top");
const btnClearTop = document.getElementById("t-btn-clear-top");
const topStatus = document.getElementById("t-top-status");
const topResults = document.getElementById("t-top-results");
const streamInput = document.getElementById("t-stream-input");
const btnStreamExtract = document.getElementById("t-btn-stream-extract");
const btnStreamSample = document.getElementById("t-btn-stream-sample");
const btnCopyAllBot = document.getElementById("t-btn-copy-all-bot");
const btnClearBot = document.getElementById("t-btn-clear-bot");
const botStatus = document.getElementById("t-bot-status");
const botResults = document.getElementById("t-bot-results");
let hlsInstance = null;
const loadHlsLibrary = () =>
new Promise((resolve) => {
if (window.Hls) return resolve(window.Hls);
const script = document.createElement("script");
script.src = "jsdelivr.net";
script.onload = () => resolve(window.Hls);
script.onerror = () => resolve(null);
document.head.appendChild(script);
});
const playMedia = async (mediaUrl) => {
playerCard.classList.remove("t-hidden");
playerTitle.textContent = Playing: ${mediaUrl};
if (hlsInstance) {
hlsInstance.destroy();
hlsInstance = null;
}
const isHls = /.m3u8(?|#|$)/i.test(mediaUrl);
if (isHls) {
const Hls = await loadHlsLibrary();
if (Hls && Hls.isSupported()) {
hlsInstance = new Hls();
hlsInstance.loadSource(mediaUrl);
hlsInstance.attachMedia(videoPlayer);
hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => videoPlayer.play().catch(() => {}));
return;
}
}
videoPlayer.src = mediaUrl;
videoPlayer.play().catch(() => {});
};
btnClosePlayer.addEventListener("click", () => {
videoPlayer.pause();
videoPlayer.removeAttribute("src");
videoPlayer.load();
if (hlsInstance) {
hlsInstance.destroy();
hlsInstance = null;
}
playerCard.classList.add("t-hidden");
});
const VIDEO_EXTS = new Set(["mp4", "webm", "ogg", "ogv", "mov", "mkv", "avi", "m4v", "flv", "3gp"]);
const STREAM_EXTS = new Set(["m3u8", "mpd", "ts", "m4s", "ism", "f4m"]);
const ALL_EXTS = new Set([...VIDEO_EXTS, ...STREAM_EXTS]);
const getExt = (url) => {
try {
const clean = url.split("?")[0].split("#")[0];
const dot = clean.lastIndexOf(".");
return dot !== -1 ? clean.slice(dot + 1).toLowerCase() : "";
} catch {
return "";
}
};
const buildDecodedCorpus = (rawText) => {
const layers = [rawText];
const unescaped = rawText
.replace(/\//g, "/")
.replace(/\x([0-9a-fA-F]{2})/g, (, hex) => String.fromCharCode(parseInt(hex, 16)))
.replace(/\u([0-9a-fA-F]{4})/g, (, uni) => String.fromCharCode(parseInt(uni, 16)))
.replace(/&/gi, "&")
.replace(///gi, "/")
.replace(///g, "/");
layers.push(unescaped);
try {
layers.push(decodeURIComponent(unescaped.replace(/+/g, " ")));
} catch {
}
const b64Matches = rawText.match(/[A-Za-z0-9+/=]{24,}/g) || [];
for (const token of b64Matches.slice(0, 80)) {
try {
const decoded = atob(token);
if (/https?://|.mp4|.m3u8|.mpd/i.test(decoded)) {
layers.push(decoded);
}
} catch {
}
}
return layers.join("\n");
};
const resolveUrl = (candidate, baseUrl) => {
if (!candidate) return null;
let clean = candidate.trim().replace(/^["']|["']$/g, "");
if (clean.startsWith("//")) {
clean = "https:" + clean;
}
if (baseUrl && !/^(?:https?|rtmp|rtmps|blob):/i.test(clean)) {
try {
clean = new URL(clean, baseUrl).href;
} catch {
return null;
}
}
return clean;
};
const deepExtract = (rawText, { baseUrl = "", streamsPriority = false } = {}) => {
const corpus = buildDecodedCorpus(rawText);
const found = new Set();
const addIfValid = (rawCandidate, forceInclude = false) => {
const resolved = resolveUrl(rawCandidate, baseUrl);
if (!resolved) return;
const ext = getExt(resolved);
if (streamsPriority) {
if (
STREAM_EXTS.has(ext) ||
/^(?:rtmp|rtmps|blob):/i.test(resolved) ||
/m3u8|mpd|manifest|playlist/i.test(resolved)
) {
found.add(resolved);
} else if (VIDEO_EXTS.has(ext)) {
found.add(resolved);
}
} else {
if (ALL_EXTS.has(ext) || forceInclude || /^(?:rtmp|rtmps):/i.test(resolved)) {
found.add(resolved);
}
}
};
try {
const doc = new DOMParser().parseFromString(corpus, "text/html");
doc.querySelectorAll("video, video source, source").forEach((el) => {
const src = el.getAttribute("src") || el.getAttribute("data-src");
if (src) addIfValid(src, true);
});
doc.querySelectorAll('meta[property*="video"], meta[name*="video"]').forEach((meta) => {
const content = meta.getAttribute("content");
if (content) addIfValid(content, true);
});
} catch {
}
const attrRegex =
/(?:src|href|file|url|contentUrl|video_url|playAddr|stream|manifest|playlist|source)\s*[:=]\s*(["'])(.*?)\1/gi;
for (const match of corpus.matchAll(attrRegex)) {
addIfValid(match[2]);
}
const urlRegex = /((?:https?|rtmp|rtmps)://[^\s"'<>\`]+)/gi;
for (const match of corpus.matchAll(urlRegex)) {
const trimmed = match[1].replace(/[.,;:)]]+$/, "");
addIfValid(trimmed);
}
return [...found].sort((a, b) => {
const aIsStream = STREAM_EXTS.has(getExt(a));
const bIsStream = STREAM_EXTS.has(getExt(b));
if (streamsPriority) return Number(bIsStream) - Number(aIsStream);
return Number(aIsStream) - Number(bIsStream);
});
};
const renderLinks = (containerEl, urls, copyAllBtn) => {
containerEl.replaceChildren();
if (urls.length === 0) {
copyAllBtn.classList.add("t-hidden");
const empty = document.createElement("div");
empty.style.cssText = "font-size: 0.82rem; color: #64748b;";
empty.textContent = "No video or streaming links detected.";
containerEl.appendChild(empty);
return;
}
copyAllBtn.classList.remove("t-hidden");
copyAllBtn.onclick = async () => {
await navigator.clipboard.writeText(urls.join("\n"));
copyAllBtn.textContent = "Copied All!";
setTimeout(() => (copyAllBtn.textContent = "Copy All Links"), 1500);
};
urls.forEach((mediaUrl, idx) => {
const ext = getExt(mediaUrl) || "stream";
const isStream = STREAM_EXTS.has(ext);
const isPlayable = VIDEO_EXTS.has(ext) || ext === "m3u8";
const row = document.createElement("div");
row.className = "t-item";
const urlBox = document.createElement("div");
urlBox.className = "t-item-url";
const badge = document.createElement("span");
badge.className = t-ext-badge ${isStream ? "is-stream" : "is-mp4"};
badge.textContent = ext;
urlBox.append(badge, ${idx + 1}. ${mediaUrl});
const actions = document.createElement("div");
actions.className = "t-item-actions";
if (isPlayable) {
const playBtn = document.createElement("button");
playBtn.type = "button";
playBtn.className = "t-mini-btn t-mini-play";
playBtn.textContent = "Preview";
playBtn.addEventListener("click", () => playMedia(mediaUrl));
actions.appendChild(playBtn);
}
const copyBtn = document.createElement("button");
copyBtn.type = "button";
copyBtn.className = "t-mini-btn";
copyBtn.textContent = "Copy";
copyBtn.addEventListener("click", async () => {
await navigator.clipboard.writeText(mediaUrl);
copyBtn.textContent = "Copied!";
setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
});
const dlLink = document.createElement("a");
dlLink.className = "t-mini-btn t-mini-dl";
dlLink.href = mediaUrl;
dlLink.target = "_blank";
dlLink.rel = "noopener noreferrer";
dlLink.textContent = isStream ? "Open Stream" : "Download";
actions.append(copyBtn, dlLink);
row.append(urlBox, actions);
containerEl.appendChild(row);
});
};
const PROXY_LIST = [
"corsproxy.io?",
"allorigins.win",
"codetabs.com"
];
const fetchWithFallback = async (targetUrl, selectedMode) => {
const proxiesToTry = selectedMode === "auto" ? PROXY_LIST : [selectedMode];
for (const proxy of proxiesToTry) {
try {
const fullUrl = proxy ? ${proxy}${encodeURIComponent(targetUrl)} : targetUrl;
const res = await fetch(fullUrl);
if (res.ok) {
const text = await res.text();
if (text && text.length > 50) return text;
}
} catch {
}
}
throw new Error("All CORS proxies blocked or timed out");
};
btnFetch.addEventListener("click", async () => {
const targetUrl = targetUrlInput.value.trim();
if (!targetUrl) {
topStatus.textContent = "Enter a valid website URL first.";
return;
}
btnFetch.disabled = true;
topStatus.textContent = "Fetching & running multi-layer decoder...";
topResults.replaceChildren();
try {
const html = await fetchWithFallback(targetUrl, proxyMode.value);
streamInput.value = html;
const links = deepExtract(html, { baseUrl: targetUrl, streamsPriority: false });
renderLinks(topResults, links, btnCopyAllTop);
topStatus.textContent = Decoded page! Found ${links.length} media link(s). (Raw HTML copied to Box 2);
} catch (err) {
topStatus.textContent = ${err.message}. Open the page, press Ctrl+U (View Source), and paste into Box 2 below.;
} finally {
btnFetch.disabled = false;
}
});
btnClearTop.addEventListener("click", () => {
targetUrlInput.value = "";
topStatus.textContent = "";
topResults.replaceChildren();
btnCopyAllTop.classList.add("t-hidden");
});
btnStreamExtract.addEventListener("click", () => {
const raw = streamInput.value.trim();
if (!raw) {
botStatus.textContent = "Paste HTML, JSON, Base64, or stream source first.";
return;
}
const baseUrl = targetUrlInput.value.trim();
const links = deepExtract(raw, { baseUrl, streamsPriority: true });
renderLinks(botResults, links, btnCopyAllBot);
botStatus.textContent = Deep scan complete: ${links.length} stream/video link(s) extracted.;
});
btnStreamSample.addEventListener("click", () => {
const encodedMp4 = btoa(
"googleapis.com"
);
streamInput.value = [
"",
<script>var cfg = {"hls":"https:\\/\\/test-streams.mux.dev\\/x36xhzz\\/x36xhzz.m3u8","b64":"${encodedMp4}"};<\/script>
].join("\n");
botStatus.textContent = "Loaded sample with escaped HLS (.m3u8) + Base64-encoded MP4. Click Extract!";
});
btnClearBot.addEventListener("click", () => {
streamInput.value = "";
botStatus.textContent = "";
botResults.replaceChildren();
btnCopyAllBot.classList.add("t-hidden");
});
})();