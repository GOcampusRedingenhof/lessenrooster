/**
 * Dynamische Lessentabellen - Utils Module
 * Helper functies
 * @version 2.2.0
 * @copyright 2025 GO Campus Redingenhof
 */

const LessentabellenUtils = (function() {
  // Afhankelijkheden, zullen geïnjecteerd worden
  let config, data, ui;
  
  /**
   * Initialisatie
   */
  function init(configModule, dataModule, uiModule) {
    config = configModule;
    data = dataModule;
    ui = uiModule;
  }
  
  /**
   * Normaliseer domeinnaam
   */
  function normalizeDomainName(rawDomain) {
    let d = rawDomain.toLowerCase().trim();
    d = d.replace(/[\s&]+/g, "-");
    
    if (d.includes("sport") && d.includes("topsport")) {
      return "topsport";
    }
    
    if (d === "economie-en-organisatie") {
      return "economie-organisatie";
    }
    
    return d;
  }
  
  /**
   * Slugify tekst voor URL
   */
  function slugify(text) {
    return text.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[\/]/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
  
  /**
   * Stel dynamische top positie in
   */
  function setDynamicTop() {
    const slidein = document.getElementById("les-slidein");
    if (!slidein) return;
    
    // Voor mobiel, gebruik bottom positionering
    if (data.getData().isMobile) {
      slidein.style.top = "auto";
      slidein.style.bottom = "0";
      slidein.style.height = "85%";
      return;
    }
    
    // Desktop versie - zoek headers en topbars
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
    slidein.style.top = totalHeight + "px";
    slidein.style.height = `calc(100% - ${totalHeight}px)`;
    document.documentElement.style.setProperty('--les-dynamic-top', `${totalHeight}px`);
  }
  
  /**
   * Controleer URL hash
   */
  function checkUrlHash() {
    const hash = window.location.hash;
    if (!hash || hash === '#') return;
    
    const match = hash.substring(1).match(/^(tweede-graad|derde-graad)-(.+)$/);
    if (!match) return;
    
    const [, graadSlug, richtingSlug] = match;
    const graad = graadSlug === 'tweede-graad' ? 'TWEEDE GRAAD' : 'DERDE GRAAD';
    
    const richtingData = data.getData().csvData?.find(r => {
      const rGraad = r.graad?.toLowerCase() || "";
      const isCorrectGraad = (
        (graad === "TWEEDE GRAAD" && rGraad.includes("2de")) ||
        (graad === "DERDE GRAAD" && rGraad.includes("3de"))
      );
      return isCorrectGraad && slugify(r.titel) === richtingSlug;
    });
    
    if (richtingData) {
      const normDomain = normalizeDomainName(richtingData.domein);
      ui.openSlidein(graad, richtingSlug, normDomain);
    }
  }
  
  // Public API
  return {
    init,
    normalizeDomainName,
    slugify,
    setDynamicTop,
    checkUrlHash
  };
})();

// Export voor gebruik in andere modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessentabellenUtils;
}
