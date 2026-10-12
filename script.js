/* jshint esversion: 11, browser: true, unused: false, undef: false */
// --- 1. DADOS E ESTADO INICIAL ---

const STATE_KEY = "SiteCanvas_v2"; // Mudamos para v2 para forçar a limpeza da memória corrompida

// Definição dos blocos
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

const defaultElements = [];

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

let state = {
  elements: [],
  selectedId: null,
  missions: [],
  pageSettings: {
    backgroundColor: "#ffffff",
    backgroundImage: "",
    backgroundSize: "cover",
  },
};

let appHistory = [];
let appHistoryIndex = -1;

// --- ESCUDO ANTI-QUEDA DE INTERNET ---
function replaceIcons() {
  if (typeof feather !== "undefined") {
    feather.replace();
  }
}

function pushToHistory() {
  appHistory = appHistory.slice(0, appHistoryIndex + 1);
  appHistory.push(
    JSON.stringify({
      elements: state.elements,
      pageSettings: state.pageSettings,
    }),
  );
  if (appHistory.length > 30) appHistory.shift();
  appHistoryIndex = appHistory.length - 1;
  saveState();
}

// --- 2. FUNÇÕES BASE ---

function generateId() {
  return "el_" + Math.random().toString(36).substr(2, 9);
}

function loadState() {
  const savedData = localStorage.getItem(STATE_KEY);
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      state.elements = parsed.elements || [];
      state.missions =
        parsed.missions || JSON.parse(JSON.stringify(initialMissions));
      state.pageSettings = parsed.pageSettings || {
        backgroundColor: "#ffffff",
        backgroundImage: "",
        backgroundSize: "cover",
      };
    } catch (e) {
      state.elements = [];
      state.missions = JSON.parse(JSON.stringify(initialMissions));
    }
  } else {
    state.elements = [];
    state.missions = JSON.parse(JSON.stringify(initialMissions));
  }

  appHistory = [];
  appHistoryIndex = -1;
  pushToHistory();
  renderAll();
}

function saveState() {
  updateProgress();
  // Tenta fazer o auto-save. Se a imagem for muito grande e estourar o limite de 5MB do navegador, ele não trava o site.
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

// --- 3. GAMIFICAÇÃO ---

// --- SISTEMA DE NOTIFICAÇÕES (TOAST) ---
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
        </div>
    `;

  container.appendChild(toast);
  replaceIcons();

  // Inicia a saída após 3 segundos (tempo da barra correr)
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
  const completed = state.missions.filter((m) => m.completed).length;
  const percentage = Math.round((completed / total) * 100);
  document.getElementById("progress-text").innerText = `${percentage}%`;
  document.getElementById("progress-bar").style.width = `${percentage}%`;
}

// --- 4. RENDERIZAÇÃO E MANIPULAÇÃO DO DOM ---

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
      const newEl = {
        id: generateId(),
        type: block.type,
        ...JSON.parse(JSON.stringify(block.defaultProps)),
      };
      state.elements.push(newEl);
      state.selectedId = newEl.id;

      if (block.type === "image") checkMission("m3");
      if (block.type === "list") checkMission("m4");
      if (block.type === "link") checkMission("m5");

      pushToHistory();
      renderAll();
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
    const baseClasses =
      "p-3 rounded-xl flex items-start gap-3 border transition-all duration-300 relative overflow-hidden";
    const stateClasses = isDone
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : "bg-white border-slate-200 text-slate-600";
    li.className = `${baseClasses} ${stateClasses}`;
    const iconHTML = isDone
      ? `<i data-feather="check-circle" class="w-5 h-5 text-emerald-500 mt-0.5 shrink-0"></i>`
      : `<div class="w-5 h-5 border-2 border-slate-300 rounded-full mt-0.5 shrink-0"></div>`;
    li.innerHTML = `${iconHTML}<span class="text-sm font-medium leading-tight ${isDone ? "line-through opacity-70" : ""}">${mission.text}</span>`;
    list.appendChild(li);
  });
  replaceIcons();
}

function getElementHTMLContent(el, isExport = false) {
  // 1. Criamos uma cópia dos estilos para não apagar o original
  const innerStyles = { ...el.styles };
  // 2. Removemos a largura do conteúdo interno (porque ela agora pertence à borda azul externa)
  delete innerStyles.width;

  const styleStr = Object.entries(innerStyles)
    .map(([k, v]) => `${k.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v};`)
    .join(" ");

  // 3. Forçamos o conteúdo a esticar para 100% do tracejado azul
  const styleAttr = ` style="box-sizing: border-box; width: 100%; max-width: 100%; ${styleStr}"`;

  let html = "";
  switch (el.type) {
    case "title":
      let imgHTML = el.imageUrl
        ? `<img src="${el.imageUrl}" style="height: 1.2em; border-radius: 8px; margin-right: 10px;">`
        : "";
      let titleStyle = styleAttr;
      if (el.styles.textAlign === "center")
        titleStyle = titleStyle.replace(";", "; justify-content: center;");
      else if (el.styles.textAlign === "right")
        titleStyle = titleStyle.replace(";", "; justify-content: flex-end;");
      html = `<h1${titleStyle}>${imgHTML}<span style="word-break: break-word;">${el.content}</span></h1>`;
      break;

    case "text":
      let textStyle = styleAttr.replace(
        'style="',
        'style="word-break: break-word; white-space: pre-wrap; ',
      );
      html = `<p${textStyle}>${el.content}</p>`;
      break;

    case "image":
      if (!el.src || el.src.trim() === "") {
        if (isExport) return ""; // Impede que o placeholder vaze para o site final
        // Se não houver link, desenha a caixa pontilhada de placeholder
        let phImgStyle = styleAttr.replace(
          'style="',
          'style="background-color: #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #cbd5e1; min-height: 250px; ',
        );
        html = `<div${phImgStyle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px; color: #94a3b8;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <span style="color: #64748b; font-weight: 600; font-family: sans-serif; font-size: 0.9rem;">Adicione uma imagem no painel</span>
                </div>`;
      } else {
        // Se houver link (ou base64), exibe a imagem real
        html = `<img src="${el.src}" alt="${el.alt || "Imagem"}"${styleAttr} />`;
      }
      break;

    case "button":
      const isRealBtnLink = el.href && el.href !== "#";
      const btnTarget = isRealBtnLink && isExport ? ' target="_blank"' : "";
      const btnHref = isExport
        ? ` href="${el.href || "#"}"`
        : ` href="#" onclick="event.preventDefault()"`;
      html = `<a${btnHref}${btnTarget}${styleAttr}>${el.content}</a>`;
      break;

    case "link":
      const hrefAttr = isExport
        ? ` href="${el.href || "#"}"`
        : ` href="#" onclick="event.preventDefault()"`;
      const linkTarget = isExport ? ' target="_blank"' : "";
      html = `<a${hrefAttr}${linkTarget}${styleAttr}>${el.content}</a>`;
      break;

    case "list":
      html = `<ul${styleAttr}>\n`;
      (el.content || "").split("\n").forEach((item) => {
        if (item.trim())
          html += `  <li style="list-style-type: disc; margin-left: 20px; word-break: break-word;">${item}</li>\n`;
      });
      html += `</ul>`;
      break;

    case "card":
      let cImg = el.cardImage
        ? `<img src="${el.cardImage}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px; display: block;">`
        : "";
      let cTit = el.cardTitle
        ? `<h3 style="font-size: 1.25em; font-weight: bold; color: ${el.cardTitleColor || "#1e293b"}; margin-bottom: 4px; word-break: break-word;">${el.cardTitle}</h3>`
        : "";
      let cSub = el.cardSubtitle
        ? `<h4 style="font-size: 0.9em; color: ${el.cardSubtitleColor || "#64748b"}; margin-bottom: 12px; word-break: break-word;">${el.cardSubtitle}</h4>`
        : "";
      let cTxt = el.content
        ? `<p style="font-size: 1em; color: ${el.cardTextColor || "#475569"}; margin-bottom: 16px; word-break: break-word; white-space: pre-wrap;">${el.content}</p>`
        : "";

      const isRealCardLink = el.cardButtonLink && el.cardButtonLink !== "#";
      const cardTarget = isRealCardLink && isExport ? ' target="_blank"' : "";
      const cBtnHref = isExport ? el.cardButtonLink || "#" : "#";
      const cBtnClick = !isExport ? ' onclick="event.preventDefault()"' : "";

      let cBtn = el.cardButton
        ? `<a href="${cBtnHref}"${cardTarget}${cBtnClick} style="display: inline-block; padding: 8px 16px; background-color: ${el.cardButtonBgColor || "#4f46e5"}; color: ${el.cardButtonTextColor || "#ffffff"}; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 0.9em;">${el.cardButton}</a>`
        : "";

      let cardStyle = styleAttr.replace(
        'style="',
        'style="height: 100%; overflow: hidden; display: flex; flex-direction: column; ',
      );
      html = `<div${cardStyle}>\n                ${cImg}\n                ${cTit}\n                ${cSub}\n                ${cTxt}\n                <div style="margin-top: auto;">${cBtn}</div>\n            </div>`;
      break;
    case "separator":
      html = `<hr${styleAttr} />`;
      break;
    case "video":
      if (!el.src || el.src.trim() === "") {
        if (isExport) return ""; // Impede que o placeholder vaze para o site final
        // Se não houver link, desenha uma caixa pontilhada amigável
        let phStyle = styleAttr.replace(
          'style="',
          'style="background-color: #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 2px dashed #cbd5e1; ',
        );
        html = `<div${phStyle}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 8px; color: #94a3b8;"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                    <span style="color: #64748b; font-weight: 600; font-family: sans-serif; font-size: 0.9rem;">Adicione um link de vídeo no painel</span>
                </div>`;
      } else {
        // Se houver link, embute o vídeo real
        html = `<iframe src="${el.src}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen${styleAttr}></iframe>`;
      }
      break;
  }
  return html;
}

function renderCanvas() {
  const canvas = document.getElementById("canvas-content");
  const canvasBg = document.getElementById("canvas-bg");
  canvas.innerHTML = "";

  // Transforma a folha numa grelha flexível para os blocos ficarem lado a lado
  canvas.style.display = "flex";
  canvas.style.flexWrap = "wrap";
  canvas.style.alignContent = "flex-start";
  canvas.style.alignItems = "stretch"; // Impede que a caixa azul estique verticalmente

  // Configura fundo
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

  if (state.elements.length === 0) {
    canvas.innerHTML = `
<div class="pointer-events-none select-none h-full w-full flex flex-col items-center justify-center text-slate-400 mt-20 bg-white/80 p-8 rounded-xl backdrop-blur-sm shadow-[0_0_25px_rgba(0,0,0,0.15)] inline-block mx-auto text-center">
                <i data-feather="layout" class="w-16 h-16 mb-4 opacity-40 mx-auto"></i>
                <p class="text-lg font-bold text-slate-600">Seu site está vazio!</p>
                <p class="text-sm mt-2">Arraste os blocos da esquerda para cá.</p>
            </div>`;
    replaceIcons();
    return;
  }

  state.elements.forEach((el, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = `canvas-element-wrapper ${state.selectedId === el.id ? "selected" : ""}`;
    wrapper.dataset.id = el.id;

    // Aplica a largura escolhida ao bloco (100% por padrão) e padding
    const elWidth = el.styles.width || "100%";
    wrapper.style.width = elWidth;
    wrapper.style.padding = "4px";
    wrapper.style.boxSizing = "border-box";

    const contentDiv = document.createElement("div");
    contentDiv.style.width = "100%"; // Força o conteúdo a esticar horizontalmente
    contentDiv.style.height = "100%"; // Força o conteúdo a esticar verticalmente
    contentDiv.innerHTML = getElementHTMLContent(el, false);
    wrapper.appendChild(contentDiv);

    const controls = document.createElement("div");
    controls.className = "element-controls";

    // Mantém APENAS o botão de Apagar
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
        renderAll();
      }
    };
    canvas.appendChild(wrapper);
  });
  replaceIcons();
}

document.getElementById("main-area").onclick = () => {
  if (state.selectedId !== null) {
    state.selectedId = null;
    renderAll();
  }
};

function handleImageUpload(inputElement, callback) {
  const file = inputElement.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      callback(e.target.result);
    };
    reader.readAsDataURL(file);
  }
}

// --- 5. LÓGICA DE MANIPULAÇÃO DE ELEMENTOS ---

function moveElement(index, direction) {
  if (index + direction < 0 || index + direction >= state.elements.length)
    return;
  const newArray = [...state.elements];
  const temp = newArray[index];
  newArray[index] = newArray[index + direction];
  newArray[index + direction] = temp;
  state.elements = newArray;
  pushToHistory();
  renderAll();
}

function deleteElement(id) {
  state.elements = state.elements.filter((el) => el.id !== id);
  if (state.selectedId === id) state.selectedId = null;
  pushToHistory();
  renderAll();
}

function updateElement(id, key, value, isStyle = false) {
  const el = state.elements.find((e) => e.id === id);
  if (!el) return;

  if (isStyle) {
    el.styles[key] = value;
    checkMission("m2"); // Cor/Estilo
    if (key === "width") checkMission("m4"); // Missão da Grelha
  } else {
    el[key] = value;
    if (
      key === "content" &&
      !value.includes("Novo Título") &&
      !value.includes("Digite seu texto")
    )
      checkMission("m1");
    if (key === "href") checkMission("m6"); // Missão do Link
    if (el.type === "card" && (key.startsWith("card") || key === "content"))
      checkMission("m5"); // Missão do Card
  }
  pushToHistory();
  renderCanvas();
}

function renderPropertiesPanel() {
  const panel = document.getElementById("properties-panel");
  panel.innerHTML = "";

  const el = state.elements.find((e) => e.id === state.selectedId);

  if (!el) {
    panel.innerHTML = `
            <div class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-6 inline-block">Design da Página</div>
            <div class="space-y-6">
                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Cor de Fundo (Página)</label>
                    <input type="color" class="w-full h-10 cursor-pointer rounded border border-slate-200" value="${state.pageSettings.backgroundColor}" oninput="actions.updatePageSettings('backgroundColor', this.value)">
                </div>
                
                <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-xl relative">
                    <label class="block text-xs font-bold text-indigo-700 uppercase mb-2"><i data-feather="upload-cloud" class="w-3 h-3 inline"></i> Upload de Imagem de Fundo</label>
                    <input type="file" accept="image/png, image/jpeg, image/jpg" class="text-xs w-full text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer" onchange="handleImageUpload(this, (base64) => actions.updatePageSettings('backgroundImage', base64, true))">
                    ${state.pageSettings.backgroundImage ? `<button onclick="actions.updatePageSettings('backgroundImage', '', true)" class="w-full mt-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-md text-xs font-bold transition flex items-center justify-center gap-1"><i data-feather="trash-2" class="w-3 h-3 inline"></i> Remover Fundo Atual</button>` : ""}
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Ou Cole o URL da Imagem</label>
                    <input type="text" class="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:border-indigo-500 outline-none" value="${state.pageSettings.backgroundImage?.startsWith("data:") ? "" : state.pageSettings.backgroundImage}" onchange="actions.updatePageSettings('backgroundImage', this.value, true)" placeholder="Ex: Cole o link e clique fora da caixa...">
                </div>

                <div>
                    <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Preenchimento da Imagem</label>
                    <select class="w-full p-2 border border-slate-300 rounded text-sm outline-none" onchange="actions.updatePageSettings('backgroundSize', this.value)">
                        <option value="cover" ${state.pageSettings.backgroundSize === "cover" ? "selected" : ""}>Preencher Tela Inteira</option>
                        <option value="contain" ${state.pageSettings.backgroundSize === "contain" ? "selected" : ""}>Ajustar ao Tamanho</option>
                        <option value="auto" ${state.pageSettings.backgroundSize === "auto" ? "selected" : ""}>Tamanho Original</option>
                    </select>
                </div>
            </div>`;
    replaceIcons();
    return;
  }

  const elTypeLabel =
    blockTypes.find((b) => b.type === el.type)?.label || "Elemento";

  const header = document.createElement("div");
  header.innerHTML = `<div class="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-6">Editando: ${elTypeLabel}</div>`;
  panel.appendChild(header);

  const formContainer = document.createElement("div");
  formContainer.className = "space-y-6";

  const contentSection = document.createElement("div");

  if (el.type === "title") {
    contentSection.innerHTML = `
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Texto do Título</label>
            <input type="text" class="w-full p-2.5 mb-4 text-sm border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" value="${el.content}">
            
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl relative">
                <label class="block text-xs font-bold text-slate-700 uppercase mb-2"><i data-feather="image" class="w-3 h-3 inline"></i> Adicionar Ícone ao lado</label>
                <input type="file" accept="image/png, image/jpeg, image/jpg, image/svg+xml" class="text-xs w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer" onchange="handleImageUpload(this, (base64) => updateElement('${el.id}', 'imageUrl', base64))">
                <div class="text-[10px] text-slate-400 mt-2 mb-2">Escolha uma imagem pequena para acompanhar o título.</div>
                ${el.imageUrl ? `<button onclick="updateElement('${el.id}', 'imageUrl', '')" class="w-full mt-2 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-md text-xs font-bold transition flex items-center justify-center gap-1"><i data-feather="trash-2" class="w-3 h-3 inline"></i> Remover Ícone</button>` : ""}
            </div>
        `;
    contentSection.querySelector('input[type="text"]').oninput = (e) =>
      updateElement(el.id, "content", e.target.value);
  } else if (el.type === "button") {
    contentSection.innerHTML = `
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Texto do Botão</label>
            <input type="text" class="w-full p-2.5 mb-4 text-sm border border-slate-300 rounded-lg focus:border-indigo-500 outline-none transition" value="${el.content}">
            
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Link de Destino</label>
            <input type="text" class="w-full p-2.5 text-sm font-mono border border-slate-300 rounded-lg focus:border-indigo-500 outline-none" value="${el.href || ""}" placeholder="Ex: https://google.com">
        `;
    contentSection.querySelectorAll("input")[0].oninput = (e) =>
      updateElement(el.id, "content", e.target.value);
    contentSection.querySelectorAll("input")[1].oninput = (e) =>
      updateElement(el.id, "href", e.target.value);
  } else if (el.type === "card") {
    contentSection.innerHTML = `
            <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-xl relative mb-4">
                <label class="block text-xs font-bold text-indigo-700 uppercase mb-2"><i data-feather="image" class="w-3 h-3 inline"></i> Imagem do Topo</label>
                <input type="file" accept="image/png, image/jpeg, image/jpg" class="text-xs w-full text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer" onchange="handleImageUpload(this, (base64) => updateElement('${el.id}', 'cardImage', base64))">
                ${el.cardImage ? `<button onclick="updateElement('${el.id}', 'cardImage', '')" class="w-full mt-2 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-md text-xs font-bold transition flex items-center justify-center gap-1"><i data-feather="trash-2" class="w-3 h-3 inline"></i> Remover Imagem</button>` : ""}
            </div>
            
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Título Principal</label>
            <div class="flex gap-2 mb-3">
                <input type="text" class="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:border-indigo-500 outline-none" value="${el.cardTitle || ""}" oninput="updateElement('${el.id}', 'cardTitle', this.value)">
                <input type="color" class="w-10 h-10 p-0.5 border border-slate-300 rounded-lg cursor-pointer flex-shrink-0" value="${el.cardTitleColor || "#1e293b"}" oninput="updateElement('${el.id}', 'cardTitleColor', this.value)">
            </div>
            
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Subtítulo</label>
            <div class="flex gap-2 mb-3">
                <input type="text" class="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:border-indigo-500 outline-none" value="${el.cardSubtitle || ""}" oninput="updateElement('${el.id}', 'cardSubtitle', this.value)">
                <input type="color" class="w-10 h-10 p-0.5 border border-slate-300 rounded-lg cursor-pointer flex-shrink-0" value="${el.cardSubtitleColor || "#64748b"}" oninput="updateElement('${el.id}', 'cardSubtitleColor', this.value)">
            </div>
            
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Texto Descritivo</label>
            <div class="flex gap-2 mb-3 items-start">
                <textarea rows="3" class="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:border-indigo-500 outline-none">${el.content}</textarea>
                <input type="color" class="w-10 h-10 p-0.5 border border-slate-300 rounded-lg cursor-pointer flex-shrink-0" value="${el.cardTextColor || "#475569"}" oninput="updateElement('${el.id}', 'cardTextColor', this.value)">
            </div>
            
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Texto e Cores do Botão</label>
            <div class="flex gap-2 mb-3">
                <input type="text" class="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:border-indigo-500 outline-none" value="${el.cardButton || ""}" placeholder="Deixe vazio para ocultar" oninput="updateElement('${el.id}', 'cardButton', this.value)">
                <input type="color" class="w-10 h-10 p-0.5 border border-slate-300 rounded-lg cursor-pointer flex-shrink-0" value="${el.cardButtonTextColor || "#ffffff"}" title="Cor da Letra" oninput="updateElement('${el.id}', 'cardButtonTextColor', this.value)">
                <input type="color" class="w-10 h-10 p-0.5 border border-slate-300 rounded-lg cursor-pointer flex-shrink-0" value="${el.cardButtonBgColor || "#4f46e5"}" title="Cor de Fundo" oninput="updateElement('${el.id}', 'cardButtonBgColor', this.value)">
            </div>
            
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Link do Botão</label>
            <input type="text" class="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:border-indigo-500 outline-none" value="${el.cardButtonLink || ""}" oninput="updateElement('${el.id}', 'cardButtonLink', this.value)">
        `;
    contentSection.querySelector("textarea").oninput = (e) =>
      updateElement(el.id, "content", e.target.value);
  } else if (el.type === "text" || el.type === "list") {
    contentSection.innerHTML = `
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Texto ${el.type === "list" ? "(um por linha)" : ""}</label>
            <textarea rows="5" class="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition">${el.content}</textarea>
        `;
    contentSection.querySelector("textarea").oninput = (e) =>
      updateElement(el.id, "content", e.target.value);
  } else if (el.type === "image") {
    contentSection.innerHTML = `
            <div class="p-3 bg-indigo-50 border border-indigo-100 rounded-xl relative mb-4">
                <label class="block text-xs font-bold text-indigo-700 uppercase mb-2"><i data-feather="upload-cloud" class="w-3 h-3 inline"></i> Fazer Upload de Imagem</label>
                <input type="file" accept="image/png, image/jpeg, image/jpg" class="text-xs w-full text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer" onchange="handleImageUpload(this, (base64) => updateElement('${el.id}', 'src', base64))">
                ${el.src ? `<button onclick="updateElement('${el.id}', 'src', '')" class="w-full mt-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-md text-xs font-bold transition flex items-center justify-center gap-1"><i data-feather="trash-2" class="w-3 h-3 inline"></i> Remover Imagem</button>` : ""}
            </div>

            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Ou Cole a URL da Imagem</label>
            <input type="text" class="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:border-indigo-500 outline-none" value="${el.src?.startsWith("data:") ? "" : el.src}" placeholder="Ex: https://...">
        `;
    contentSection.querySelector('input[type="text"]').oninput = (e) =>
      updateElement(el.id, "src", e.target.value);
  } else if (el.type === "link") {
    contentSection.innerHTML = `
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Texto do Link</label>
            <input type="text" id="link-text" class="w-full p-2.5 mb-4 text-sm border border-slate-300 rounded-lg focus:border-indigo-500 outline-none" value="${el.content}">
            
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Endereço (URL)</label>
            <input type="text" id="link-url" class="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:border-indigo-500 outline-none" value="${el.href || ""}">
        `;
    contentSection.querySelector("#link-text").oninput = (e) =>
      updateElement(el.id, "content", e.target.value);
    contentSection.querySelector("#link-url").oninput = (e) =>
      updateElement(el.id, "href", e.target.value);
  } else if (el.type === "video") {
    contentSection.innerHTML = `
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Link do Vídeo (Youtube)</label>
            <input type="text" class="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-lg focus:border-indigo-500 outline-none" value="${el.src || ""}" placeholder="Cole o link do Youtube aqui...">
            <div class="text-[10px] text-slate-400 mt-2">Dica: Cole o link completo, ex: https://www.youtube.com/watch?v=dQw4w9WgXcQ</div>
        `;
    contentSection.querySelector("input").oninput = (e) => {
      let url = e.target.value;
      if (url.includes("youtube.com/watch?v=")) {
        url = url.replace("watch?v=", "embed/");
        const ampersandPos = url.indexOf("&");
        if (ampersandPos !== -1) {
          url = url.substring(0, ampersandPos);
        }
      } else if (url.includes("youtu.be/")) {
        url = url.replace("youtu.be/", "www.youtube.com/embed/");
      }
      updateElement(el.id, "src", url);
    };
  }

  if (contentSection.innerHTML) formContainer.appendChild(contentSection);

  formContainer.insertAdjacentHTML(
    "beforeend",
    '<hr class="border-slate-100 my-4">',
  );

  // MÓDULO DE TAMANHO
  const layoutSection = document.createElement("div");
  const sizeValLayout = el.styles.width || "100%";
  layoutSection.innerHTML = `
        <h3 class="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 mt-6">Tamanho do Bloco</h3>
        <div class="flex items-center justify-between mb-3">
            <label class="text-sm font-medium text-slate-600">Largura</label>
            <div class="w-1/2">
                <select class="w-full p-2 border border-slate-300 rounded text-sm outline-none" onchange="updateElement('${el.id}', 'width', this.value, true)">
                    <option value="100%" ${sizeValLayout === "100%" ? "selected" : ""}>100% (Cheia)</option>
                    <option value="50%" ${sizeValLayout === "50%" ? "selected" : ""}>50% (Metade)</option>
                    <option value="33.33%" ${sizeValLayout === "33.33%" ? "selected" : ""}>33% (Um Terço)</option>
                    <option value="25%" ${sizeValLayout === "25%" ? "selected" : ""}>25% (Um Quarto)</option>
                </select>
            </div>
        </div>
    `;
  formContainer.appendChild(layoutSection);

  const styleSection = document.createElement("div");
  styleSection.innerHTML = `<h3 class="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 mt-6">Aparência (CSS)</h3>`;

  const createStyleRow = (label, inputHtml) => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between mb-3";
    row.innerHTML = `<label class="text-sm font-medium text-slate-600">${label}</label><div class="w-1/2">${inputHtml}</div>`;
    return row;
  };

  if (!["image", "separator", "video", "card"].includes(el.type)) {
    const colorRow = createStyleRow(
      "Cor da Letra",
      `<input type="color" class="w-full h-8 cursor-pointer rounded border border-slate-200" value="${el.styles.color || "#000000"}">`,
    );
    colorRow.querySelector("input").oninput = (e) =>
      updateElement(el.id, "color", e.target.value, true);
    styleSection.appendChild(colorRow);
  }

  if (["button", "card"].includes(el.type)) {
    const bgColorRow = createStyleRow(
      "Cor de Fundo",
      `<input type="color" class="w-full h-8 cursor-pointer rounded border border-slate-200" value="${el.styles.backgroundColor || "#ffffff"}">`,
    );
    bgColorRow.querySelector("input").oninput = (e) =>
      updateElement(el.id, "backgroundColor", e.target.value, true);
    styleSection.appendChild(bgColorRow);
  }

  if (["title", "text", "list", "button", "link", "card"].includes(el.type)) {
    const sizeVal = el.styles.fontSize || "1rem";
    const sizeRow = createStyleRow(
      "Tamanho Fonte",
      `
            <select class="w-full p-2 border border-slate-300 rounded text-sm outline-none">
                <option value="0.875rem" ${sizeVal === "0.875rem" ? "selected" : ""}>Pequeno</option>
                <option value="1.1rem" ${sizeVal === "1.1rem" ? "selected" : ""}>Normal</option>
                <option value="1.5rem" ${sizeVal === "1.5rem" ? "selected" : ""}>Grande</option>
                <option value="2.5rem" ${sizeVal === "2.5rem" ? "selected" : ""}>Muito Grande</option>
                <option value="3.5rem" ${sizeVal === "3.5rem" ? "selected" : ""}>Gigante</option>
            </select>
        `,
    );
    sizeRow.querySelector("select").onchange = (e) =>
      updateElement(el.id, "fontSize", e.target.value, true);
    styleSection.appendChild(sizeRow);

    // NOVO: Menu de Tipografia (Web Safe Fonts)
    const fontVal =
      el.styles.fontFamily || "system-ui, -apple-system, sans-serif";
    const fontRow = createStyleRow(
      "Tipo de Fonte",
      `
            <select class="w-full p-2 border border-slate-300 rounded text-sm outline-none">
                <option value="system-ui, -apple-system, sans-serif" ${fontVal === "system-ui, -apple-system, sans-serif" ? "selected" : ""}>Moderna (Padrão)</option>
                <option value="Arial, Helvetica, sans-serif" ${fontVal === "Arial, Helvetica, sans-serif" ? "selected" : ""}>Clara (Arial)</option>
                <option value="'Times New Roman', Times, serif" ${fontVal === "'Times New Roman', Times, serif" ? "selected" : ""}>Clássica (Serifada)</option>
                <option value="'Courier New', Courier, monospace" ${fontVal === "'Courier New', Courier, monospace" ? "selected" : ""}>Código (Monospace)</option>
                <option value="'Comic Sans MS', 'Marker Felt', sans-serif" ${fontVal === "'Comic Sans MS', 'Marker Felt', sans-serif" ? "selected" : ""}>Divertida (Quadrinhos)</option>
                <option value="Impact, fantasy" ${fontVal === "Impact, fantasy" ? "selected" : ""}>Forte (Impact)</option>
            </select>
        `,
    );
    fontRow.querySelector("select").onchange = (e) =>
      updateElement(el.id, "fontFamily", e.target.value, true);
    styleSection.appendChild(fontRow);
  }

  if (["title", "text", "card"].includes(el.type)) {
    const alignVal = el.styles.textAlign || "left";
    const alignRow = createStyleRow(
      "Alinhamento",
      `
            <select class="w-full p-2 border border-slate-300 rounded text-sm outline-none">
                <option value="left" ${alignVal === "left" ? "selected" : ""}>Esquerda</option>
                <option value="center" ${alignVal === "center" ? "selected" : ""}>Centro</option>
                <option value="right" ${alignVal === "right" ? "selected" : ""}>Direita</option>
            </select>
        `,
    );
    alignRow.querySelector("select").onchange = (e) =>
      updateElement(el.id, "textAlign", e.target.value, true);
    styleSection.appendChild(alignRow);
  }

  if (["image", "button", "card", "video"].includes(el.type)) {
    const radiusVal = el.styles.borderRadius || "0px";
    const radiusRow = createStyleRow(
      "Bordas",
      `
            <select class="w-full p-2 border border-slate-300 rounded text-sm outline-none">
                <option value="0px" ${radiusVal === "0px" ? "selected" : ""}>Quadradas</option>
                <option value="8px" ${radiusVal === "8px" ? "selected" : ""}>Leves</option>
                <option value="16px" ${radiusVal === "16px" ? "selected" : ""}>Arredondadas</option>
                <option value="99px" ${radiusVal === "99px" ? "selected" : ""}>Pílula</option>
            </select>
        `,
    );
    radiusRow.querySelector("select").onchange = (e) =>
      updateElement(el.id, "borderRadius", e.target.value, true);
    styleSection.appendChild(radiusRow);
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

const htmlGenerator = {
  generateEducationalHTML(elements) {
    let html = "";
    elements.forEach((el) => {
      let comment = "";
      switch (el.type) {
        case "title":
          comment = "<!-- A tag <h1> cria um título principal gigante! -->";
          break;
        case "text":
          comment =
            "<!-- A tag <p> (parágrafo) é onde colocamos nossos textos normais. -->";
          break;
        case "image":
          comment = "<!-- A tag <img> exibe imagens. -->";
          break;
        case "button":
          comment = "<!-- A tag <button> cria um botão. -->";
          break;
        case "link":
          comment = "<!-- A tag <a> (âncora) cria um link. -->";
          break;
        case "list":
          comment =
            "<!-- A tag <ul> cria uma lista e <li> cria cada item dessa lista. -->";
          break;
        case "card":
          comment = "<!-- A tag <div> agrupa conteúdos. -->";
          break;
        case "separator":
          comment = "<!-- A tag <hr> desenha uma linha separadora. -->";
          break;
        case "video":
          comment =
            "<!-- A tag <iframe> embute outra página da web, como um vídeo do Youtube. -->";
          break;
      }
      const width = el.styles.width || "100%";
      html += `\n    ${comment}\n    <div style="width: ${width}; padding: 4px; box-sizing: border-box;">\n        ${getElementHTMLContent(el, true)}\n    </div>\n`;
    });
    return html;
  },

  generateCSSContent() {
    let bgStyle = `background-color: ${state.pageSettings.backgroundColor};`;
    if (state.pageSettings.backgroundImage) {
      bgStyle += ` background-image: url('${state.pageSettings.backgroundImage}'); background-size: ${state.pageSettings.backgroundSize}; background-position: center; background-attachment: fixed;`;
    }
    return `body {\n    font-family: system-ui, -apple-system, sans-serif;\n    line-height: 1.5;\n    margin: 0;\n    padding: 40px 20px;\n    background-color: #f1f5f9;\n}\n\n.container {\n    width: 100%;\n    max-width: 1200px;\n    margin: 0 auto;\n    ${bgStyle}\n    padding: 40px;\n    border-radius: 16px;\n    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);\n    display: flex;\n    flex-wrap: wrap;\n    align-content: flex-start;\n    align-items: stretch;\n    overflow: hidden;\n}\n\nimg {\n    max-width: 100%;\n    height: auto;\n}`;
  },

  generateFullDocument(elements, addComments = false) {
    const bodyContent = addComments
      ? this.generateEducationalHTML(elements)
      : elements
          .map((el) => {
            const width = el.styles.width || "100%";
            return `        <div style="width: ${width}; padding: 4px; box-sizing: border-box;">\n            ${getElementHTMLContent(el, true)}\n        </div>`;
          })
          .join("\n");

    let bgStyle = `background-color: ${state.pageSettings.backgroundColor};`;
    if (state.pageSettings.backgroundImage) {
      bgStyle += ` background-image: url('${state.pageSettings.backgroundImage}'); background-size: ${state.pageSettings.backgroundSize}; background-position: center; background-attachment: fixed;`;
    }

    // Pega todos os dados da página atual e transforma num texto seguro
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
    <link rel="icon" href="favicon.png" type="image/png">
    <style>
        body { 
            font-family: system-ui, -apple-system, sans-serif; 
            line-height: 1.5; 
            margin: 0; 
            padding: 40px 20px; 
            ${bgStyle}
        }
        .container { 
            width: 100%; 
            max-width: 1200px; 
            margin: 0 auto; 
            ${bgStyle}
            padding: 40px; 
            border-radius: 16px; 
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); 
            display: flex;
            flex-wrap: wrap;
            align-content: flex-start;
            align-items: stretch;
            overflow: hidden;
        }
        img { max-width: 100%; height: auto; }
    </style>
</head>
<body>
    <div class="container">
${bodyContent}
    </div>
    
    <!-- DADOS SECRETOS DO EDITOR (NÃO APAGUE SE QUISER IMPORTAR DE VOLTA) -->
    <script id="site-data" type="application/json">${projectData}</script>
</body>
</html>`;
  },
};

const actions = {
  showCode() {
    checkMission("m7");
    const htmlStr = htmlGenerator.generateEducationalHTML(state.elements);
    const fullHTML = `<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n    <meta charset="UTF-8">\n    <title>SiteCanvas</title>\n    <link rel="icon" href="favicon.png" type="image/png">\n    <!-- As cores e o design estão na aba CSS ao lado! -->\n    <link rel="stylesheet" href="style.css">\n</head>\n<body>\n    <div class="container">\n${htmlStr}    </div>\n</body>\n</html>`;

    const safeHTML = fullHTML.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Colorizador de código seguro (Passo Único para evitar sobreposição de tags)
    const highlightedHTML = safeHTML.replace(
      /&lt;!--[\s\S]*?--&gt;|&lt;\/?[\w\-]+| [\w\-]+="[^"]*"/g,
      function (match) {
        if (match.startsWith("&lt;!--"))
          return `<span class="text-slate-500 italic">${match}</span>`;
        if (match.startsWith("&lt;"))
          return `<span class="text-indigo-400">${match}</span>`;

        // Separa os atributos (ex: style="...") com cores corretas
        let eqIdx = match.indexOf("=");
        let attrName = match.substring(0, eqIdx);
        let attrVal = match.substring(eqIdx);
        return `<span class="text-blue-300">${attrName}</span><span class="text-emerald-300">${attrVal}</span>`;
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
      state.pageSettings = {
        backgroundColor: "#ffffff",
        backgroundImage: "",
        backgroundSize: "cover",
      };
      localStorage.removeItem(STATE_KEY); // Limpa o Auto-save
      pushToHistory();
      renderAll();
    }
  },

  importSite(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      // Procura o mapa secreto dentro do arquivo HTML
      const match = content.match(
        /<script id="site-data" type="application\/json">([\s\S]*?)<\/script>/,
      );

      if (match && match[1]) {
        try {
          const importedData = JSON.parse(match[1]);
          state.elements = importedData.elements || [];
          state.pageSettings = importedData.pageSettings || {
            backgroundColor: "#ffffff",
            backgroundImage: "",
            backgroundSize: "cover",
          };
          pushToHistory();
          renderAll();

          // Dá 10 milissegundos para o navegador "respirar" e desenhar a tela antes de congelar no pop-up
          setTimeout(() => {
            alert("Site carregado com sucesso!");
          }, 10);
        } catch (err) {
          alert("Erro ao ler os dados. O arquivo pode ter sido corrompido.");
        }
      }
      event.target.value = ""; // Limpa a memória do input para permitir abrir o mesmo ficheiro de novo se necessário
    };
    reader.readAsText(file);
  },

  previewSite() {
    checkMission("m8");

    const rawHTML = state.elements
      .map((el) => {
        const width = el.styles.width || "100%";
        return `<div style="width: ${width}; padding: 4px; box-sizing: border-box;">${getElementHTMLContent(el, true)}</div>`;
      })
      .join("");

    let bgStyle = `background-color: ${state.pageSettings.backgroundColor};`;
    if (state.pageSettings.backgroundImage) {
      bgStyle += ` background-image: url('${state.pageSettings.backgroundImage}'); background-size: ${state.pageSettings.backgroundSize}; background-position: center; background-attachment: fixed;`;
    }

    const previewContainer = document.getElementById("preview-content");

    previewContainer.innerHTML = `
            <div style="min-height: 100vh; padding: 40px 20px; background-color: #f1f5f9;">
                <div style="width: 100%; max-width: 1200px; margin: 0 auto; ${bgStyle} padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: flex; flex-wrap: wrap; align-content: flex-start; align-items: flex-start; overflow: hidden;">
                    ${rawHTML}
                </div>
            </div>
        `;
    document.getElementById("preview-modal").showModal();
  },

  undo() {
    if (appHistoryIndex > 0) {
      appHistoryIndex--;
      const pastState = JSON.parse(appHistory[appHistoryIndex]);
      state.elements = pastState.elements;
      state.pageSettings = pastState.pageSettings || {
        backgroundColor: "#ffffff",
        backgroundImage: "",
        backgroundSize: "cover",
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
      state.pageSettings = futureState.pageSettings || {
        backgroundColor: "#ffffff",
        backgroundImage: "",
        backgroundSize: "cover",
      };
      saveState();
      renderAll();
    }
  },

  updatePageSettings(key, value, redrawPanel = false) {
    state.pageSettings[key] = value;
    pushToHistory();
    renderCanvas();

    // Só redesenha o painel lateral se for estritamente necessário (redrawPanel = true)
    if (redrawPanel) {
      renderPropertiesPanel();
    }
  },

  exportSite() {
    // NOVO: Pergunta o nome da página antes de salvar
    let fileName = prompt("Dê um nome para esta página:", "index");
    if (!fileName) return; // Cancela se o aluno fechar a janela

    // Remove espaços e garante que termina em .html
    fileName = fileName.trim().replace(/\s+/g, "-").toLowerCase();
    if (!fileName.endsWith(".html")) fileName += ".html";

    const fullHTML = htmlGenerator.generateFullDocument(state.elements, true);
    const blob = new Blob([fullHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName; // Usa o nome escolhido pelo aluno
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
    filter: ".empty-state-msg", // Impede que o bloco vazio seja arrastado
    onEnd: function (evt) {
      if (evt.from === evt.to) {
        const movedItem = state.elements.splice(evt.oldIndex, 1)[0];
        state.elements.splice(evt.newIndex, 0, movedItem);
        pushToHistory();
        renderAll();
      }
    },
    onAdd: function (evt) {
      const type = evt.item.dataset.type;
      evt.item.parentNode.removeChild(evt.item);

      const block = blockTypes.find((b) => b.type === type);
      const newEl = {
        id: generateId(),
        type: block.type,
        ...JSON.parse(JSON.stringify(block.defaultProps)),
      };

      // Garante que o cálculo matemático não falha ao ser o primeiro bloco
      let targetIndex = state.elements.length === 0 ? 0 : evt.newIndex;

      state.elements.splice(targetIndex, 0, newEl);
      state.selectedId = newEl.id;

      if (block.type === "image") checkMission("m3");
      if (block.type === "list") checkMission("m4");
      if (block.type === "link") checkMission("m5");

      pushToHistory();
      renderAll();
    },
  });
};

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    e.preventDefault();
    actions.undo();
  }
  if (e.ctrlKey && e.key === "y") {
    e.preventDefault();
    actions.redo();
  }
});

// --- PROTEÇÃO CONTRA SAÍDA ACIDENTAL ---
window.addEventListener("beforeunload", function (e) {
  if (state.elements.length > 0 || appHistoryIndex > 0) {
    e.preventDefault();
    return ""; // Substituto moderno que ativa o alerta nativo
  }
});

// --- CONTROLE DE ABAS (HTML/CSS) ---
window.switchTab = function (tab) {
  const tabHtml = document.getElementById("tab-html");
  const tabCss = document.getElementById("tab-css");
  const contentHtml = document.getElementById("code-content-html");
  const contentCss = document.getElementById("code-content-css");

  if (tab === "html") {
    tabHtml.className =
      "text-sm text-white font-bold flex items-center gap-2 border-b-2 border-indigo-500 pb-3 px-2 transition";
    tabCss.className =
      "text-sm text-slate-500 hover:text-white font-bold flex items-center gap-2 border-b-2 border-transparent pb-3 px-2 transition";
    contentHtml.classList.remove("hidden");
    contentCss.classList.add("hidden");
  } else {
    tabCss.className =
      "text-sm text-white font-bold flex items-center gap-2 border-b-2 border-pink-500 pb-3 px-2 transition";
    tabHtml.className =
      "text-sm text-slate-500 hover:text-white font-bold flex items-center gap-2 border-b-2 border-transparent pb-3 px-2 transition";
    contentCss.classList.remove("hidden");
    contentHtml.classList.add("hidden");
  }
  replaceIcons();
};
