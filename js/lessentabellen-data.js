/**
 * Dynamische Lessentabellen - Data Module
 * Data management (laden, parsen, caching)
 * @version 2.2.0
 * @copyright 2025 GO Campus Redingenhof
 */

const LessentabellenData = (function() {
  // Data en state
  let data = {
    csvData: null,
    lastFetch: null,
    currentRichting: null,
    domainDisplayNames: {},
    isLoading: true,
    hasError: false,
    errorMessage: '',
    isMobile: false
  };
  
  // Afhankelijkheden, zullen geïnjecteerd worden
  let config, utils, ui;
  
  /**
   * Initialisatie
   */
  function init(configModule, utilsModule, uiModule) {
    config = configModule;
    utils = utilsModule;
    ui = uiModule;
  }
  
  /**
   * Data laden
   */
  async function loadData() {
    try {
      ui.showLoading();
      
      const cached = getCachedData();
      if (cached) {
        data.csvData = cached.data;
        data.lastFetch = cached.timestamp;
        ui.buildGrid();
        return;
      }
      
      const response = await fetch(config.getConfig().csvUrl);
      if (!response.ok) {
        throw new Error(`CSV kon niet worden geladen (${response.status})`);
      }
      
      const csv = await response.text();
      const parsedData = parseCSV(csv);
      data.csvData = parsedData;
      data.lastFetch = Date.now();
      saveToCache(parsedData);
      ui.buildGrid();
      
      // Controleer URL hash na data laden
      setTimeout(() => utils.checkUrlHash(), 500);
      
    } catch (error) {
      console.error("Data laden mislukt:", error);
      ui.handleError(error.message);
    } finally {
      ui.hideLoading();
    }
  }
  
  /**
   * Cache data ophalen
   */
  function getCachedData() {
    try {
      const cached = localStorage.getItem('lessentabellen_cache');
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > config.getConfig().cacheExpiry) {
        localStorage.removeItem('lessentabellen_cache');
        return null;
      }
      
      return { data, timestamp };
    } catch (e) {
      console.warn('Cache lezen mislukt:', e);
      return null;
    }
  }
  
  /**
   * Data naar cache schrijven
   */
  function saveToCache(data) {
    try {
      localStorage.removeItem('lessentabellen_cache'); // Verwijder oude cache
      const cache = {
        data: data,
        timestamp: Date.now()
      };
      localStorage.setItem('lessentabellen_cache', JSON.stringify(cache));
    } catch (e) {
      console.warn('Cache opslaan mislukt:', e);
    }
  }
  
  /**
   * CSV parsen
   */
  function parseCSV(csvText) {
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(";").map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(";").map(v => v.trim());
      return headers.reduce((obj, key, i) => {
        obj[key] = values[i] || '';
        return obj;
      }, {});
    });
  }
  
  /**
   * Organiseer data in structuur
   */
  function organizeData() {
    if (!data.csvData) return {};
    
    const structuur = {};
    const seen = new Set();
    data.domainDisplayNames = {};
    
    data.csvData.forEach(r => {
      const rawDomain = r.domein?.trim() || "";
      if (!rawDomain) return;
      
      const normDomain = utils.normalizeDomainName(rawDomain);
      if (!data.domainDisplayNames[normDomain]) {
        data.domainDisplayNames[normDomain] = rawDomain.toUpperCase();
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
  }
  
  /**
   * Filter data op graad en slug
   */
  function filterDataByGraadAndSlug(graad, slug) {
    if (!data.csvData) return [];
    
    return data.csvData.filter(r => {
      const rGraad = r.graad?.toLowerCase() || "";
      
      if (graad === "TWEEDE GRAAD" && rGraad.includes("2de")) {
        return utils.slugify(r.titel) === slug;
      }
      
      if (graad === "DERDE GRAAD" && rGraad.includes("3de")) {
        return utils.slugify(r.titel) === slug;
      }
      
      return false;
    });
  }
  
  /**
   * Get data object
   */
  function getData() {
    return data;
  }
  
  /**
   * Set data object value
   */
  function setData(key, value) {
    data[key] = value;
  }
  
  // Public API
  return {
    init,
    loadData,
    organizeData,
    filterDataByGraadAndSlug,
    getData,
    setData
  };
})();

// Export voor gebruik in andere modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessentabellenData;
}
