/**
 * Dynamische Lessentabellen - Events Module
 * Event handlers en event binding
 * @version 2.2.0
 * @copyright 2025 GO Campus Redingenhof
 */

const LessentabellenEvents = (function() {
  // Afhankelijkheden, zullen geïnjecteerd worden
  let config, data, ui, utils;
  
  /**
   * Initialisatie
   */
  function init(configModule, dataModule, uiModule, utilsModule) {
    config = configModule;
    data = dataModule;
    ui = uiModule;
    utils = utilsModule;
    
    setupEventListeners();
  }
  
  /**
   * Event listeners
   */
  function setupEventListeners() {
    // Window resize en scroll events
    window.addEventListener("resize", () => {
      data.setData('isMobile', window.innerWidth <= 768);
      utils.setDynamicTop();
    });
    
    window.addEventListener("scroll", () => utils.setDynamicTop());
    
    // Toetsenbord navigatie
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && 
          ui.getElements().slidein?.classList.contains(`${config.getConfig().prefixClass}open`)) {
        ui.closeSlidein();
      }
    });
    
    // URL hash changes
    window.addEventListener('hashchange', () => utils.checkUrlHash());
    
    // Print button
    const printButton = document.getElementById(`${config.getConfig().prefixClass.slice(0, -1)}-print-button`);
    if (printButton) {
      printButton.addEventListener('click', function() {
        window.print();
      });
    }
  }
  
  // Public API
  return {
    init,
    setupEventListeners
  };
})();

// Export voor gebruik in andere modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessentabellenEvents;
}
