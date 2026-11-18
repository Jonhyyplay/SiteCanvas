/* jshint esversion: 11, browser: true, unused: false, undef: false */

// --- 1. DADOS E ESTADO INICIAL ---

const STATE_KEY = "SiteCanvas_v2";

const blockTypes = [
  {
    type: "title",
    icon: "type",
    label: "Título",
    defaultProps: {
      content: "Novo Título",
      imageUrl: "",
      styles: {
        fontSize: "2.5rem",
        color: "#1e293b",
        fontWeight: "bold",
        margin: "0",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: "15px",
      },
    },
  },
  {
    type: "text",
    icon: "align-left",
    label: "Texto",
    defaultProps: {
      content: "Digite seu texto aqui. Este é um parágrafo normal.",
      styles: {
        fontSize: "1.1rem",
        color: "#475569",
        lineHeight: "1.6",
        margin: "0",
        textAlign: "left",
      },
    },
  },
  {
    type: "image",
    icon: "image",
    label: "Imagem",
    defaultProps: {
      src: "",
      alt: "Imagem decorativa",
      styles: { width: "100%", borderRadius: "12px", margin: "0" },
    },
  },
  {
    type: "button",
    icon: "play-circle",
    label: "Botão",
    defaultProps: {
      content: "Clique Aqui",
      href: "",
      styles: {
        backgroundColor: "#8b5cf6",
        color: "#ffffff",
        padding: "14px 28px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "1.1rem",
        display: "inline-block",
        margin: "0",
        textAlign: "center",
        textDecoration: "none",
      },
    },
  },
  {
    type: "link",
    icon: "link",
    label: "Link",
    defaultProps: {
      content: "Exemplo de Texto do Link",
      href: "https://exemplo.com",
      styles: {
        color: "#3b82f6",
        textDecoration: "underline",
        fontSize: "1.1rem",
        margin: "0",
        display: "inline-block",
      },
    },
  },
  {
    type: "list",
    icon: "list",
    label: "Lista",
    defaultProps: {
      content: "Primeiro item\nSegundo item\nTerceiro item",
      styles: {
        paddingLeft: "24px",
        margin: "0",
        color: "#475569",
        fontSize: "1.1rem",
      },
    },
  },
  {
    type: "card",
    icon: "layout",
    label: "Card",
    defaultProps: {
      cardTitle: "Título do Card",
      cardSubtitle: "Subtítulo",
      content: "Texto descritivo para o seu card.",
      cardImage: "",
      cardButton: "Saber mais",
      cardButtonLink: "#",
      cardTitleColor: "#1e293b",
      cardSubtitleColor: "#64748b",
      cardTextColor: "#475569",
      cardButtonBgColor: "#4f46e5",
      cardButtonTextColor: "#ffffff",
      styles: {
        padding: "24px",
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        margin: "0",
        textAlign: "left",
      },
    },
  },
  {
    type: "separator",
    icon: "minus",
    label: "Linha",
    defaultProps: {
      styles: {
        border: "none",
        borderTop: "2px dashed #cbd5e1",
        margin: "15px 0",
      },
    },
  },
  {
    type: "video",
    icon: "youtube",
    label: "Vídeo",
    defaultProps: {
      src: "",
      styles: {
        width: "100%",
        aspectRatio: "16/9",
        height: "auto",
        borderRadius: "12px",
        margin: "0",
        border: "none",
      },
    },
  },
];

const initialMissions = [
  { id: "m1", text: "Editar um título ou texto", completed: false },
  { id: "m2", text: "Mudar a cor de algum elemento", completed: false },
  { id: "m3", text: "Adicionar uma imagem no site", completed: false },
  { id: "m4", text: "Alterar a largura de um bloco", completed: false },
  {
    id: "m5",
    text: "Personalizar um Card (Título, Imagem...)",
    completed: false,
  },
  {
    id: "m6",
    text: "Configurar um Link de Destino num botão",
    completed: false,
  },
  { id: "m7", text: "Ver o Código HTML/CSS gerado", completed: false },
  { id: "m8", text: "Visualizar o site pronto", completed: false },
];

const DEFAULT_PAGE_SETTINGS = {
  backgroundColor: "#ffffff",
  backgroundImage: "",
  backgroundSize: "cover",
};

let state = {
  elements: [],
  selectedId: null,
  missions: [],
  pageSettings: { ...DEFAULT_PAGE_SETTINGS },
};

let appHistory = [];
let appHistoryIndex = -1;
let historyDebounceTimer = null;

// --- 2. FUNÇÕES BASE E PERSISTÊNCIA ---

function replaceIcons() {
  if (typeof feather !== "undefined") feather.replace();
}

function generateId() {
  return "el_" + Math.random().toString(36).slice(2, 11);
}

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function pushToHistory() {
  if (historyDebounceTimer) {
    clearTimeout(historyDebounceTimer);
    historyDebounceTimer = null;
  }
  const snapshot = JSON.stringify({
    elements: state.elements,
    pageSettings: state.pageSettings,
  });
  if (appHistory[appHistoryIndex] === snapshot) return;

  appHistory = appHistory.slice(0, appHistoryIndex + 1);
  appHistory.push(snapshot);
  if (appHistory.length > 30) appHistory.shift();
  appHistoryIndex = appHistory.length - 1;
  saveState();
}

function scheduleHistoryPush() {
  if (historyDebounceTimer) clearTimeout(historyDebounceTimer);
  historyDebounceTimer = setTimeout(pushToHistory, 400);
}

function loadState() {
  const savedData = localStorage.getItem(STATE_KEY);
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      state.elements = parsed.elements || [];
      state.missions = parsed.missions || cloneData(initialMissions);
      state.pageSettings = {
        ...DEFAULT_PAGE_SETTINGS,
        ...(parsed.pageSettings || {}),
      };
    } catch (e) {
      state.elements = [];
      state.missions = cloneData(initialMissions);
      state.pageSettings = { ...DEFAULT_PAGE_SETTINGS };
    }
  } else {
    state.elements = [];
    state.missions = cloneData(initialMissions);
    state.pageSettings = { ...DEFAULT_PAGE_SETTINGS };
  }

  appHistory = [];
  appHistoryIndex = -1;
  pushToHistory();
  renderAll();
}

function saveState() {
  updateProgress();
  try {
    localStorage.setItem(
      STATE_KEY,
      JSON.stringify({
        elements: state.elements,
        missions: state.missions,
        pageSettings: state.pageSettings,
      }),
    );
  } catch (e) {
    console.warn(
      "Memória local cheia. O Auto-Save foi pausado, mas o site continua a funcionar.",
    );
  }
}

function handleImageUpload(inputElement, callback) {
  const file = inputElement.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => callback(e.target.result);
  reader.readAsDataURL(file);
}

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

function formatVideoUrl(rawInput) {
  let url = (rawInput || "").trim();
  const iframeSrcMatch = url.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeSrcMatch) url = iframeSrcMatch[1];

  const ytId = extractYouTubeId(url);
  if (ytId) return `https://www.youtube.com/embed/${ytId}`;
  return url;
}

function isDirectVideoFile(url) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url) || url.startsWith("data:video/");
}

function buildYouTubeLocalCard(ytId, styleAttr, isInteractive = true) {
  const clickAttr = isInteractive ? "" : ' onclick="event.preventDefault()"';
  const cardStyle = styleAttr.replace(
    'style="',
    "style=\"position: relative; display: flex; align-items: center; justify-content: center; background: #0f172a url('https://i.ytimg.com/vi/" +
      ytId +
      "/hqdefault.jpg') center/cover no-repeat; text-decoration: none; overflow: hidden; min-height: 250px; ",
  );
  return `<a href="https://www.youtube.com/watch?v=${ytId}" target="_blank" rel="noopener noreferrer"${clickAttr}${cardStyle}>
    <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.35);"></div>
    <div style="position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 10px;">
      <div style="width: 68px; height: 48px; background: #ff0000; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(0,0,0,0.4);">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="white"><polygon points="9.5 7.5 16.5 12 9.5 16.5 9.5 7.5"></polygon></svg>
      </div>
      <span style="background: rgba(15,23,42,0.85); color: #fff; font-family: sans-serif; font-size: 0.8rem; font-weight: 600; padding: 6px 14px; border-radius: 99px; border: 1px solid rgba(255,255,255,0.2);">Assistir no YouTube (Modo Arquivo Local)</span>
    </div>
  </a>`;
}

// --- 3. GAMIFICAÇÃO E NOTIFICAÇÕES ---

function showToast(missionText) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className =
      "fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className =
    "bg-slate-900 text-white p-4 rounded-xl shadow-2xl min-w-[300px] border border-slate-700 relative overflow-hidden toast-enter";
  toast.innerHTML = `
    <div class="flex items-center gap-3 mb-2">
      <div class="bg-emerald-500/20 p-1.5 rounded-full"><i data-feather="award" class="w-5 h-5 text-emerald-400"></i></div>
      <div>
        <h4 class="text-sm font-bold text-slate-100">Missão Concluída!</h4>
        <p class="text-xs text-slate-400">${missionText}</p>
      </div>
    </div>
    <div class="absolute bottom-0 left-0 h-1 bg-slate-700 w-full">
      <div class="h-full bg-emerald-400 toast-progress"></div>
    </div>`;

  container.appendChild(toast);
  replaceIcons();

  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease-in forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function checkMission(missionId) {
  const mission = state.missions.find((m) => m.id === missionId);
  if (mission && !mission.completed) {
    mission.completed = true;
    saveState();
    renderMissions();
    showToast(mission.text);
    setTimeout(() => {
      const li = document.getElementById(`mission-${missionId}`);
      if (li) {
        li.classList.add("mission-complete-anim");
        setTimeout(() => li.classList.remove("mission-complete-anim"), 500);
      }
    }, 50);
  }
}

function updateProgress() {
  const total = state.missions.length;
  if (!total) return;
  const completed = state.missions.filter((m) => m.completed).length;
  const percentage = Math.round((completed / total) * 100);
  document.getElementById("progress-text").innerText = `${percentage}%`;
  document.getElementById("progress-bar").style.width = `${percentage}%`;
}

// --- 4. RENDERIZAÇÃO DO CANVAS E ELEMENTOS ---

function addBlock(type, targetIndex = state.elements.length) {
  const block = blockTypes.find((b) => b.type === type);
  if (!block) return;

  const newEl = {
    id: generateId(),
    type: block.type,
    ...cloneData(block.defaultProps),
  };
  state.elements.splice(targetIndex, 0, newEl);
  state.selectedId = newEl.id;

  if (block.type === "image") checkMission("m3");
  pushToHistory();
  renderAll();
}

function renderComponentsGrid() {
  const grid = document.getElementById("components-grid");
  grid.innerHTML = "";
  blockTypes.forEach((block) => {
    const btn = document.createElement("button");
    btn.className =
      "flex flex-col items-center justify-center p-3 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all group shadow-sm component-drag-item";
    btn.dataset.type = block.type;
    btn.innerHTML = `<i data-feather="${block.icon}" class="w-6 h-6 mb-2"></i><span class="text-xs font-semibold">${block.label}</span>`;
    btn.onclick = () => {
      addBlock(block.type);
      const mainArea = document.getElementById("main-area");
      mainArea.scrollTop = mainArea.scrollHeight;
    };
    grid.appendChild(btn);
  });
  replaceIcons();
}

function renderMissions() {
  const list = document.getElementById("missions-list");
  list.innerHTML = "";
  state.missions.forEach((mission) => {
    const li = document.createElement("li");
    li.id = `mission-${mission.id}`;
    const isDone = mission.completed;
    const stateClasses = isDone
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : "bg-white border-slate-200 text-slate-600";
    li.className = `p-3 rounded-xl flex items-start gap-3 border transition-all duration-300 relative overflow-hidden ${stateClasses}`;
    const iconHTML = isDone
      ? `<i data-feather="check-circle" class="w-5 h-5 text-emerald-500 mt-0.5 shrink-0"></i>`
      : `<div class="w-5 h-5 border-2 border-slate-300 rounded-full mt-0.5 shrink-0"></div>`;
    li.innerHTML = `${iconHTML}<span class="text-sm font-medium leading-tight ${isDone ? "line-through opacity-70" : ""}">${mission.text}</span>`;
    list.appendChild(li);
  });
  replaceIcons();
}

function getElementHTMLContent(el, isExport = false) {
  const innerStyles = { ...el.styles };
  delete innerStyles.width;

  const styleStr = Object.entries(innerStyles)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v};`)
    .join(" ");

  const styleAttr = ` style="box-sizing: border-box; width: 100%; max-width: 100%; ${styleStr}"`;

  switch (el.type) {
    case "title": {
      const imgHTML = el.imageUrl
        ? `<img src="${el.imageUrl}" style="height: 1.2em; border-radius: 8px; margin-right: 10px;">`
        : "";
      let titleStyle = styleAttr;
      if (el.styles.textAlign === "center")
        titleStyle = titleStyle.replace(";", "; justify-content: center;");
      else if (el.styles.textAlign === "right")
        titleStyle = titleStyle.replace(";", "; justify-content: flex-end;");
      return `<h1${titleStyle}>${imgHTML}<span style="word-break: break-word;">${el.content}</span></h1>`;
    }

    case "text": {
      const textStyle = styleAttr.replace(
        'style="',
        'style="word-break: break-word; white-space: pre-wrap; ',
      );
      return `<p${textStyle}>${el.content}</p>`;
    }

    case "image": {
      if (!el.src || el.src.trim() === "") {
        if (isExport) return "";
        const phImgStyle = styleAttr.replace(
          'style="',
          'style="background-color: #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #cbd5e1; min-height: 250px; ',
        );
        return `<div${phImgStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px; color: #94a3b8;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          <span style="color: #64748b; font-weight: 600; font-family: sans-serif; font-size: 0.9rem;">Adicione uma imagem no painel</span>
        </div>`;
      }
      return `<img src="${el.src}" alt="${el.alt || "Imagem"}"${styleAttr} />`;
    }

    case "button":
    case "link": {
      const isRealLink = el.href && el.href !== "#";
      const target =
        (el.type === "link" || isRealLink) && isExport
          ? ' target="_blank"'
          : "";
      const href = isExport
        ? ` href="${el.href || "#"}"`
        : ` href="#" onclick="event.preventDefault()"`;
      return `<a${href}${target}${styleAttr}>${el.content}</a>`;
    }

    case "list": {
      const items = (el.content || "")
        .split("\n")
        .filter((item) => item.trim())
        .map(
          (item) =>
            `  <li style="list-style-type: disc; margin-left: 20px; word-break: break-word;">${item}</li>`,
        )
        .join("\n");
      return `<ul${styleAttr}>\n${items}\n</ul>`;
    }

    case "card": {
      const cImg = el.cardImage
        ? `<img src="${el.cardImage}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px; display: block;">`
        : "";
      const cTit = el.cardTitle
        ? `<h3 style="font-size: 1.25em; font-weight: bold; color: ${el.cardTitleColor || "#1e293b"}; margin-bottom: 4px; word-break: break-word;">${el.cardTitle}</h3>`
        : "";
      const cSub = el.cardSubtitle
        ? `<h4 style="font-size: 0.9em; color: ${el.cardSubtitleColor || "#64748b"}; margin-bottom: 12px; word-break: break-word;">${el.cardSubtitle}</h4>`
        : "";
      const cTxt = el.content
        ? `<p style="font-size: 1em; color: ${el.cardTextColor || "#475569"}; margin-bottom: 16px; word-break: break-word; white-space: pre-wrap;">${el.content}</p>`
        : "";

      const isRealCardLink = el.cardButtonLink && el.cardButtonLink !== "#";
      const cardTarget = isRealCardLink && isExport ? ' target="_blank"' : "";
      const cBtnHref = isExport ? el.cardButtonLink || "#" : "#";
      const cBtnClick = !isExport ? ' onclick="event.preventDefault()"' : "";

      const cBtn = el.cardButton
        ? `<a href="${cBtnHref}"${cardTarget}${cBtnClick} style="display: inline-block; padding: 8px 16px; background-color: ${el.cardButtonBgColor || "#4f46e5"}; color: ${el.cardButtonTextColor || "#ffffff"}; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 0.9em;">${el.cardButton}</a>`
        : "";

      const cardStyle = styleAttr.replace(
        'style="',
        'style="height: 100%; overflow: hidden; display: flex; flex-direction: column; ',
      );
      return `<div${cardStyle}>\n  ${cImg}\n  ${cTit}\n  ${cSub}\n  ${cTxt}\n  <div style="margin-top: auto;">${cBtn}</div>\n</div>`;
    }

    case "separator":
      return `<hr${styleAttr} />`;

    case "video": {
      if (!el.src || el.src.trim() === "") {
        if (isExport) return "";
        const phStyle = styleAttr.replace(
          'style="',
          'style="background-color: #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #cbd5e1; ',
        );
        return `<div${phStyle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px; color: #94a3b8;"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
          <span style="color: #64748b; font-weight: 600; font-family: sans-serif; font-size: 0.9rem;">Adicione um link de vídeo no painel</span>
        </div>`;
      }
      if (isDirectVideoFile(el.src)) {
        return `<video src="${el.src}" controls${styleAttr}></video>`;
      }
      const ytId = extractYouTubeId(el.src);
      if (ytId && window.location.protocol === "file:" && isExport !== "code") {
        return buildYouTubeLocalCard(ytId, styleAttr, Boolean(isExport));
      }
      const ytAttr = ytId ? ` data-yt-id="${ytId}"` : "";
      return `<iframe src="${el.src}"${ytAttr} title="Player de vídeo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen${styleAttr}></iframe>`;
    }

    default:
      return "";
  }
}

function updateCanvasBackground() {
  const canvasBg = document.getElementById("canvas-bg");
  canvasBg.style.backgroundColor = state.pageSettings.backgroundColor;
  if (state.pageSettings.backgroundImage) {
    canvasBg.style.backgroundImage = `url('${state.pageSettings.backgroundImage}')`;
    canvasBg.style.backgroundSize =
      state.pageSettings.backgroundSize || "cover";
    canvasBg.style.backgroundPosition = "center";
    canvasBg.style.backgroundAttachment = "fixed";
  } else {
    canvasBg.style.backgroundImage = "none";
  }
}

function renderCanvas() {
  const canvas = document.getElementById("canvas-content");
  canvas.innerHTML = "";
  Object.assign(canvas.style, {
    display: "flex",
    flexWrap: "wrap",
    alignContent: "flex-start",
    alignItems: "stretch",
  });

  updateCanvasBackground();

  if (state.elements.length === 0) {
    canvas.innerHTML = `
      <div class="empty-state-msg pointer-events-none select-none h-full w-full flex flex-col items-center justify-center text-slate-400 mt-20 bg-white/80 p-8 rounded-xl backdrop-blur-sm shadow-[0_0_25px_rgba(0,0,0,0.15)] inline-block mx-auto text-center">
        <i data-feather="layout" class="w-16 h-16 mb-4 opacity-40 mx-auto"></i>
        <p class="text-lg font-bold text-slate-600">Seu site está vazio!</p>
        <p class="text-sm mt-2">Arraste os blocos da esquerda para cá.</p>
      </div>`;
    replaceIcons();
    return;
  }

  state.elements.forEach((el) => {
    const wrapper = document.createElement("div");
    wrapper.className = `canvas-element-wrapper ${state.selectedId === el.id ? "selected" : ""}`;
    wrapper.dataset.id = el.id;
    Object.assign(wrapper.style, {
      width: el.styles.width || "100%",
      padding: "4px",
      boxSizing: "border-box",
    });

    const contentDiv = document.createElement("div");
    contentDiv.className = "canvas-element-inner";
    Object.assign(contentDiv.style, { width: "100%", height: "100%" });
    contentDiv.innerHTML = getElementHTMLContent(el, false);
    wrapper.appendChild(contentDiv);

    const controls = document.createElement("div");
    controls.className = "element-controls";

    const btnDel = document.createElement("div");
    btnDel.className = "control-btn delete";
    btnDel.innerHTML = '<i data-feather="trash-2"></i>';
    btnDel.title = "Apagar";
    btnDel.onclick = (e) => {
      e.stopPropagation();
      deleteElement(el.id);
    };

    controls.appendChild(btnDel);
    wrapper.appendChild(controls);

    wrapper.onclick = (e) => {
      e.stopPropagation();
      if (state.selectedId !== el.id) {
        state.selectedId = el.id;
        document
          .querySelectorAll(".canvas-element-wrapper")
          .forEach((w) =>
            w.classList.toggle("selected", w.dataset.id === el.id),
          );
        renderPropertiesPanel();
      }
    };
    canvas.appendChild(wrapper);
  });
  replaceIcons();
}

function updateSingleCanvasElement(el) {
  const wrapper = document.querySelector(
    `.canvas-element-wrapper[data-id="${el.id}"]`,
  );
  if (!wrapper) return renderCanvas();
  wrapper.style.width = el.styles.width || "100%";
  const contentDiv = wrapper.querySelector(".canvas-element-inner");
  if (contentDiv) contentDiv.innerHTML = getElementHTMLContent(el, false);
}

document.getElementById("main-area").onclick = () => {
  if (state.selectedId !== null) {
    state.selectedId = null;
    document
      .querySelectorAll(".canvas-element-wrapper.selected")
      .forEach((w) => w.classList.remove("selected"));
    renderPropertiesPanel();
  }
};

// --- 5. MANIPULAÇÃO DE ELEMENTOS E PAINEL DE PROPRIEDADES ---

function deleteElement(id) {
  state.elements = state.elements.filter((el) => el.id !== id);
  if (state.selectedId === id) state.selectedId = null;
  pushToHistory();
  renderAll();
}

function updateElement(id, key, value, isStyle = false, redrawPanel = false) {
  const el = state.elements.find((e) => e.id === id);
  if (!el) return;

  if (isStyle) {
    el.styles[key] = value;
    if (key === "color" || key === "backgroundColor") checkMission("m2");
    if (key === "width") checkMission("m4");
  } else {
    el[key] = value;
    if (
      key === "content" &&
      !value.includes("Novo Título") &&
      !value.includes("Digite seu texto")
    )
      checkMission("m1");
    if (key.endsWith("Color")) checkMission("m2");
    if (
      (key === "src" && el.type === "image" && value) ||
      (key === "imageUrl" && value) ||
      (key === "cardImage" && value)
    )
      checkMission("m3");
    if (key === "href" || key === "cardButtonLink") checkMission("m6");
    if (el.type === "card" && (key.startsWith("card") || key === "content"))
      checkMission("m5");
  }

  updateSingleCanvasElement(el);
  if (redrawPanel) {
    pushToHistory();
    renderPropertiesPanel();
  } else {
    scheduleHistoryPush();
  }
}

const STYLE_OPTIONS = {
  widths: [
    ["100%", "100% (Cheia)"],
    ["50%", "50% (Metade)"],
    ["33.33%", "33% (Um Terço)"],
    ["25%", "25% (Um Quarto)"],
  ],
  fontSizes: [
    ["0.875rem", "Pequeno"],
    ["1.1rem", "Normal"],
    ["1.5rem", "Grande"],
    ["2.5rem", "Muito Grande"],
    ["3.5rem", "Gigante"],
  ],
  fontFamilies: [
    ["system-ui, -apple-system, sans-serif", "Moderna (Padrão)"],
    ["Arial, Helvetica, sans-serif", "Clara (Arial)"],
    ["'Times New Roman', Times, serif", "Clássica (Serifada)"],
    ["'Courier New', Courier, monospace", "Código (Monospace)"],
    ["'Comic Sans MS', 'Marker Felt', sans-serif", "Divertida (Quadrinhos)"],
    ["Impact, fantasy", "Forte (Impact)"],
  ],
  alignments: [
    ["left", "Esquerda"],
    ["center", "Centro"],
    ["right", "Direita"],
  ],
  radii: [
    ["0px", "Quadradas"],
    ["8px", "Leves"],
    ["16px", "Arredondadas"],
    ["99px", "Pílula"],
  ],
  bgSizes: [
    ["cover", "Preencher Tela Inteira"],
    ["contain", "Ajustar ao Tamanho"],
    ["auto", "Tamanho Original"],
  ],
};

const ui = {
  label(text) {
    const el = document.createElement("label");
    el.className = "block text-xs font-bold text-slate-500 uppercase mb-2";
    el.textContent = text;
    return el;
  },

  textInput(value, onInput, opts = {}) {
    const input = document.createElement("input");
    input.type = "text";
    input.className = `w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:border-indigo-500 outline-none transition ${opts.mono ? "font-mono text-xs" : ""} ${opts.className || ""}`;
    input.value = value || "";
    if (opts.placeholder) input.placeholder = opts.placeholder;
    input.oninput = (e) => onInput(e.target.value);
    return input;
  },

  textarea(value, onInput, rows = 4) {
    const ta = document.createElement("textarea");
    ta.rows = rows;
    ta.className =
      "w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition";
    ta.value = value || "";
    ta.oninput = (e) => onInput(e.target.value);
    return ta;
  },

  colorInput(value, onInput, title = "", fullWidth = false) {
    const input = document.createElement("input");
    input.type = "color";
    input.className = fullWidth
      ? "w-full h-8 cursor-pointer rounded border border-slate-200"
      : "w-10 h-10 p-0.5 border border-slate-300 rounded-lg cursor-pointer flex-shrink-0";
    input.value = value || "#000000";
    if (title) input.title = title;
    input.oninput = (e) => onInput(e.target.value);
    return input;
  },

  select(optionsList, selectedValue, onChange) {
    const sel = document.createElement("select");
    sel.className =
      "w-full p-2 border border-slate-300 rounded text-sm outline-none";
    optionsList.forEach(([val, text]) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = text;
      opt.selected = val === selectedValue;
      sel.appendChild(opt);
    });
    sel.onchange = (e) => onChange(e.target.value);
    return sel;
  },

  addField(parent, labelText, controlEl) {
    parent.append(this.label(labelText), controlEl);
  },

  addStyleRow(parent, labelText, controlEl) {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between mb-3";
    const lbl = document.createElement("label");
    lbl.className = "text-sm font-medium text-slate-600";
    lbl.textContent = labelText;
    const rightCol = document.createElement("div");
    rightCol.className = "w-1/2";
    rightCol.appendChild(controlEl);
    row.append(lbl, rightCol);
    parent.appendChild(row);
  },

  imageUploadBox({
    title,
    icon = "upload-cloud",
    currentValue,
    onUpload,
    onRemove,
    removeLabel = "Remover Imagem",
    hint = "",
    theme = "indigo",
    accept = "image/png, image/jpeg, image/jpg",
  }) {
    const box = document.createElement("div");
    const isIndigo = theme === "indigo";
    box.className = isIndigo
      ? "p-3 bg-indigo-50 border border-indigo-100 rounded-xl relative mb-4"
      : "p-3 bg-slate-50 border border-slate-200 rounded-xl relative mb-4";

    const lbl = document.createElement("label");
    lbl.className = `block text-xs font-bold ${isIndigo ? "text-indigo-700" : "text-slate-700"} uppercase mb-2`;
    lbl.innerHTML = `<i data-feather="${icon}" class="w-3 h-3 inline"></i> ${title}`;
    box.appendChild(lbl);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = accept;
    fileInput.className = isIndigo
      ? "text-xs w-full text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
      : "text-xs w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer";
    fileInput.onchange = () => handleImageUpload(fileInput, onUpload);
    box.appendChild(fileInput);

    if (hint) {
      const hintEl = document.createElement("div");
      hintEl.className = "text-[10px] text-slate-400 mt-2";
      hintEl.textContent = hint;
      box.appendChild(hintEl);
    }

    if (currentValue) {
      const removeBtn = document.createElement("button");
      removeBtn.className =
        "w-full mt-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-md text-xs font-bold transition flex items-center justify-center gap-1";
      removeBtn.innerHTML = `<i data-feather="trash-2" class="w-3 h-3 inline"></i> ${removeLabel}`;
      removeBtn.onclick = onRemove;
      box.appendChild(removeBtn);
    }
    return box;
  },
};

function renderPropertiesPanel() {
  const panel = document.getElementById("properties-panel");
  panel.innerHTML = "";

  const el = state.elements.find((e) => e.id === state.selectedId);

  if (!el) {
    panel.insertAdjacentHTML(
      "beforeend",
      `<div class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-6 inline-block">Design da Página</div>`,
    );
    const container = document.createElement("div");
    container.className = "space-y-6";

    const bgGroup = document.createElement("div");
    const bgColorInput = ui.colorInput(
      state.pageSettings.backgroundColor,
      (v) => actions.updatePageSettings("backgroundColor", v),
      "Escolher Cor de Fundo",
      true,
    );
    bgColorInput.className =
      "w-full h-10 cursor-pointer rounded border border-slate-200";
    ui.addField(bgGroup, "Cor de Fundo (Página)", bgColorInput);

    const urlGroup = document.createElement("div");
    const urlValue = state.pageSettings.backgroundImage?.startsWith("data:")
      ? ""
      : state.pageSettings.backgroundImage;
    const urlInput = ui.textInput(
      urlValue,
      (v) => actions.updatePageSettings("backgroundImage", v, false),
      { mono: true, placeholder: "Ex: https://..." },
    );
    urlInput.onchange = (e) =>
      actions.updatePageSettings("backgroundImage", e.target.value, true);
    ui.addField(urlGroup, "Ou Cole o URL da Imagem", urlInput);

    const sizeGroup = document.createElement("div");
    ui.addField(
      sizeGroup,
      "Preenchimento da Imagem",
      ui.select(STYLE_OPTIONS.bgSizes, state.pageSettings.backgroundSize, (v) =>
        actions.updatePageSettings("backgroundSize", v),
      ),
    );

    container.append(
      bgGroup,
      ui.imageUploadBox({
        title: "Upload de Imagem de Fundo",
        currentValue: state.pageSettings.backgroundImage,
        removeLabel: "Remover Fundo Atual",
        onUpload: (b64) =>
          actions.updatePageSettings("backgroundImage", b64, true),
        onRemove: () => actions.updatePageSettings("backgroundImage", "", true),
      }),
      urlGroup,
      sizeGroup,
    );
    panel.appendChild(container);
    replaceIcons();
    return;
  }

  const elTypeLabel =
    blockTypes.find((b) => b.type === el.type)?.label || "Elemento";
  panel.insertAdjacentHTML(
    "beforeend",
    `<div class="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-6">Editando: ${elTypeLabel}</div>`,
  );

  const formContainer = document.createElement("div");
  formContainer.className = "space-y-6";
  const contentSection = document.createElement("div");
  const setProp =
    (key, redraw = false) =>
    (val) =>
      updateElement(el.id, key, val, false, redraw);
  const setStyle = (key) => (val) => updateElement(el.id, key, val, true);

  if (el.type === "title") {
    ui.addField(
      contentSection,
      "Texto do Título",
      ui.textInput(el.content, setProp("content"), { className: "mb-4" }),
    );
    contentSection.appendChild(
      ui.imageUploadBox({
        title: "Adicionar Ícone ao lado",
        icon: "image",
        currentValue: el.imageUrl,
        removeLabel: "Remover Ícone",
        hint: "Escolha uma imagem pequena para acompanhar o título.",
        theme: "slate",
        accept: "image/png, image/jpeg, image/jpg, image/svg+xml",
        onUpload: setProp("imageUrl", true),
        onRemove: () => updateElement(el.id, "imageUrl", "", false, true),
      }),
    );
  } else if (el.type === "button" || el.type === "link") {
    const isBtn = el.type === "button";
    ui.addField(
      contentSection,
      isBtn ? "Texto do Botão" : "Texto do Link",
      ui.textInput(el.content, setProp("content"), { className: "mb-4" }),
    );
    ui.addField(
      contentSection,
      isBtn ? "Link de Destino" : "Endereço (URL)",
      ui.textInput(el.href, setProp("href"), {
        mono: true,
        placeholder: "Ex: https://google.com",
      }),
    );
  } else if (el.type === "card") {
    contentSection.appendChild(
      ui.imageUploadBox({
        title: "Imagem do Topo",
        icon: "image",
        currentValue: el.cardImage,
        onUpload: setProp("cardImage", true),
        onRemove: () => updateElement(el.id, "cardImage", "", false, true),
      }),
    );

    const addCardRow = (
      label,
      textKey,
      colorKey,
      defaultColor,
      multiline = false,
    ) => {
      contentSection.appendChild(ui.label(label));
      const row = document.createElement("div");
      row.className = `flex gap-2 mb-3 ${multiline ? "items-start" : ""}`;
      const textCtrl = multiline
        ? ui.textarea(el[textKey], setProp(textKey), 3)
        : ui.textInput(el[textKey], setProp(textKey));
      row.append(
        textCtrl,
        ui.colorInput(el[colorKey] || defaultColor, setProp(colorKey)),
      );
      contentSection.appendChild(row);
    };

    addCardRow("Título Principal", "cardTitle", "cardTitleColor", "#1e293b");
    addCardRow("Subtítulo", "cardSubtitle", "cardSubtitleColor", "#64748b");
    addCardRow("Texto Descritivo", "content", "cardTextColor", "#475569", true);

    contentSection.appendChild(ui.label("Texto e Cores do Botão"));
    const btnRow = document.createElement("div");
    btnRow.className = "flex gap-2 mb-3";
    btnRow.append(
      ui.textInput(el.cardButton, setProp("cardButton"), {
        placeholder: "Deixe vazio para ocultar",
      }),
      ui.colorInput(
        el.cardButtonTextColor || "#ffffff",
        setProp("cardButtonTextColor"),
        "Cor da Letra do Botão",
      ),
      ui.colorInput(
        el.cardButtonBgColor || "#4f46e5",
        setProp("cardButtonBgColor"),
        "Cor de Fundo do Botão",
      ),
    );
    contentSection.appendChild(btnRow);
    ui.addField(
      contentSection,
      "Link do Botão",
      ui.textInput(el.cardButtonLink, setProp("cardButtonLink"), {
        mono: true,
        placeholder: "Ex: https://...",
      }),
    );
  } else if (el.type === "text" || el.type === "list") {
    ui.addField(
      contentSection,
      `Texto ${el.type === "list" ? "(um por linha)" : ""}`,
      ui.textarea(el.content, setProp("content"), 5),
    );
  } else if (el.type === "image") {
    contentSection.appendChild(
      ui.imageUploadBox({
        title: "Fazer Upload de Imagem",
        currentValue: el.src,
        onUpload: setProp("src", true),
        onRemove: () => updateElement(el.id, "src", "", false, true),
      }),
    );
    const urlVal = el.src?.startsWith("data:") ? "" : el.src;
    ui.addField(
      contentSection,
      "Ou Cole a URL da Imagem",
      ui.textInput(urlVal, setProp("src"), {
        mono: true,
        placeholder: "Ex: https://...",
      }),
    );
  } else if (el.type === "video") {
    ui.addField(
      contentSection,
      "Link do Vídeo",
      ui.textInput(
        el.src,
        (v) => updateElement(el.id, "src", formatVideoUrl(v)),
        {
          mono: true,
          placeholder: "Cole o link do YouTube ou vídeo (.mp4)...",
        },
      ),
    );
    const isLocalFile = window.location.protocol === "file:";
    contentSection.insertAdjacentHTML(
      "beforeend",
      `<div class="text-[10px] text-slate-400 mt-2 leading-relaxed">Aceita links do YouTube, código de incorporação (iframe) ou link direto <code>.mp4</code>.${isLocalFile ? '<br><span class="text-amber-600 font-medium">Nota: Como o arquivo está aberto localmente (file://), vídeos do YouTube exibem a capa clicável (o YouTube exige servidor HTTP/HTTPS para tocar embutido).</span>' : ""}</div>`,
    );
  }

  if (contentSection.childNodes.length > 0) {
    formContainer.appendChild(contentSection);
    formContainer.insertAdjacentHTML(
      "beforeend",
      '<hr class="border-slate-100 my-4">',
    );
  }

  // Módulo de Tamanho
  const layoutSection = document.createElement("div");
  layoutSection.innerHTML = `<h3 class="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 mt-6">Tamanho do Bloco</h3>`;
  ui.addStyleRow(
    layoutSection,
    "Largura",
    ui.select(
      STYLE_OPTIONS.widths,
      el.styles.width || "100%",
      setStyle("width"),
    ),
  );
  formContainer.appendChild(layoutSection);

  // Módulo de Aparência (CSS)
  const styleSection = document.createElement("div");
  styleSection.innerHTML = `<h3 class="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 mt-6">Aparência (CSS)</h3>`;

  if (!["image", "separator", "video", "card"].includes(el.type)) {
    ui.addStyleRow(
      styleSection,
      "Cor da Letra",
      ui.colorInput(el.styles.color || "#000000", setStyle("color"), "", true),
    );
  }
  if (["button", "card"].includes(el.type)) {
    ui.addStyleRow(
      styleSection,
      "Cor de Fundo",
      ui.colorInput(
        el.styles.backgroundColor || "#ffffff",
        setStyle("backgroundColor"),
        "",
        true,
      ),
    );
  }
  if (["title", "text", "list", "button", "link", "card"].includes(el.type)) {
    ui.addStyleRow(
      styleSection,
      "Tamanho Fonte",
      ui.select(
        STYLE_OPTIONS.fontSizes,
        el.styles.fontSize || "1rem",
        setStyle("fontSize"),
      ),
    );
    ui.addStyleRow(
      styleSection,
      "Tipo de Fonte",
      ui.select(
        STYLE_OPTIONS.fontFamilies,
        el.styles.fontFamily || "system-ui, -apple-system, sans-serif",
        setStyle("fontFamily"),
      ),
    );
  }
  if (["title", "text", "card"].includes(el.type)) {
    ui.addStyleRow(
      styleSection,
      "Alinhamento",
      ui.select(
        STYLE_OPTIONS.alignments,
        el.styles.textAlign || "left",
        setStyle("textAlign"),
      ),
    );
  }
  if (["image", "button", "card", "video"].includes(el.type)) {
    ui.addStyleRow(
      styleSection,
      "Bordas",
      ui.select(
        STYLE_OPTIONS.radii,
        el.styles.borderRadius || "0px",
        setStyle("borderRadius"),
      ),
    );
  }

  formContainer.appendChild(styleSection);
  panel.appendChild(formContainer);
  replaceIcons();
}

function renderAll() {
  renderCanvas();
  renderPropertiesPanel();
  renderMissions();
  updateProgress();
}

// --- 6. EXPORTAÇÃO E VISUALIZAÇÃO ---

const EDUCATIONAL_COMMENTS = {
  title: "<!-- A tag <h1> cria um título principal gigante! -->",
  text: "<!-- A tag <p> (parágrafo) é onde colocamos nossos textos normais. -->",
  image: "<!-- A tag <img> exibe imagens. -->",
  button: "<!-- A tag <button> ou <a> estilizada cria um botão interativo. -->",
  link: "<!-- A tag <a> (âncora) cria um link. -->",
  list: "<!-- A tag <ul> cria uma lista e <li> cria cada item dessa lista. -->",
  card: "<!-- A tag <div> agrupa conteúdos em um cartão. -->",
  separator: "<!-- A tag <hr> desenha uma linha separadora. -->",
  video:
    "<!-- A tag <iframe> embute outra página da web, como um vídeo do Youtube. -->",
};

const htmlGenerator = {
  getPageBackgroundCSS() {
    let bgStyle = `background-color: ${state.pageSettings.backgroundColor};`;
    if (state.pageSettings.backgroundImage) {
      bgStyle += ` background-image: url('${state.pageSettings.backgroundImage}'); background-size: ${state.pageSettings.backgroundSize}; background-position: center; background-attachment: fixed;`;
    }
    return bgStyle;
  },

  wrapElementHTML(el, addComment = false, exportMode = true) {
    const content = getElementHTMLContent(el, exportMode);
    if (!content) return "";
    const width = el.styles.width || "100%";
    const comment =
      addComment && EDUCATIONAL_COMMENTS[el.type]
        ? `\n    ${EDUCATIONAL_COMMENTS[el.type]}`
        : "";
    return `${comment}\n    <div style="width: ${width}; padding: 4px; box-sizing: border-box;">\n        ${content}\n    </div>`;
  },

  generateEducationalHTML(elements) {
    return (
      elements
        .map((el) => this.wrapElementHTML(el, true, "code"))
        .filter(Boolean)
        .join("\n") + "\n"
    );
  },

  generateCSSContent() {
    const bgStyle = this.getPageBackgroundCSS();
    return `body {\n    font-family: system-ui, -apple-system, sans-serif;\n    line-height: 1.5;\n    margin: 0;\n    padding: 40px 20px;\n    background-color: #f1f5f9;\n}\n\n.container {\n    width: 100%;\n    max-width: 1200px;\n    margin: 0 auto;\n    ${bgStyle}\n    padding: 40px;\n    border-radius: 16px;\n    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);\n    display: flex;\n    flex-wrap: wrap;\n    align-content: flex-start;\n    align-items: stretch;\n    overflow: hidden;\n}\n\nimg {\n    max-width: 100%;\n    height: auto;\n}`;
  },

  generateFullDocument(elements, addComments = false) {
    const bodyContent = addComments
      ? this.generateEducationalHTML(elements)
      : elements
          .map((el) => this.wrapElementHTML(el, false, "code"))
          .filter(Boolean)
          .join("\n");

    const projectData = JSON.stringify({
      elements: state.elements,
      pageSettings: state.pageSettings,
    });

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SiteCanvas</title>
    <link rel="icon" href="./images/favicon.svg" type="image/svg+xml">
    <style>
${this.generateCSSContent()}
    </style>
</head>
<body>
    <div class="container">
${bodyContent}
    </div>
    
    <!-- DADOS SECRETOS DO EDITOR (NÃO APAGUE SE QUISER IMPORTAR DE VOLTA) -->
    <script id="site-data" type="application/json">${projectData}</script>
    <script>
      if (location.protocol === "file:") {
        document.querySelectorAll("iframe[data-yt-id]").forEach(function (f) {
          var id = f.getAttribute("data-yt-id");
          var a = document.createElement("a");
          a.href = "https://www.youtube.com/watch?v=" + id;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.style.cssText = f.style.cssText + "; position:relative; display:flex; align-items:center; justify-content:center; background:#0f172a url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg) center/cover no-repeat; text-decoration:none; overflow:hidden; min-height:250px;";
          a.innerHTML = '<div style="position:absolute;inset:0;background:rgba(0,0,0,0.35)"></div><div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:10px"><div style="width:68px;height:48px;background:#ff0000;border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(0,0,0,0.4)"><svg viewBox="0 0 24 24" width="28" height="28" fill="white"><polygon points="9.5 7.5 16.5 12 9.5 16.5 9.5 7.5"></polygon></svg></div><span style="background:rgba(15,23,42,0.85);color:#fff;font-family:sans-serif;font-size:0.8rem;font-weight:600;padding:6px 14px;border-radius:99px;border:1px solid rgba(255,255,255,0.2)">Assistir no YouTube</span></div>';
          f.replaceWith(a);
        });
      }
    </script>
</body>
</html>`;
  },
};

const actions = {
  showCode() {
    checkMission("m7");
    const htmlStr = htmlGenerator.generateEducationalHTML(state.elements);
    const fullHTML = `<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n    <meta charset="UTF-8">\n    <title>SiteCanvas</title>\n    <link rel="icon" href="./images/favicon.svg" type="image/svg+xml">\n    <!-- As cores e o design estão na aba CSS ao lado! -->\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <div class="container">${htmlStr}    </div>\n</body>\n</html>`;

    const safeHTML = fullHTML.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const highlightedHTML = safeHTML.replace(
      /&lt;!--[\s\S]*?--&gt;|&lt;\/?[\w\-]+| [\w\-]+="[^"]*"/g,
      (match) => {
        if (match.startsWith("&lt;!--"))
          return `<span class="text-slate-500 italic">${match}</span>`;
        if (match.startsWith("&lt;"))
          return `<span class="text-indigo-400">${match}</span>`;
        const eqIdx = match.indexOf("=");
        return `<span class="text-blue-300">${match.substring(0, eqIdx)}</span><span class="text-emerald-300">${match.substring(eqIdx)}</span>`;
      },
    );

    document.getElementById("code-content-html").innerHTML = highlightedHTML;
    document.getElementById("code-content-css").textContent =
      htmlGenerator.generateCSSContent();
    if (typeof switchTab === "function") switchTab("html");
    document.getElementById("code-modal").showModal();
  },

  clearSite() {
    if (
      confirm(
        "Tem certeza que deseja apagar tudo e começar uma nova página em branco?",
      )
    ) {
      state.elements = [];
      state.selectedId = null;
      state.pageSettings = { ...DEFAULT_PAGE_SETTINGS };
      localStorage.removeItem(STATE_KEY);
      pushToHistory();
      renderAll();
    }
  },

  importSite(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const match = e.target.result.match(
        /<script id="site-data" type="application\/json">([\s\S]*?)<\/script>/,
      );
      if (match && match[1]) {
        try {
          const importedData = JSON.parse(match[1]);
          state.elements = importedData.elements || [];
          state.selectedId = null;
          state.pageSettings = {
            ...DEFAULT_PAGE_SETTINGS,
            ...(importedData.pageSettings || {}),
          };
          pushToHistory();
          renderAll();
          setTimeout(() => alert("Site carregado com sucesso!"), 10);
        } catch (err) {
          alert("Erro ao ler os dados. O arquivo pode ter sido corrompido.");
        }
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  },

  previewSite() {
    checkMission("m8");
    const rawHTML = state.elements
      .map((el) => htmlGenerator.wrapElementHTML(el, false))
      .filter(Boolean)
      .join("");
    const bgStyle = htmlGenerator.getPageBackgroundCSS();
    document.getElementById("preview-content").innerHTML = `
      <div style="min-height: 100vh; padding: 40px 20px; background-color: #f1f5f9;">
        <div style="width: 100%; max-width: 1200px; margin: 0 auto; ${bgStyle} padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; flex-wrap: wrap; align-content: flex-start; align-items: stretch; overflow: hidden;">
          ${rawHTML}
        </div>
      </div>`;
    document.getElementById("preview-modal").showModal();
  },

  undo() {
    if (appHistoryIndex > 0) {
      appHistoryIndex--;
      const pastState = JSON.parse(appHistory[appHistoryIndex]);
      state.elements = pastState.elements;
      state.pageSettings = {
        ...DEFAULT_PAGE_SETTINGS,
        ...(pastState.pageSettings || {}),
      };
      saveState();
      renderAll();
    }
  },

  redo() {
    if (appHistoryIndex < appHistory.length - 1) {
      appHistoryIndex++;
      const futureState = JSON.parse(appHistory[appHistoryIndex]);
      state.elements = futureState.elements;
      state.pageSettings = {
        ...DEFAULT_PAGE_SETTINGS,
        ...(futureState.pageSettings || {}),
      };
      saveState();
      renderAll();
    }
  },

  updatePageSettings(key, value, redrawPanel = false) {
    state.pageSettings[key] = value;
    if (key === "backgroundColor") checkMission("m2");
    if (key === "backgroundImage" && value) checkMission("m3");
    updateCanvasBackground();
    if (redrawPanel) {
      pushToHistory();
      renderPropertiesPanel();
    } else {
      scheduleHistoryPush();
    }
  },

  exportSite() {
    let fileName = prompt("Dê um nome para esta página:", "index");
    if (!fileName) return;
    fileName = fileName.trim().replace(/\s+/g, "-").toLowerCase();
    if (!fileName.endsWith(".html")) fileName += ".html";

    const fullHTML = htmlGenerator.generateFullDocument(state.elements, true);
    const blob = new Blob([fullHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};

window.onload = () => {
  renderComponentsGrid();
  loadState();

  new Sortable(document.getElementById("components-grid"), {
    group: { name: "shared", pull: "clone", put: false },
    sort: false,
    animation: 150,
  });

  new Sortable(document.getElementById("canvas-content"), {
    group: "shared",
    animation: 150,
    ghostClass: "opacity-50",
    filter: ".empty-state-msg",
    onEnd(evt) {
      if (evt.from === evt.to && evt.oldIndex !== evt.newIndex) {
        const movedItem = state.elements.splice(evt.oldIndex, 1)[0];
        state.elements.splice(evt.newIndex, 0, movedItem);
        pushToHistory();
        renderAll();
      }
    },
    onAdd(evt) {
      const type = evt.item.dataset.type;
      evt.item.parentNode.removeChild(evt.item);
      addBlock(type, state.elements.length === 0 ? 0 : evt.newIndex);
    },
  });
};

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "z") {
    e.preventDefault();
    actions.undo();
  }
  if (e.ctrlKey && e.key.toLowerCase() === "y") {
    e.preventDefault();
    actions.redo();
  }
});

window.addEventListener("beforeunload", (e) => {
  if (state.elements.length > 0 || appHistoryIndex > 0) {
    e.preventDefault();
    return "";
  }
});

window.switchTab = function (tab) {
  const tabHtml = document.getElementById("tab-html");
  const tabCss = document.getElementById("tab-css");
  const contentHtml = document.getElementById("code-content-html");
  const contentCss = document.getElementById("code-content-css");

  const activeClass = (borderColor) =>
    `text-sm text-white font-bold flex items-center gap-2 border-b-2 ${borderColor} pb-3 px-2 transition`;
  const inactiveClass =
    "text-sm text-slate-500 hover:text-white font-bold flex items-center gap-2 border-b-2 border-transparent pb-3 px-2 transition";

  const isHtml = tab === "html";
  tabHtml.className = isHtml ? activeClass("border-indigo-500") : inactiveClass;
  tabCss.className = !isHtml ? activeClass("border-pink-500") : inactiveClass;
  contentHtml.classList.toggle("hidden", !isHtml);
  contentCss.classList.toggle("hidden", isHtml);

  replaceIcons();
};
