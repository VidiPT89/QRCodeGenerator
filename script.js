(() => {
  const translations = {
    pt: {
      title: "Gerador de QR Code",
      subtitle: "Crie QR Codes elegantes para texto, URL ou WiFi em segundos",
      tabText: "Texto",
      tabUrl: "URL",
      tabWifi: "WiFi",
      labelText: "Texto",
      placeholderText: "Digite o texto...",
      labelUrl: "URL",
      placeholderUrl: "https://exemplo.com",
      labelSsid: "Nome da rede (SSID)",
      placeholderSsid: "Minha rede WiFi",
      labelPassword: "Senha",
      placeholderPassword: "Senha da rede",
      labelEncryption: "Criptografia",
      optWpa: "WPA/WPA2",
      optWep: "WEP",
      optNopass: "Sem senha",
      labelColor: "Cor do QR Code",
      labelBgColor: "Cor de fundo",
      labelSize: "Tamanho",
      sizePx: "px",
      btnGenerate: "Gerar QR Code",
      btnDownload: "Baixar PNG",
      alertFillText: "Por favor, escreva um texto antes de gerar o QR Code.",
      alertFillUrl: "Por favor, indique uma URL antes de gerar o QR Code.",
      alertFillWifi: "Por favor, indique o nome da rede antes de gerar o QR Code.",
      alertDownload: "Gere um QR Code antes de baixar.",
      footerDeveloped: "Desenvolvido por",
    },
    en: {
      title: "QR Code Generator",
      subtitle: "Create elegant QR Codes for text, URL or WiFi in seconds",
      tabText: "Text",
      tabUrl: "URL",
      tabWifi: "WiFi",
      labelText: "Text",
      placeholderText: "Type your text...",
      labelUrl: "URL",
      placeholderUrl: "https://example.com",
      labelSsid: "Network name (SSID)",
      placeholderSsid: "My WiFi network",
      labelPassword: "Password",
      placeholderPassword: "Network password",
      labelEncryption: "Encryption",
      optWpa: "WPA/WPA2",
      optWep: "WEP",
      optNopass: "No password",
      labelColor: "QR Code color",
      labelBgColor: "Background color",
      labelSize: "Size",
      sizePx: "px",
      btnGenerate: "Generate QR Code",
      btnDownload: "Download PNG",
      alertFillText: "Please enter some text before generating the QR Code.",
      alertFillUrl: "Please enter a URL before generating the QR Code.",
      alertFillWifi: "Please enter the network name before generating the QR Code.",
      alertDownload: "Generate a QR Code before downloading.",
      footerDeveloped: "Developed by",
    },
  };

  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabIndicator = document.querySelector(".tab-indicator");
  const panels = document.querySelectorAll(".field-group");
  const form = document.getElementById("qr-form");
  const resultCard = document.getElementById("result-card");
  const qrcodeBox = document.getElementById("qrcode");
  const downloadBtn = document.getElementById("download-btn");
  const langToggle = document.getElementById("lang-toggle");

  const fgColorInput = document.getElementById("fg-color");
  const bgColorInput = document.getElementById("bg-color");
  const sizeRange = document.getElementById("size-range");
  const sizeValue = document.getElementById("size-value");

  let activeType = "text";
  let currentLang = localStorage.getItem("qr-lang") || "pt";

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("qr-lang", lang);
    document.documentElement.lang = lang === "pt" ? "pt-PT" : "en";

    const dict = translations[lang];

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[key]) el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      if (dict[key]) el.placeholder = dict[key];
    });

    document.querySelectorAll(".lang-option").forEach((el) => {
      el.classList.toggle("active", el.dataset.lang === lang);
    });

    document.title = dict.title;
  }

  langToggle.addEventListener("click", () => {
    applyLanguage(currentLang === "pt" ? "en" : "pt");
  });

  applyLanguage(currentLang);

  function moveTabIndicator(index) {
    if (!tabIndicator) return;
    tabIndicator.style.transform = `translateX(${index * 100}%)`;
  }

  sizeRange.addEventListener("input", () => {
    sizeValue.textContent = sizeRange.value;
  });

  tabButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      activeType = btn.dataset.type;

      tabButtons.forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });

      panels.forEach((panel) => {
        panel.classList.toggle("hidden", panel.dataset.panel !== activeType);
      });

      moveTabIndicator(index);
    });
  });

  function escapeWifiValue(value) {
    return value.replace(/([\\;,:"])/g, "\\$1");
  }

  function buildQrText() {
    if (activeType === "text") {
      return document.getElementById("text-input").value.trim();
    }

    if (activeType === "url") {
      const url = document.getElementById("url-input").value.trim();
      if (!url) return "";
      return /^https?:\/\//i.test(url) ? url : `https://${url}`;
    }

    if (activeType === "wifi") {
      const ssid = document.getElementById("wifi-ssid").value.trim();
      const password = document.getElementById("wifi-password").value;
      const encryption = document.getElementById("wifi-encryption").value;

      if (!ssid) return "";

      const encPart = encryption === "nopass" ? "nopass" : encryption;
      const passPart = encryption === "nopass" ? "" : `P:${escapeWifiValue(password)};`;

      return `WIFI:T:${encPart};S:${escapeWifiValue(ssid)};${passPart}H:false;;`;
    }

    return "";
  }

  function generateQrCode(text) {
    qrcodeBox.innerHTML = "";

    const size = parseInt(sizeRange.value, 10);

    // eslint-disable-next-line no-new
    new QRCode(qrcodeBox, {
      text,
      width: size,
      height: size,
      colorDark: fgColorInput.value,
      colorLight: bgColorInput.value,
      correctLevel: QRCode.CorrectLevel.H,
    });

    resultCard.hidden = false;
    resultCard.classList.remove("result-card");
    // Force reflow so the pop-in animation replays every time
    void resultCard.offsetWidth;
    resultCard.classList.add("result-card");

    resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = buildQrText();
    const dict = translations[currentLang];

    if (!text) {
      const alertKey =
        activeType === "url" ? "alertFillUrl" : activeType === "wifi" ? "alertFillWifi" : "alertFillText";
      alert(dict[alertKey]);
      return;
    }

    generateQrCode(text);
  });

  downloadBtn.addEventListener("click", () => {
    const canvas = qrcodeBox.querySelector("canvas");
    const img = qrcodeBox.querySelector("img");

    const dataUrl = canvas ? canvas.toDataURL("image/png") : img ? img.src : null;

    if (!dataUrl) {
      alert(translations[currentLang].alertDownload);
      return;
    }

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
})();
