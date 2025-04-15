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
    
    data.csvData.forEach(r =>
