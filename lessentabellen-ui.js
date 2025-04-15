/**
 * Dynamische Lessentabellen - UI Module
 * UI rendering en DOM manipulatie
 * @version 2.2.0
 * @copyright 2025 GO Campus Redingenhof
 */

const LessentabellenUI = (function() {
  // Afhankelijkheden, zullen geïnjecteerd worden
  let config, data, utils;
  
  // DOM elementen
  let elements = {
    container: null,
    slidein: null,
    overlay: null,
    tableContainer: null,
    topbar: null
  };
  
  /**
   * Initialisatie
   */
  function init(configModule, dataModule, utilsModule) {
    config = configModule;
    data = dataModule;
    utils = utilsModule;
    
    cacheElements();
  }
  
  /**
   * DOM elementen cachen
   */
  function cacheElements() {
    const prefix = config.getConfig().prefixClass.slice(0, -1); // Verwijder het streepje aan het einde
    
    elements.container = document.getElementById(`${prefix}-domains-container`);
    elements.slidein = document.getElementById(`${prefix}-slidein`);
    elements.overlay = document.getElementById(`${prefix}-overlay`);
    elements.tableContainer = document.getElementById(`${prefix}-lessentabel-container`);
    elements.topbar = document.getElementById("custom-topbar");
    
    // Event listeners voor knoppen
    const printButton = document.getElementById(`${prefix}-print-button`);
    if (printButton) {
      printButton.addEventListener('click', function() {
        window.print();
      });
    }
    
    const closeButton = document.querySelector(`.${prefix}-close-btn`);
    if (closeButton) {
      closeButton.addEventListener('click', closeSlidein);
    }
  }
  
  /**
   * Toon laadindicator
   */
  function showLoading() {
    data.setData('isLoading', true);
    if (elements.container) {
      elements.container.innerHTML = `<div class="${config.getConfig().prefixClass}loader-spinner"></div>`;
    }
  }
  
  /**
   * Verberg laadindicator
   */
  function hideLoading() {
    data.setData('isLoading', false);
    const spinner = elements.container?.querySelector(`.${config.getConfig().prefixClass}loader-spinner`);
    if (spinner) spinner.remove();
  }
  
  /**
   * Toon foutmelding
   */
  function handleError(message) {
    data.setData('hasError', true);
    data.setData('errorMessage', message);
    if (elements.container) {
      elements.container.innerHTML = `
        <div class="${config.getConfig().prefixClass}error-message">
          <h3>Er is een probleem opgetreden</h3>
          <p>${message}</p>
          <button onclick="LessentabellenApp.loadData()">Opnieuw proberen</button>
        </div>
      `;
    }
  }
  
  /**
   * Bouw grid
   */
  function buildGrid() {
    if (!elements.container || !data.getData().csvData) return;
    
    const structuur = data.organizeData();
    elements.container.innerHTML = "";
    
    if (Object.keys(structuur).length === 0) {
      elements.container.innerHTML = `
        <div class="${config.getConfig().prefixClass}not-found-message">
          <p>Geen lessentabellen gevonden.</p>
        </div>
      `;
      return;
    }
    
    for (const [normDomainKey, graden] of Object.entries(structuur)) {
      const block = document.createElement("div");
      block.className = `${config.getConfig().prefixClass}domain-block`;
      block.dataset.domain = normDomainKey;
      
      const colors = config.getConfig().domainColors[normDomainKey];
      if (colors) {
        block.style.setProperty("--les-domain-base", colors.base);
        block.style.setProperty("--les-domain-mid", colors.mid);
        block.style.setProperty("--les-domain-light1", colors.light1);
        block.style.setProperty("--les-domain-light2", colors.light1);
        block.style.setProperty("--les-domain-hover", colors.hover);
      }
      
      block.innerHTML = `<h2>${data.getData().domainDisplayNames[normDomainKey]}</h2>`;
      
      ["TWEEDE GRAAD", "DERDE GRAAD"].forEach(graadKey => {
        const finaliteiten = graden[graadKey];
        if (!finaliteiten) return;
        
        const graadContainer = document.createElement("div");
        graadContainer.className = `${config.getConfig().prefixClass}graad-container`;
        graadContainer.innerHTML = `<h3>${graadKey}</h3>`;
        
        for (const [finaliteit, richtingen] of Object.entries(finaliteiten)) {
          const finBlok = document.createElement("div");
          finBlok.className = `${config.getConfig().prefixClass}finaliteit-blok`;
          finBlok.innerHTML = `<h4>${finaliteit}</h4>`;
          
          const ul = document.createElement("ul");
          richtingen.forEach(richting => {
            const linkSlug = utils.slugify(richting);
            const li = document.createElement("li");
            li.innerHTML = `<a href="#${graadKey.toLowerCase()}-${linkSlug}" 
              data-graad="${graadKey}" 
              data-slug="${linkSlug}" 
              data-domain="${normDomainKey}">${richting}</a>`;
              
            li.querySelector('a').addEventListener('click', (e) => {
              e.preventDefault();
              openSlidein(graadKey, linkSlug, normDomainKey);
            });
            
            ul.appendChild(li);
          });
          
          finBlok.appendChild(ul);
          graadContainer.appendChild(finBlok);
        }
        
        block.appendChild(graadContainer);
      });
      
      elements.container.appendChild(block);
    }
  }
  
  /**
   * Open slidein panel
   */
  function openSlidein(graad, slug, normDomainKey) {
    if (!elements.slidein || !elements.overlay) return;
    
    // Reset eventuele eerdere stijlen
    elements.slidein.removeAttribute('style');
    
    // Stel de correct layout in op basis van dynamic top
    utils.setDynamicTop();
    
    const colors = config.getConfig().domainColors[normDomainKey];
    if (colors) {
      elements.slidein.style.setProperty("--les-domain-base", colors.base);
      elements.slidein.style.setProperty("--les-domain-mid", colors.mid);
      elements.slidein.style.setProperty("--les-domain-light1", colors.light1);
      elements.slidein.style.setProperty("--les-domain-light2", colors.light1);
      elements.slidein.style.setProperty("--les-hover-row", colors.hover);
      elements.slidein.style.background = colors.light1;
      
      const titelElement = document.getElementById("les-opleiding-titel");
      if (titelElement) {
        titelElement.style.color = colors.base;
      }
    }
    
    elements.slidein.classList.add(`${config.getConfig().prefixClass}open`);
    elements.overlay.classList.add(`${config.getConfig().prefixClass}show`);
    
    const datum = new Date().toLocaleDateString("nl-BE", {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    document.getElementById("les-datum-print").innerText = datum;
    
    const filteredData = data.filterDataByGraadAndSlug(graad, slug);
    const richtingData = filteredData[0] || {};
    
    const titelElement = document.getElementById("les-opleiding-titel");
    const beschrijvingElement = document.getElementById("les-opleiding-beschrijving");
    
    if (titelElement) {
      titelElement.innerText = richtingData.titel || "Onbekend";
    }
    
    if (beschrijvingElement) {
      beschrijvingElement.innerText = richtingData.beschrijving || "";
    }
    
    const brochureLink = document.getElementById("les-brochure-link");
    if (brochureLink) {
      if (richtingData.brochure) {
        brochureLink.href = richtingData.brochure;
        brochureLink.style.display = "inline-flex";
      } else {
        brochureLink.style.display = "none";
      }
    }
    
    buildLessonTable(filteredData);
    document.body.style.overflow = "hidden";
    
    setTimeout(() => {
      elements.slidein.focus();
      const urlSlug = `${graad.toLowerCase().replace(/\s+/g, '-')}-${slug}`;
      history.pushState(
        { graad, slug, domain: normDomainKey },
        '', 
        `#${urlSlug}`
      );
    }, 100);
    
    data.setData('currentRichting', { graad, slug, domain: normDomainKey });
  }
  
  /**
   * Sluit slidein panel
   */
  function closeSlidein() {
    if (!elements.slidein || !elements.overlay) return;
    
    elements.slidein.classList.remove(`${config.getConfig().prefixClass}open`);
    elements.overlay.classList.remove(`${config.getConfig().prefixClass}show`);
    document.body.style.overflow = "";
    history.pushState({}, '', location.pathname);
    data.setData('currentRichting', null);
  }
  
  /**
   * Bouw lessentabel
   */
  function buildLessonTable(filteredData) {
    if (!elements.tableContainer) return;
    
    if (!filteredData || filteredData.length === 0) {
      elements.tableContainer.innerHTML = `
        <div class="${config.getConfig().prefixClass}error-message">
          <p>Geen lessentabel beschikbaar voor deze richting.</p>
        </div>`;
      document.getElementById("les-footnotes").innerHTML = "";
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
        <tr class="${config.getConfig().prefixClass}stage-row">
          <td>Stage weken</td>
          ${klassen.map(klas => {
            const stageInfo = filteredData.find(r => r.code === klas)?.stage_weken || "";
            return `<td>${stageInfo}</td>`;
          }).join("")}
        </tr>
      `;
    }
    
    tableHTML += `</tbody></table>`;
    elements.tableContainer.innerHTML = tableHTML;
    
    const footnotesElement = document.getElementById("les-footnotes");
    if (footnotesElement) {
      const uniqueFootnotes = [...new Set(
        filteredData
          .map(r => (r.voetnoten || "").trim())
          .filter(v => v !== "")
      )];
      
      if (uniqueFootnotes.length > 0) {
        footnotesElement.innerHTML = `
          <p class="${config.getConfig().prefixClass}footnotes">${uniqueFootnotes.join(" &middot; ")}</p>
        `;
      } else {
        footnotesElement.innerHTML = "";
      }
    }
  }
  
  /**
   * Get elements object
   */
  function getElements() {
    return elements;
  }
  
  // Public API
  return {
    init,
    buildGrid,
    cacheElements,
    showLoading,
    hideLoading,
    handleError,
    openSlidein,
    closeSlidein,
    getElements
  };
})();

// Export voor gebruik in andere modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessentabellenUI;
}
