import {
  assessReadme,
  buildChangelogNotes,
  parseDoctorDiagnostics,
  parseMeetingNotes,
  summarizeFinanceCsv
} from "./src/core.mjs";

const tools = [
  ["ops", "OP", "Personal Ops"],
  ["readme", "RD", "README Fixer"],
  ["finance", "FN", "Finance Tracker"],
  ["prompts", "PR", "Prompt Vault"],
  ["issue", "IS", "Screenshot Issue"],
  ["health", "HT", "Repo Health"],
  ["meeting", "MT", "Meeting Notes"],
  ["doctor", "DR", "Dev Doctor"],
  ["site", "ST", "Site Starter"],
  ["changelog", "CH", "Changelog Bot"]
];

const storageKey = "vibe-utility-pack-state-v1";
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const state = loadState();
const today = () => new Date().toISOString().slice(0, 10);
const id = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

function loadState() {
  const fallback = {
    tasks: [],
    notes: "",
    links: [],
    habits: {},
    prompts: [],
    activePromptId: null
  };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state, null, 2));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadCanvasPng(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}

function initTabs() {
  const tabs = $("#tabs");
  tabs.innerHTML = "";
  tools.forEach(([key, mark, label], index) => {
    const button = document.createElement("button");
    button.className = `tab-button ${index === 0 ? "active" : ""}`;
    button.dataset.tool = key;
    button.innerHTML = `<span>${mark}</span><span>${label}</span>`;
    button.addEventListener("click", () => activateTool(key));
    tabs.appendChild(button);
  });
}

function activateTool(key) {
  $$(".tab-button").forEach((button) => button.classList.toggle("active", button.dataset.tool === key));
  $$(".tool-panel").forEach((panel) => panel.classList.toggle("active", panel.id === key));
  $("#toolTitle").textContent = $(`#${key}`).dataset.title;
}

function initGlobalActions() {
  $("#exportState").addEventListener("click", () => {
    downloadText("vibe-utility-pack-state.json", JSON.stringify(state, null, 2), "application/json");
  });

  $("#clearState").addEventListener("click", () => {
    if (!confirm("Clear saved local data for this tool pack?")) return;
    localStorage.removeItem(storageKey);
    location.reload();
  });
}

function initOps() {
  $("#opsNotes").value = state.notes || "";
  $("#opsNotes").addEventListener("input", (event) => {
    state.notes = event.target.value;
    saveState();
  });

  $("#addTask").addEventListener("click", () => {
    const input = $("#taskInput");
    const text = input.value.trim();
    if (!text) return;
    state.tasks.unshift({ id: id(), text, done: false, createdAt: today() });
    input.value = "";
    saveState();
    renderTasks();
  });

  $("#taskInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") $("#addTask").click();
  });

  $("#addLink").addEventListener("click", () => {
    const label = $("#linkLabel").value.trim();
    const url = $("#linkUrl").value.trim();
    if (!label || !url) return;
    state.links.unshift({ id: id(), label, url });
    $("#linkLabel").value = "";
    $("#linkUrl").value = "";
    saveState();
    renderLinks();
  });

  renderTasks();
  renderHabits();
  renderLinks();
}

function renderTasks() {
  const list = $("#taskList");
  list.innerHTML = "";
  state.tasks.forEach((task) => {
    const li = document.createElement("li");
    const label = document.createElement("label");
    label.className = "switch";
    label.innerHTML = `<input type="checkbox" ${task.done ? "checked" : ""}><span><strong>${escapeHtml(task.text)}</strong><small>${task.createdAt}</small></span>`;
    label.querySelector("input").addEventListener("change", (event) => {
      task.done = event.target.checked;
      saveState();
      renderTasks();
    });
    const remove = document.createElement("button");
    remove.className = "mini-action";
    remove.textContent = "X";
    remove.title = "Remove task";
    remove.addEventListener("click", () => {
      state.tasks = state.tasks.filter((item) => item.id !== task.id);
      saveState();
      renderTasks();
    });
    li.append(label, remove);
    list.appendChild(li);
  });
}

function renderHabits() {
  const habits = ["Plan", "Ship", "Move", "Learn"];
  const grid = $("#habitGrid");
  grid.innerHTML = "";
  habits.forEach((name) => {
    const key = `${today()}:${name}`;
    const count = state.habits[key] || 0;
    const item = document.createElement("div");
    item.className = "habit";
    item.innerHTML = `<strong>${name}</strong><small>${today()}</small><button>${count ? `Done ${count}` : "Mark"}</button>`;
    item.querySelector("button").addEventListener("click", () => {
      state.habits[key] = count + 1;
      saveState();
      renderHabits();
    });
    grid.appendChild(item);
  });
}

function renderLinks() {
  const list = $("#linkList");
  list.innerHTML = "";
  state.links.forEach((link) => {
    const li = document.createElement("li");
    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.innerHTML = `<strong>${escapeHtml(link.label)}</strong><small>${escapeHtml(link.url)}</small>`;
    const remove = document.createElement("button");
    remove.className = "mini-action";
    remove.textContent = "X";
    remove.title = "Remove link";
    remove.addEventListener("click", () => {
      state.links = state.links.filter((item) => item.id !== link.id);
      saveState();
      renderLinks();
    });
    li.append(anchor, remove);
    list.appendChild(li);
  });
}

function initReadme() {
  $("#sampleReadme").addEventListener("click", () => {
    $("#readmeInput").value = "# Tiny Tool\n\nDoes stuff.\n\n## Install\n\nnpm install\n";
    $("#analyzeReadme").click();
  });
  $("#analyzeReadme").addEventListener("click", analyzeReadme);
}

function analyzeReadme() {
  const report = assessReadme($("#readmeInput").value);
  $("#readmeScore").textContent = `${report.passed}/${report.total} README signals found`;
  $("#readmeFindings").innerHTML = report.checks.map((check) => (
    `<li><span><strong>${check.ok ? "Pass" : "Fix"}: ${check.name}</strong><small>${check.ok ? "Looks covered." : check.fix}</small></span></li>`
  )).join("");
  $("#readmeOutput").value = report.outline;
}

function initFinance() {
  $("#sampleFinance").addEventListener("click", () => {
    $("#financeCsv").value = `date,description,amount
2026-05-01,Coffee shop,-4.90
2026-05-02,Salary,4200
2026-05-03,Rent payment,-1500
2026-05-04,Metro card,-38
2026-05-05,Grocery market,-86.43
2026-05-08,AWS bill,-21.20`;
    $("#parseFinance").click();
  });
  $("#parseFinance").addEventListener("click", parseFinance);
}

function parseFinance() {
  const report = summarizeFinanceCsv($("#financeCsv").value);

  $("#financeMetrics").innerHTML = [
    ["Income", report.income],
    ["Expenses", report.expense],
    ["Net", report.net]
  ].map(([label, amount]) => `<div class="metric"><span>${label}</span><strong>$${amount.toFixed(2)}</strong></div>`).join("");

  const max = Math.max(...Object.values(report.byCategory), 1);
  $("#financeBars").innerHTML = Object.entries(report.byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => `<div class="bar"><label><span>${name}</span><strong>$${amount.toFixed(2)}</strong></label><span style="width:${Math.max(8, (amount / max) * 100)}%"></span></div>`)
    .join("");

  $("#financeCleanCsv").value = report.cleanCsv;
}

function initPrompts() {
  $("#savePrompt").addEventListener("click", () => {
    const title = $("#promptTitle").value.trim();
    const body = $("#promptBody").value.trim();
    const tags = $("#promptTags").value.split(",").map((tag) => tag.trim()).filter(Boolean);
    if (!title || !body) return;
    const existing = state.prompts.find((prompt) => prompt.id === state.activePromptId);
    if (existing) {
      Object.assign(existing, { title, body, tags, updatedAt: today() });
    } else {
      state.prompts.unshift({ id: id(), title, body, tags, updatedAt: today() });
    }
    saveState();
    renderPrompts();
  });

  $("#clearPromptEditor").addEventListener("click", () => {
    state.activePromptId = null;
    $("#promptTitle").value = "";
    $("#promptTags").value = "";
    $("#promptBody").value = "";
    $("#promptPreview").value = "";
    saveState();
    renderPrompts();
  });

  $("#promptSearch").addEventListener("input", renderPrompts);
  $("#promptRenderVars").addEventListener("input", renderPromptPreview);
  renderPrompts();
}

function renderPrompts() {
  const query = $("#promptSearch").value.toLowerCase();
  const list = $("#promptList");
  list.innerHTML = "";
  state.prompts
    .filter((prompt) => `${prompt.title} ${prompt.tags.join(" ")} ${prompt.body}`.toLowerCase().includes(query))
    .forEach((prompt) => {
      const li = document.createElement("li");
      const body = document.createElement("button");
      body.className = "tab-button";
      body.innerHTML = `<span>${prompt.title.slice(0, 2).toUpperCase()}</span><span><strong>${escapeHtml(prompt.title)}</strong><small>${escapeHtml(prompt.tags.join(", ") || "untagged")}</small></span>`;
      body.addEventListener("click", () => selectPrompt(prompt.id));
      const remove = document.createElement("button");
      remove.className = "mini-action";
      remove.textContent = "X";
      remove.addEventListener("click", () => {
        state.prompts = state.prompts.filter((item) => item.id !== prompt.id);
        if (state.activePromptId === prompt.id) state.activePromptId = null;
        saveState();
        renderPrompts();
      });
      li.append(body, remove);
      list.appendChild(li);
    });
  renderPromptPreview();
}

function selectPrompt(promptId) {
  const prompt = state.prompts.find((item) => item.id === promptId);
  if (!prompt) return;
  state.activePromptId = promptId;
  $("#promptTitle").value = prompt.title;
  $("#promptTags").value = prompt.tags.join(", ");
  $("#promptBody").value = prompt.body;
  saveState();
  renderPromptPreview();
}

function renderPromptPreview() {
  const prompt = state.prompts.find((item) => item.id === state.activePromptId);
  if (!prompt) {
    $("#promptPreview").value = "";
    return;
  }
  let variables = {};
  try {
    variables = JSON.parse($("#promptRenderVars").value || "{}");
  } catch {
    variables = {};
  }
  $("#promptPreview").value = prompt.body.replace(/\{([a-zA-Z0-9_-]+)\}/g, (match, key) => variables[key] ?? match);
}

const issueState = {
  image: null,
  annotations: [],
  draft: null
};

function initIssue() {
  const canvas = $("#issueCanvas");
  const ctx = canvas.getContext("2d");
  drawIssueCanvas(ctx, canvas);

  $("#screenshotFile").addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      issueState.image = img;
      issueState.annotations = [];
      drawIssueCanvas(ctx, canvas);
    };
    img.src = URL.createObjectURL(file);
  });

  canvas.addEventListener("mousedown", (event) => {
    const start = canvasPoint(canvas, event);
    issueState.draft = { x: start.x, y: start.y, w: 0, h: 0 };
  });
  canvas.addEventListener("mousemove", (event) => {
    if (!issueState.draft) return;
    const point = canvasPoint(canvas, event);
    issueState.draft.w = point.x - issueState.draft.x;
    issueState.draft.h = point.y - issueState.draft.y;
    drawIssueCanvas(ctx, canvas);
  });
  canvas.addEventListener("mouseup", () => {
    if (!issueState.draft) return;
    if (Math.abs(issueState.draft.w) > 8 && Math.abs(issueState.draft.h) > 8) {
      issueState.annotations.push(normalizeRect(issueState.draft));
    }
    issueState.draft = null;
    drawIssueCanvas(ctx, canvas);
  });

  $("#undoAnnotation").addEventListener("click", () => {
    issueState.annotations.pop();
    drawIssueCanvas(ctx, canvas);
  });
  $("#clearAnnotations").addEventListener("click", () => {
    issueState.annotations = [];
    drawIssueCanvas(ctx, canvas);
  });
  $("#buildIssue").addEventListener("click", buildIssueMarkdown);
  $("#downloadIssueImage").addEventListener("click", () => downloadCanvasPng(canvas, "annotated-screenshot.png"));
}

function canvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height
  };
}

function normalizeRect(rect) {
  const x = Math.min(rect.x, rect.x + rect.w);
  const y = Math.min(rect.y, rect.y + rect.h);
  return { x, y, w: Math.abs(rect.w), h: Math.abs(rect.h) };
}

function drawIssueCanvas(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (issueState.image) {
    const scale = Math.min(canvas.width / issueState.image.width, canvas.height / issueState.image.height);
    const width = issueState.image.width * scale;
    const height = issueState.image.height * scale;
    const x = (canvas.width - width) / 2;
    const y = (canvas.height - height) / 2;
    ctx.drawImage(issueState.image, x, y, width, height);
  } else {
    ctx.fillStyle = "#eef2ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#14213d";
    ctx.font = "700 28px system-ui";
    ctx.fillText("Upload a screenshot, then drag to mark problem areas", 62, 245);
  }

  [...issueState.annotations, issueState.draft ? normalizeRect(issueState.draft) : null].filter(Boolean).forEach((rect, index) => {
    ctx.strokeStyle = "#c2415d";
    ctx.lineWidth = 4;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = "#c2415d";
    ctx.beginPath();
    ctx.arc(rect.x, rect.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "700 16px system-ui";
    ctx.fillText(String(index + 1), rect.x - 5, rect.y + 6);
  });
}

function buildIssueMarkdown() {
  const points = issueState.annotations.map((rect, index) => `- Annotation ${index + 1}: x=${Math.round(rect.x)}, y=${Math.round(rect.y)}, w=${Math.round(rect.w)}, h=${Math.round(rect.h)}`).join("\n") || "- No annotations added.";
  $("#issueMarkdown").value = `# ${$("#issueTitle").value.trim() || "Bug report"}

<!-- GitHub issue template export -->

Labels: bug, needs-triage

Attach: annotated-screenshot.png

## Steps to reproduce

${$("#issueSteps").value.trim() || "1. Open the affected page\n2. Trigger the behavior"}

## Expected

${$("#issueExpected").value.trim() || "Describe the expected result."}

## Actual

${$("#issueActual").value.trim() || "Describe the actual result."}

## Screenshot notes

![Annotated screenshot](annotated-screenshot.png)

${points}

## Environment

- Browser:
- OS:
- Build/version:`;
}

const healthSignals = [
  ["readme", "README", "Project has a clear README"],
  ["license", "License", "License is included"],
  ["tests", "Tests", "There is at least one test command or test folder"],
  ["ci", "CI", "GitHub Actions or another CI config exists"],
  ["examples", "Examples", "Examples, screenshots, or demo files exist"],
  ["env", "Env sample", ".env.example or config docs exist"],
  ["issues", "Issue templates", "Bug report or feature request template exists"],
  ["changelog", "Changelog", "Changelog or release notes exist"]
];

function initHealth() {
  $("#healthChecks").innerHTML = healthSignals.map(([key, label, detail], index) => `
    <label class="switch">
      <input type="checkbox" data-health="${key}" ${index < 3 ? "checked" : ""}>
      <span><strong>${label}</strong><small>${detail}</small></span>
    </label>
  `).join("");
  $("#buildHealth").addEventListener("click", buildHealth);
  buildHealth();
}

function buildHealth() {
  const checked = $$("[data-health]").filter((input) => input.checked).map((input) => input.dataset.health);
  const score = Math.round((checked.length / healthSignals.length) * 100);
  const repo = $("#repoName").value.trim() || "your-project";
  const status = score >= 75 ? "good" : score >= 45 ? "warming up" : "needs setup";
  $("#healthScore").textContent = `${repo}: ${score}/100, ${status}`;
  $("#healthBadges").innerHTML = [
    ["health", `${score}%`, score >= 75 ? "good" : "warn"],
    ["license", checked.includes("license") ? "yes" : "missing", checked.includes("license") ? "good" : "warn"],
    ["tests", checked.includes("tests") ? "present" : "missing", checked.includes("tests") ? "good" : "warn"]
  ].map(([left, right, kind]) => `<span class="badge ${kind}"><span>${left}</span><span>${right}</span></span>`).join("");

  const missing = healthSignals.filter(([key]) => !checked.includes(key)).map(([, label, detail]) => `- [ ] ${label}: ${detail}`);
  const present = healthSignals.filter(([key]) => checked.includes(key)).map(([, label]) => `- [x] ${label}`);
  $("#healthMarkdown").value = `# ${repo} Health

Score: ${score}/100

## Present

${present.join("\n") || "- Nothing checked yet."}

## Next Fixes

${missing.join("\n") || "- Looks ready for a first public release."}

## Badge snippets

![health](https://img.shields.io/badge/health-${score}%25-${score >= 75 ? "green" : "yellow"})
![tests](https://img.shields.io/badge/tests-${checked.includes("tests") ? "present-green" : "missing-yellow"})`;
}

function initMeeting() {
  $("#sampleMeeting").addEventListener("click", () => {
    $("#meetingInput").value = `Decision: Ship beta invite page this week.
@maya follow up with legal by 2026-06-04
TODO Sam update pricing copy
Risk: onboarding emails still feel too generic
Action: Leo prepare demo account by Friday`;
    $("#parseMeeting").click();
  });
  $("#parseMeeting").addEventListener("click", parseMeeting);
}

function parseMeeting() {
  $("#meetingOutput").value = parseMeetingNotes($("#meetingInput").value).markdown;
}

function initDoctor() {
  $("#sampleDoctor").addEventListener("click", () => {
    $("#doctorInput").value = `node --version: v24.11.1
npm --version: 11.6.2
git --version: not found
python --version: Python 3.11.9
docker --version: Docker version 27.5.1`;
    $("#runDoctorParser").click();
  });
  $("#runDoctorParser").addEventListener("click", parseDoctor);
}

function parseDoctor() {
  const report = parseDoctorDiagnostics($("#doctorInput").value);
  $("#doctorReport").innerHTML = report.results.map((result) => `
    <li><span><strong>${result.ok ? "Pass" : "Check"}: ${result.name}</strong><small>${result.detail}</small></span></li>
  `).join("");
  $("#doctorMarkdown").value = report.markdown;
}

function initSiteStarter() {
  $("#buildSite").addEventListener("click", buildSite);
}

function buildSite() {
  const name = $("#bizName").value.trim() || "Studio North";
  const offer = $("#bizOffer").value.trim() || "focused services for busy local clients";
  const city = $("#bizCity").value.trim() || "Your City";
  const contact = $("#bizContact").value.trim() || "hello@example.com";
  const services = $("#bizServices").value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const cards = services.length ? services : ["Strategy session - 90", "Implementation sprint - 600", "Monthly support - 1200"];
  $("#siteOutput").value = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(name)}</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; color: #172033; background: #fbfcfe; }
    header { min-height: 72vh; display: grid; align-content: center; padding: 48px 8vw; background: linear-gradient(135deg, #dbeafe, #dcfce7); }
    nav { display: flex; justify-content: space-between; gap: 16px; margin-bottom: 12vh; font-weight: 800; }
    h1 { font-size: clamp(42px, 7vw, 84px); margin: 0; max-width: 900px; }
    p { font-size: 20px; line-height: 1.6; max-width: 680px; }
    section { padding: 44px 8vw; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
    .card { border: 1px solid #d9dee8; border-radius: 8px; padding: 18px; background: white; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <header>
    <nav><span>${escapeHtml(name)}</span><span>${escapeHtml(city)}</span></nav>
    <h1>${escapeHtml(name)}</h1>
    <p>${escapeHtml(offer)} in ${escapeHtml(city)}. Clear pricing, quick booking, and practical results.</p>
  </header>
  <section>
    <h2>Services</h2>
    <div class="grid">
      ${cards.map((item) => `<article class="card"><strong>${escapeHtml(item)}</strong></article>`).join("\n      ")}
    </div>
  </section>
  <section>
    <h2>Book</h2>
    <p>Email <a href="mailto:${escapeHtml(contact)}">${escapeHtml(contact)}</a> to get started.</p>
  </section>
</body>
</html>`;
}

function initChangelog() {
  $("#sampleChange").addEventListener("click", () => {
    $("#changeInput").value = `feat: add CSV importer
fix: handle empty amount values
docs: update README quickstart
refactor: simplify parser
chore: bump version`;
    $("#buildChange").click();
  });
  $("#buildChange").addEventListener("click", buildChangelog);
}

function buildChangelog() {
  $("#changeOutput").value = buildChangelogNotes($("#changeInput").value, today()).markdown;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
  navigator.serviceWorker.register("./sw.js").catch((error) => {
    console.warn("Offline cache registration failed", error);
  });
}

function init() {
  initTabs();
  initGlobalActions();
  initOps();
  initReadme();
  initFinance();
  initPrompts();
  initIssue();
  initHealth();
  initMeeting();
  initDoctor();
  initSiteStarter();
  initChangelog();
  registerServiceWorker();
}

init();
