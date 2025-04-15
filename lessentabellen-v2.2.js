/**
 * Dynamische Lessentabellen - Hoofdbestand
 * Initialiseert en verbindt alle modules
 * @version 2.2.0
 * @copyright 2025 GO Campus Redingenhof
 */

// Gebruik een IIFE (Immediately Invoked Function Expression) om de code te isoleren
(function() {
  'use strict';
  
  // Controleer of de app al is gedefinieerd om dubbele instantiatie te voorkomen
  if (window.LessentabellenApp) {
    console.warn('Lessentabellen app is al gedefinieerd. Tweede instantiatie overgeslagen.');
    return;
  }
  
  // Applicatie object - Toegankelijk via window.LessentabellenApp
  const LessentabellenApp = {
    // Import modules
    config: LessentabellenConfig,
    data: LessentabellenData,
    ui: LessentabellenUI,
    utils: LessentabellenUtils,
    events: LessentabellenEvents,
    
    // Initialisatie
    init: function(skipElementCreation) {
      console.log(`Lessentabellen v${this.config.getVersion()} initializing...`);
      
      // Detecteer mobiel
      this.data.setData('isMobile', window.innerWidth <= 768);
      
      // Alleen DOM elementen aanmaken als dat nodig is
      if (!skipElementCreation) {
        this.createRequiredElements();
      }
      
      // Initialiseer modules en verbind ze
      this.initializeModules();
      
      // Laad data
      this.data.loadData();
      
      // Verbeterde detectie van tophoogte met meerdere pogingen
      this.utils.setDynamicTop();
      setTimeout(() => this.utils.setDynamicTop(), 500);
      setTimeout(() => this.utils.setDynamicTop(), 1500);
    },
    
    // Modules initialiseren en verbinden
    initializeModules: function() {
      // Initialiseer modules met dependencies
      this.utils.init(this.config, this.data, this.ui);
      this.data.init(this.config, this.utils, this.ui);
      this.ui.init(this.config, this.data, this.utils);
      this.events.init(this.config, this.data, this.ui, this.utils);
    },
    
    // DOM elementen creëren indien nodig
    createRequiredElements: function() {
      console.log("Checking if elements exist...");
      
      // Toon een waarschuwing als er al elementen bestaan met de naam zonder prefix
      const oldContainer = document.getElementById('lessentabellen-container');
      if (oldContainer) {
        console.warn('Een oude versie van lessentabellen-container is gevonden. Dit kan conflicten veroorzaken.');
      }
      
      const prefix = this.config.getConfig().prefixClass.slice(0, -1);
      
      // Als main container niet bestaat, maak deze aan
      if (!document.getElementById(`${prefix}-container`)) {
        console.log("Creating main container");
        const mainContainer = document.createElement('div');
        mainContainer.id = `${prefix}-container`;
        mainContainer.className = `${prefix}-root`;
        document.body.appendChild(mainContainer);
        
       mainContainer.innerHTML = `
          <div id="${prefix}-domains-container"></div>
          <div id="${prefix}-overlay"></div>
          <div class="${prefix}-wrapper" id="${prefix}-slidein" tabindex="-1">
            <button class="${prefix}-close-btn" aria-label="Sluiten">×</button>
            <h2 id="${prefix}-opleiding-titel">Lessentabel</h2>
            <p id="${prefix}-opleiding-beschrijving"></p>
            <div class="${prefix}-action-buttons">
              <a id="${prefix}-brochure-link" href="#" target="_blank">Brochure</a>
              <button id="${prefix}-print-button">Afdrukken</button>
            </div>
            <div id="${prefix}-lessentabel-container"></div>
            <div id="${prefix}-footnotes"></div>
            <img class="${prefix}-logo-print" src="https://images.squarespace-cdn.com/content/v1/670992d66064015802d7e5dc/5425e461-06b0-4530-9969-4068d5a5dfdc/Scherm%C2%ADafbeelding+2024-12-03+om+09.38.12.jpg?format=1500w" alt="Redingenhof logo" />
            <div class="${prefix}-datum">Afgedrukt op: <span id="${prefix}-datum-print"></span></div>
            <div class="${prefix}-quote">SAMEN VER!</div>
          </div>
        `;
      }
    },
    
    // Hulpfuncties
    loadData: function() {
      this.data.loadData();
    }
  };

  // Publieke interface exposeren
  window.LessentabellenApp = LessentabellenApp;
  
  // Automatische initialisatie bij DOMContentLoaded tenzij handmatig gedeactiveerd
  document.addEventListener('DOMContentLoaded', function() {
    // Detecteer autoInit=false als die is ingesteld
    const scriptTag = document.querySelector('script[src*="lessentabellen.js"][data-auto-init="false"]');
    if (scriptTag) {
      console.log("Lessentabellen autoInit uitgeschakeld. Handmatige initialisatie vereist.");
      return;
    }
    
    console.log("Document geladen, lessentabellen initialiseren...");
    LessentabellenApp.init(false);
  });
})();
