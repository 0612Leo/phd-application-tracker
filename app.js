const STORAGE_KEY = "phd-application-tracker-v1";

const fields = [
  "entryDate",
  "articleCount",
  "researchMinutes",
  "articleTitles",
  "researchTakeaways",
  "englishMinutes",
  "englishType",
  "englishContent",
  "englishNotes",
  "professorCount",
  "applicationStage",
  "professorList",
  "applicationNotes",
  "focusScore",
  "mood",
  "tomorrowPriority",
  "dailyWin",
  "nextStep",
];

const form = document.querySelector("#trackerForm");
const toast = document.querySelector("#toast");
const focusScore = document.querySelector("#focusScore");
const focusLabel = document.querySelector("#focusLabel");
const entryDate = document.querySelector("#entryDate");

const todayKey = () => new Date().toISOString().slice(0, 10);

function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function numberValue(id) {
  return Number(document.querySelector(`#${id}`).value || 0);
}

function textValue(id) {
  return document.querySelector(`#${id}`).value.trim();
}

function setValue(id, value) {
  const element = document.querySelector(`#${id}`);
  element.value = value ?? "";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function collectForm() {
  return {
    date: textValue("entryDate"),
    articleCount: numberValue("articleCount"),
    researchMinutes: numberValue("researchMinutes"),
    articleTitles: textValue("articleTitles"),
    researchTakeaways: textValue("researchTakeaways"),
    englishMinutes: numberValue("englishMinutes"),
    englishType: textValue("englishType"),
    englishContent: textValue("englishContent"),
    englishNotes: textValue("englishNotes"),
    professorCount: numberValue("professorCount"),
    applicationStage: textValue("applicationStage"),
    professorList: textValue("professorList"),
    applicationNotes: textValue("applicationNotes"),
    focusScore: numberValue("focusScore"),
    mood: textValue("mood"),
    tomorrowPriority: textValue("tomorrowPriority"),
    dailyWin: textValue("dailyWin"),
    nextStep: textValue("nextStep"),
    updatedAt: new Date().toISOString(),
  };
}

function applyEntry(entry = {}) {
  fields.forEach((id) => {
    if (id === "entryDate") return;
    setValue(id, entry[id]);
  });
  focusScore.value = entry.focusScore || 3;
  updateFocusLabel();
}

function loadSelectedDate() {
  const entries = loadEntries();
  applyEntry(entries[entryDate.value]);
  updateDashboard();
}

function completionScore(entry) {
  if (!entry) return 0;
  const researchDone = entry.articleCount > 0 || entry.researchTakeaways;
  const englishDone = entry.englishMinutes > 0 || entry.englishContent;
  const applicationDone = entry.professorCount > 0 || entry.applicationNotes;
  return Math.round(
    ([researchDone, englishDone, applicationDone].filter(Boolean).length / 3) * 100,
  );
}

function updateTodayMetrics(entry) {
  document.querySelector("#metricArticles").textContent = entry?.articleCount || 0;
  document.querySelector("#metricEnglish").textContent = entry?.englishMinutes || 0;
  document.querySelector("#metricProfessors").textContent = entry?.professorCount || 0;
  document.querySelector("#metricScore").textContent = `${completionScore(entry)}%`;
}

function updateFocusLabel() {
  focusLabel.textContent = `${focusScore.value} / 5`;
}

function getRecentEntries(entries, days = 7) {
  const start = new Date(entryDate.value || todayKey());
  start.setDate(start.getDate() - days + 1);

  return Object.values(entries).filter((entry) => {
    const date = new Date(entry.date);
    return date >= start && date <= new Date(entryDate.value || todayKey());
  });
}

function setBar(id, value, target) {
  const percent = Math.max(4, Math.min(100, Math.round((value / target) * 100)));
  document.querySelector(id).style.width = value > 0 ? `${percent}%` : "0";
}

function updateWeeklyStats(entries) {
  const recent = getRecentEntries(entries);
  const totals = recent.reduce(
    (sum, entry) => {
      sum.articles += entry.articleCount || 0;
      sum.english += entry.englishMinutes || 0;
      sum.professors += entry.professorCount || 0;
      return sum;
    },
    { articles: 0, english: 0, professors: 0 },
  );

  document.querySelector("#weekArticles").textContent = `${totals.articles} 篇`;
  document.querySelector("#weekEnglish").textContent = `${totals.english} 分钟`;
  document.querySelector("#weekProfessors").textContent = `${totals.professors} 位`;
  setBar("#articleBar", totals.articles, 14);
  setBar("#englishBar", totals.english, 420);
  setBar("#professorBar", totals.professors, 10);
}

function compactText(text, fallback) {
  if (!text) return fallback;
  return text.length > 72 ? `${text.slice(0, 72)}...` : text;
}

function renderHistory(entries) {
  const container = document.querySelector("#historyList");
  const sorted = Object.values(entries).sort((a, b) => b.date.localeCompare(a.date));

  if (!sorted.length) {
    container.innerHTML = '<div class="empty-state">还没有记录。今天先留下第一条。</div>';
    return;
  }

  container.innerHTML = sorted
    .map(
      (entry) => `
        <article class="history-card">
          <header>
            <h3>${entry.date}</h3>
            <button type="button" data-load-date="${entry.date}">查看</button>
          </header>
          <div class="history-stats">
            <span>文章 ${entry.articleCount || 0}</span>
            <span>英语 ${entry.englishMinutes || 0} 分钟</span>
            <span>套磁 ${entry.professorCount || 0}</span>
          </div>
          <p>${compactText(entry.dailyWin || entry.researchTakeaways, "暂无复盘")}</p>
        </article>
      `,
    )
    .join("");
}

function updateDashboard() {
  const entries = loadEntries();
  const selectedEntry = entries[entryDate.value] || collectForm();
  updateTodayMetrics(selectedEntry);
  updateWeeklyStats(entries);
  renderHistory(entries);
}

function downloadExport(entries) {
  const blob = new Blob([JSON.stringify(entries, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `phd-application-tracker-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const entry = collectForm();
  const entries = loadEntries();
  entries[entry.date] = entry;
  saveEntries(entries);
  updateDashboard();
  showToast("已保存今天的记录");
});

entryDate.addEventListener("change", loadSelectedDate);
focusScore.addEventListener("input", updateFocusLabel);

document.querySelector("#clearDayButton").addEventListener("click", () => {
  const entries = loadEntries();
  delete entries[entryDate.value];
  saveEntries(entries);
  applyEntry({});
  updateDashboard();
  showToast("已清空当天记录");
});

document.querySelector("#exportButton").addEventListener("click", () => {
  downloadExport(loadEntries());
});

document.querySelector("#importInput").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;

  try {
    const imported = JSON.parse(await file.text());
    if (!imported || typeof imported !== "object" || Array.isArray(imported)) {
      throw new Error("Invalid tracker export");
    }

    const entries = loadEntries();
    saveEntries({ ...entries, ...imported });
    loadSelectedDate();
    showToast("已导入记录");
  } catch {
    showToast("导入失败，请选择有效的 JSON 文件");
  } finally {
    event.target.value = "";
  }
});

document.querySelector("#deleteAllButton").addEventListener("click", () => {
  const confirmed = window.confirm("确定删除所有记录吗？这个操作无法撤销。");
  if (!confirmed) return;
  saveEntries({});
  applyEntry({});
  updateDashboard();
  showToast("已删除全部记录");
});

document.querySelector("#historyList").addEventListener("click", (event) => {
  const button = event.target.closest("[data-load-date]");
  if (!button) return;
  entryDate.value = button.dataset.loadDate;
  loadSelectedDate();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

fields.forEach((id) => {
  const element = document.querySelector(`#${id}`);
  if (!element || id === "entryDate") return;
  element.addEventListener("input", updateDashboard);
});

entryDate.value = todayKey();
loadSelectedDate();
