/**
 * Dynamische Lessentabellen - Hoofdbestand
 * Initialiseert en verbindt alle modules
 * @version 2.2.1
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
  
  // Voeg eerst alle code van je modules direct toe in plaats van import te gebruiken
  // Kopieer hier de volledige inhoud van:
  // 1. lessentabellen-config.js
  // 2. lessentabellen-data.js 
  // 3. lessentabellen-utils.js
  // 4. lessentabellen-ui.js
  // 5. lessentabellen-events.js
  
  // BELANGRIJK: Voeg alle module-code hier samen, niet als imports

  // Voorbeeld (vervang dit door de werkelijke code):
  const LessentabellenConfig = {
    // ... config code ...
  };
  
  const LessentabellenData = (function() {
    // ... data module code ...
    return { /* public API */ };
  })();
  
  const LessentabellenUtils = (function() {
    // ... utils module code ...
    return { /* public API */ };
  })();
  
  const LessentabellenUI = (function() {
    // ... UI module code ...
    return { /* public API */ };
  })();
  
  const LessentabellenEvents = (function() {
    // ... events module code ...
    return { /* public API */ };
  })();
  
  // Applicatie object - Toegankelijk via window.LessentabellenApp
  const LessentabellenApp = {
    // Modules
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
      // ... createRequiredElements code ...
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
    const scriptTag = document.querySelector('script[src*="lessentabellen-v2.2.js"][data-auto-init="false"]');
    if (scriptTag) {
      console.log("Lessentabellen autoInit uitgeschakeld. Handmatige initialisatie vereist.");
      return;
    }
    
    console.log("Document geladen, lessentabellen initialiseren...");
    LessentabellenApp.init(true);
  });
})();
