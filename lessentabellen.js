/**
 * Dynamische Lessentabellen - Versie 2.0
 * Applicatie voor het tonen van lessentabellen bij GO Campus Redingenhof.
 * @copyright 2025 GO Campus Redingenhof
 */

const LessentabellenApp = {
  /* 
   * BLOK 1: Configuratie
   * Versie, data-URL en domein-specifieke kleuren
   */
  version: '2.0.0',
  
  config: {
    csvUrl: "https://raw.githubusercontent.com/GOcampusRedingenhof/lessenrooster/refs/heads/main/lessentabellen_tabel.csv",
    cacheExpiry: 1000 * 60 * 60, // 1 uur cache
    domainColors: {
      "stem": {
        base: "#0A7254", // Darker green for better contrast
        mid: "#48A787",
        light1: "#F5FDFB", // Almost white with green tint
        hover: "#E4F5F0"
      },
      "topsport": {
        base: "#1D81A2",
        mid: "#47A3C2",
        light1: "#F5FBFE",
        hover: "#E4F3F7"
      },
      "eerste-graad": {
        base: "#D14213",
        mid: "#F3764A",
        light1: "#FEF8F5",
        hover: "#FAEDE7"
      },
      "maatschappij-welzijn": {
        base: "#C4387A", // Darker pink for better contrast
        mid: "#E399BB",
        light1: "#FDF6F9", // Almost white with pink tint
        hover: "#F9EAF2"
      },
      "economie-organisatie": {
        base: "#1E3476", // Darker blue for better contrast
        mid: "#3D66B8",
        light1: "#F6F8FD", // Almost white with blue tint
        hover: "#EAF0F9"
      },
      "schakeljaar": {
        base: "#1E3476",
        mid: "#3D66B8",
        light1: "#F6F8FD",
        hover: "#EAF0F9"
      },
      "okan": {
        base: "#C68212",
        mid: "#E5A021",
        light1: "#FEF9F2",
        hover: "#FCF1E2"
      }
    }
  },
  
  /* 
   * BLOK 2: Data beheer
   * Data properties en state management
   */
  data: {
    csvData: null,
    lastFetch: null,
    currentRichting: null,
    domainDisplayNames: {},
    isLoading: true,
    hasError: false,
    errorMessage: ''
  },
  
  /* 
   * BLOK 3: DOM elementen
   * Cache voor DOM elementen 
   */
  elements: {
    container: null,
    slidein: null,
    overlay: null,
    tableContainer: null,
    topbar: null
  },
  
  /* 
   * BLOK 4: Initialisatie
   * Opstart en intialisatie van de applicatie
   */
  init() {
    console.log(`Lessentabellen v${this.version} initializing...`);
    this.createRequiredElements();
    this.cacheElements();
    this.setupEventListeners();
    this.loadData();
    
    // Verbeterde detectie van tophoogte met meerdere pogingen
    this.setDynamicTop();
    setTimeout(() => this.setDynamicTop(), 500);
    setTimeout(() => this.setDynamicTop(), 1500);
    
    // Optioneel: toon versie-indicator
    this.showVersionIndicator();
  },
  
  createRequiredElements() {
    if (!document.getElementById('domains-container')) {
      const container = document.createElement('div');
      container.id = 'domains-container';
      container.className = 'lessentabellen-root';
      document.querySelector('.lessentabellen-root')?.appendChild(container) || document.body.appendChild(container);
    }
    
    if (!document.getElementById('slidein')) {
      const slidein = document.createElement('div');
      slidein.className = 'lessentabellen-wrapper lessentabellen-root';
      slidein.id = 'slidein';
      slidein.tabIndex = -1;
      slidein.innerHTML = `
        <button class="close-btn" aria-label="Sluiten" onclick="LessentabellenApp.closeSlidein()">×</button>
        <h2 id="opleiding-titel">&nbsp;</h2>
        <p id="opleiding-beschrijving"></p>
        <div class="action-buttons">
          <a id="brochure-link" href="#" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Brochure
          </a>
          <button onclick="window.print()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Afdrukken
          </button>
        </div>
        <div id="lessentabel-container"></div>
        <div id="footnotes"></div>
        <img class="logo-print" src="https://images.squarespace-cdn.com/content/v1/670992d66064015802d7e5dc/5425e461-06b0-4530-9969-4068d5a5dfdc/Scherm%C2%ADafbeelding+2024-12-03+om+09.38.12.jpg?format=1500w" alt="Redingenhof logo" />
        <div class="datum">Afgedrukt op: <span id="datum-print"></span></div>
        <div class="quote">SAMEN VER!</div>
      `;
      document.body.appendChild(slidein);
    }
    
    if (!document.getElementById('overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'overlay';
      overlay.className = 'lessentabellen-root';
      overlay.addEventListener('click', () => this.closeSlidein());
      document.body.appendChild(overlay);
    }
  },
  
  showVersionIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'version-indicator';
    indicator.textContent = `Lessentabellen v${this.version}`;
    document.body.appendChild(indicator);
    
    // Verberg na 5 seconden
    setTimeout(() => {
      indicator.style.opacity = '0';
      setTimeout(() => indicator.remove(), 1000);
    }, 5000);
  },
  
  cacheElements() {
    this.elements.container = document.getElementById("domains-container");
    this.elements.slidein = document.getElementById("slidein");
    this.elements.overlay = document.getElementById("overlay");
    this.elements.tableContainer = document.getElementById("lessentabel-container");
    this.elements.topbar = document.getElementById("custom-topbar");
    
    const rootElements = [
      this.elements.container, 
      this.elements.slidein, 
      this.elements.overlay
    ];
    
    rootElements.forEach(el => {
      if (el && !el.classList.contains('lessentabellen-root')) {
        el.classList.add('lessentabellen-root');
      }
    });
  },
  
  /* 
   * BLOK 5: Event Listeners
   * Event handling en reactiviteit
   */
  setupEventListeners() {
    // Window resize en scroll events
    window.addEventListener("resize", () => this.setDynamicTop());
    window.addEventListener("scroll", () => this.setDynamicTop());
    
    // Observeer veranderingen in de DOM die invloed kunnen hebben op layout
    this.setupMutationObserver();
    
    // Toetsenbord navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.elements.slidein?.classList.contains('open')) {
        this.closeSlidein();
      }
    });
    
    // URL hash changes
    window.addEventListener('hashchange', () => this.checkUrlHash());
  },
  
  setupMutationObserver() {
    // Observeer veranderingen aan de topbar en header om dynamisch aan te passen
    const topbarObserver = new MutationObserver(() => this.setDynamicTop());
    const header = document.querySelector('.Header--top') || document.querySelector("header");
    
    if (this.elements.topbar) {
      topbarObserver.observe(this.elements.topbar, { 
        attributes: true, 
        attributeFilter: ['style', 'class'], 
        childList: true,
        subtree: true
      });
    }
    
    if (header) {
      topbarObserver.observe(header, { 
        attributes: true, 
        attributeFilter: ['style', 'class'], 
        childList: true
      });
    }
  },
  
  /* 
   * BLOK 6: Data Laden
   * Functies voor het laden en verwerken van data
   */
  async loadData() {
    try {
      this.showLoading();
      const cached = this.getCachedData();
      if (cached) {
        this.data.csvData = cached.data;
        this.data.lastFetch = cached.timestamp;
        this.buildGrid();
        return;
      }
      
      const response = await fetch(this.config.csvUrl);
      if (!response.ok) {
        throw new Error(`CSV kon niet worden geladen (${response.status})`);
      }
      const csv = await response.text();
      const parsedData = this.parseCSV(csv);
      this.data.csvData = parsedData;
      this.data.lastFetch = Date.now();
      this.saveToCache(parsedData);
      this.buildGrid();
      
      // Controleer URL hash na data laden
      setTimeout(() => this.checkUrlHash(), 500);
      
    } catch (error) {
      console.error("Data laden mislukt:", error);
      this.handleError(error.message);
    } finally {
      this.hideLoading();
    }
  },
  
  showLoading() {
    this.data.isLoading = true;
    if (this.elements.container) {
      this.elements.container.innerHTML = '<div class="loader-spinner"></div>';
    }
  },
  
  hideLoading() {
    this.data.isLoading = false;
    const spinner = this.elements.container?.querySelector('.loader-spinner');
    if (spinner) spinner.remove();
  },
  
  handleError(message) {
    this.data.hasError = true;
    this.data.errorMessage = message;
    if (this.elements.container) {
      this.elements.container.innerHTML = `
        <div class="error-message">
          <h3>Er is een probleem opgetreden</h3>
          <p>${message}</p>
          <button onclick="LessentabellenApp.loadData()">Opnieuw proberen</button>
        </div>
      `;
    }
  },
  
  /* 
   * BLOK 7: Caching
   * Cache management voor performance
   */
  getCachedData() {
    try {
      const cached = localStorage.getItem('lessentabellen_cache');
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > this.config.cacheExpiry) {
        localStorage.removeItem('lessentabellen_cache');
        return null;
      }
      
      return { data, timestamp };
    } catch (e) {
      console.warn('Cache lezen mislukt:', e);
      return null;
    }
  },
  
  saveToCache(data) {
    try {
      const cache = {
        data: data,
        timestamp: Date.now()
      };
      localStorage.setItem('lessentabellen_cache', JSON.stringify(cache));
    } catch (e) {
      console.warn('Cache opslaan mislukt:', e);
    }
  },
  
  parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(";").map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(";").map(v => v.trim());
      return headers.reduce((obj, key, i) => {
        obj[key] = values[i] || '';
        return obj;
      }, {});
    });
  },
  
  /* 
   * BLOK 8: Hulpfuncties
   * Utility functies voor domein normalisatie, slugify, enz.
   */
  normalizeDomainName(rawDomain) {
    let d = rawDomain.toLowerCase().trim();
    d = d.replace(/[\s&]+/g, "-");
    
    if (d.includes("sport") && d.includes("topsport")) {
      return "topsport";
    }
    
    if (d === "economie-en-organisatie") {
      return "economie-organisatie";
    }
    
    return d;
  },
  
  slugify(text) {
    return text.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[\/]/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  },
  
  setDynamicTop() {
    if (!this.elements.slidein) return;
    
    // Zoek alle mogelijke headers en topbars
    const header = document.querySelector('.Header--top') || 
                   document.querySelector("header") || 
                   document.body;
    
    const topbar = document.getElementById('custom-topbar') || 
                  document.querySelector('.announcement-bar-wrapper');
    
    let totalHeight = 0;
    
    // Bereken header hoogte als deze zichtbaar is
    if (header) {
      const headerRect = header.getBoundingClientRect();
      const headerStyle = window.getComputedStyle(header);
      
      if (headerStyle.position === 'fixed' || headerStyle.position === 'sticky') {
        totalHeight += headerRect.height;
      }
    }
    
    // Voeg topbar hoogte toe als deze zichtbaar is
    if (topbar) {
      const topbarStyle = window.getComputedStyle(topbar);
      if (topbarStyle.display !== 'none' && 
          (topbarStyle.position === 'fixed' || topbarStyle.position === 'sticky')) {
        totalHeight += topbar.getBoundingClientRect().height;
      }
    }
    
    // Voeg veiligheidsmarge toe
    totalHeight = Math.max(totalHeight, 60);
    
    // Pas slidein positie aan
    this.elements.slidein.style.top = totalHeight + "px";
    this.elements.slidein.style.height = `calc(100% - ${totalHeight}px)`;
    document.documentElement.style.setProperty('--dynamic-top', `${totalHeight}px`);
  },
  
  /* 
   * BLOK 9: UI Generatie
   * Functies voor het bouwen van de gebruikersinterface
   */
  buildGrid() {
    if (!this.elements.container || !this.data.csvData) return;
    
    const structuur = this.organizeData();
    this.elements.container.innerHTML = "";
    
    if (Object.keys(structuur).length === 0) {
      this.elements.container.innerHTML = `
        <div class="not-found-message">
          <p>Geen lessentabellen gevonden.</p>
        </div>
      `;
      return;
    }
    
    for (const [normDomainKey, graden] of Object.entries(structuur)) {
      const block = document.createElement("div");
      block.className = "domain-block";
      block.dataset.domain = normDomainKey;
      
      const colors = this.config.domainColors[normDomainKey];
      if (colors) {
        block.style.setProperty("--domain-base", colors.base);
        block.style.setProperty("--domain-mid", colors.mid);
        block.style.setProperty("--domain-light1", colors.light1);
        block.style.setProperty("--domain-light2", colors.light1);
        block.style.setProperty("--domain-hover", colors.hover);
      }
      
      block.innerHTML = `<h2>${this.data.domainDisplayNames[normDomainKey]}</h2>`;
      
      ["TWEEDE GRAAD", "DERDE GRAAD"].forEach(graadKey => {
        const finaliteiten = graden[graadKey];
        if (!finaliteiten) return;
        
        const graadContainer = document.createElement("div");
        graadContainer.className = "graad-container";
        graadContainer.innerHTML = `<h3>${graadKey}</h3>`;
        
        for (const [finaliteit, richtingen] of Object.entries(finaliteiten)) {
          const finBlok = document.createElement("div");
          finBlok.className = "finaliteit-blok";
          finBlok.innerHTML = `<h4>${finaliteit}</h4>`;
          
          const ul = document.createElement("ul");
          richtingen.forEach(richting => {
            const linkSlug = this.slugify(richting);
            const li = document.createElement("li");
            li.innerHTML = `<a href="#${graadKey.toLowerCase()}-${linkSlug}" 
              data-graad="${graadKey}" 
              data-slug="${linkSlug}" 
              data-domain="${normDomainKey}">${richting}</a>`;
              
            li.querySelector('a').addEventListener('click', (e) => {
              e.preventDefault();
              this.openSlidein(graadKey, linkSlug, normDomainKey);
            });
            
            ul.appendChild(li);
          });
          
          finBlok.appendChild(ul);
          graadContainer.appendChild(finBlok);
        }
        
        block.appendChild(graadContainer);
      });
      
      this.elements.container.appendChild(block);
    }
  },
  
  organizeData() {
    if (!this.data.csvData) return {};
    
    const structuur = {};
    const seen = new Set();
    this.data.domainDisplayNames = {};
    
    this.data.csvData.forEach(r => {
      const rawDomain = r.domein?.trim() || "";
      if (!rawDomain) return;
      
      const normDomain = this.normalizeDomainName(rawDomain);
      if (!this.data.domainDisplayNames[normDomain]) {
        this.data.domainDisplayNames[normDomain] = rawDomain.toUpperCase();
      }
      
      const graadLabel = r.graad?.trim() || "";
      let graad = "";
      
      if (graadLabel.toLowerCase().includes("2de")) {
        graad = "TWEEDE GRAAD";
      } else if (graadLabel.toLowerCase().includes("3de")) {
        graad = "DERDE GRAAD";
      }
      
      const finaliteit = r.finaliteit?.trim() || "";
      const richting = r.titel?.trim() || "";
      
      if (!normDomain || !graad || !finaliteit || !richting) return;
      
      const key = `${normDomain}|${graad}|${finaliteit}|${richting}`;
      if (seen.has(key)) return;
      seen.add(key);
      
      if (!structuur[normDomain]) {
        structuur[normDomain] = {};
      }
      
      if (!structuur[normDomain][graad]) {
        structuur[normDomain][graad] = {};
      }
      
      if (!structuur[normDomain][graad][finaliteit]) {
        structuur[normDomain][graad][finaliteit] = [];
      }
      
      structuur[normDomain][graad][finaliteit].push(richting);
    });
    
    return structuur;
  },
  
  /* 
   * BLOK 10: Slidein Functies
   * Functies voor het slide-in paneel voor lessentabel
   */
  openSlidein(graad, slug, normDomainKey) {
    if (!this.elements.slidein || !this.elements.overlay) return;
    
    // Reset eventuele eerdere stijlen
    this.elements.slidein.removeAttribute('style');
    
    // Stel de correct layout in op basis van dynamic top
    this.setDynamicTop();
    
    const colors = this.config.domainColors[normDomainKey];
    if (colors) {
      this.elements.slidein.style.setProperty("--domain-base", colors.base);
      this.elements.slidein.style.setProperty("--domain-mid", colors.mid);
      this.elements.slidein.style.setProperty("--domain-light1", colors.light1);
      this.elements.slidein.style.setProperty("--domain-light2", colors.light1);
      this.elements.slidein.style.setProperty("--hover-row", colors.hover);
      this.elements.slidein.style.background = colors.light1;
      
      const titelElement = document.getElementById("opleiding-titel");
      if (titelElement) {
        titelElement.style.color = colors.base;
      }
    }
    
    this.elements.slidein.classList.add("open");
    this.elements.overlay.classList.add("show");
    
    const datum = new Date().toLocaleDateString("nl-BE", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    document.getElementById("datum-print").innerText = datum;
    
    const filteredData = this.filterDataByGraadAndSlug(graad, slug);
    const richtingData = filteredData[0] || {};
    
    const titelElement = document.getElementById("opleiding-titel");
    const beschrijvingElement = document.getElementById("opleiding-beschrijving");
    
    if (titelElement) {
      titelElement.innerText = richtingData.titel || "Onbekend";
    }
    
    if (beschrijvingElement) {
      beschrijvingElement.innerText = richtingData.beschrijving || "";
    }
    
    const brochureLink = document.getElementById("brochure-link");
    if (brochureLink) {
      if (richtingData.brochure) {
        brochureLink.href = richtingData.brochure;
        brochureLink.style.display = "inline-flex";
      } else {
        brochureLink.style.display = "none";
      }
    }
    
    this.buildLessonTable(filteredData);
    document.body.style.overflow = "hidden";
    
    setTimeout(() => {
      this.elements.slidein.focus();
      const urlSlug = `${graad.toLowerCase().replace(/\s+/g, '-')}-${slug}`;
      history.pushState(
        { graad, slug, domain: normDomainKey },
        '', 
        `#${urlSlug}`
      );
    }, 100);
    
    this.data.currentRichting = { graad, slug, domain: normDomainKey };
  },
  
  filterDataByGraadAndSlug(graad, slug) {
    if (!this.data.csvData) return [];
    
    return this.data.csvData.filter(r => {
      const rGraad = r.graad?.toLowerCase() || "";
      
      if (graad === "TWEEDE GRAAD" && rGraad.includes("2de")) {
        return this.slugify(r.titel) === slug;
      }
      
      if (graad === "DERDE GRAAD" && rGraad.includes("3de")) {
        return this.slugify(r.titel) === slug;
      }
      
      return false;
    });
  },
  
  closeSlidein() {
    if (!this.elements.slidein || !this.elements.overlay) return;
    
    this.elements.slidein.classList.remove("open");
    this.elements.overlay.classList.remove("show");
    document.body.style.overflow = "";
    history.pushState({}, '', location.pathname);
    this.data.currentRichting = null;
  },
  
  /* 
   * BLOK 11: Lessentabel
   * Functies voor het bouwen van de lessentabel
   */
  buildLessonTable(filteredData) {
    if (!this.elements.tableContainer) return;
    
    if (!filteredData || filteredData.length === 0) {
      this.elements.tableContainer.innerHTML = `
        <div class="error-message">
          <p>Geen lessentabel beschikbaar voor deze richting.</p>
        </div>`;
      document.getElementById("footnotes").innerHTML = "";
      return;
    }
    
    const klassen = [...new Set(filteredData.map(r => r.code))];
    const vakken = [...new Set(filteredData.map(r => r.label))];
    
    let tableHTML = `
      <table role="grid" aria-label="Lessentabel">
        <thead>
          <tr>
            <th scope="col">VAK</th>
            ${klassen.map(k => `<th scope="col">${k}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
    `;
    
    vakken.forEach(vak => {
      tableHTML += `<tr>`;
      tableHTML += `<td>${vak}</td>`;
      
      klassen.forEach(klas => {
        const cel = filteredData.find(r => r.code === klas && r.label === vak);
        tableHTML += `<td>${cel?.uren || ""}</td>`;
      });
      
      tableHTML += `</tr>`;
    });
    
    const showStageRow = klassen.some(klas =>
      filteredData.find(r => (
        r.code === klas && 
        r.stage_weken && 
        r.stage_weken.trim() !== "" && 
        r.stage_weken !== "0"
      ))
    );
    
    if (showStageRow) {
      tableHTML += `
        <tr class="stage-row">
          <td>Stage weken</td>
          ${klassen.map(klas => {
            const stageInfo = filteredData.find(r => r.code === klas)?.stage_weken || "";
            return `<td>${stageInfo}</td>`;
          }).join("")}
        </tr>
      `;
    }
    
    tableHTML += `</tbody></table>`;
    this.elements.tableContainer.innerHTML = tableHTML;
    
    const footnotesElement = document.getElementById("footnotes");
    if (footnotesElement) {
      const uniqueFootnotes = [...new Set(
        filteredData
          .map(r => (r.voetnoten || "").trim())
          .filter(v => v !== "")
      )];
      
      if (uniqueFootnotes.length > 0) {
        footnotesElement.innerHTML = `
          <p class="footnotes">${uniqueFootnotes.join(" &middot; ")}</p>
        `;
      } else {
        footnotesElement.innerHTML = "";
      }
    }
  },
  
  /* 
   * BLOK 12: URL Navigatie
   * Functies voor het verwerken van URL navigatie
   */
  checkUrlHash() {
    const hash = window.location.hash;
    if (!hash || hash === '#') return;
    
    const match = hash.substring(1).match(/^(tweede-graad|derde-graad)-(.+)$/);
    if (!match) return;
    
    const [, graadSlug, richtingSlug] = match;
    const graad = graadSlug === 'tweede-graad' ? 'TWEEDE GRAAD' : 'DERDE GRAAD';
    
    const richtingData = this.data.csvData?.find(r => {
      const rGraad = r.graad?.toLowerCase() || "";
      const isCorrectGraad = (
        (graad === "TWEEDE GRAAD" && rGraad.includes("2de")) ||
        (graad === "DERDE GRAAD" && rGraad.includes("3de"))
      );
      return isCorrectGraad && this.slugify(r.titel) === richtingSlug;
    });
    
    if (richtingData) {
      const normDomain = this.normalizeDomainName(richtingData.domein);
      this.openSlidein(graad, richtingSlug, normDomain);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  LessentabellenApp.init();
});

window.LessentabellenApp = LessentabellenApp;
