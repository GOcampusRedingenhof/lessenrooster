/**
 * Dynamische Lessentabellen - Config Module
 * Configuratie en constanten
 * @version 2.2.0
 * @copyright 2025 GO Campus Redingenhof
 */

const LessentabellenConfig = {
  // Versie en configuratie
  version: '2.2.0',
  
  config: {
    prefixClass: 'les-', // Prefix voor geïsoleerde CSS
    csvUrl: "https://raw.githubusercontent.com/GOcampusRedingenhof/lessenrooster/refs/heads/main/lessentabellen_tabel.csv",
    cacheExpiry: 1000 * 60 * 60, // 1 uur cache
    domainColors: {
      "stem": {
        base: "#0A7254", // Verbeterd contrast
        mid: "#48A787",
        light1: "#F5FDFB",
        hover: "#E4F5F0"
      },
      "topsport": {
        base: "#0A6180", // Verbeterd contrast
        mid: "#1B88AE",
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
        base: "#C4387A", // Verbeterd contrast
        mid: "#E399BB",
        light1: "#FDF6F9",
        hover: "#F9EAF2"
      },
      "economie-organisatie": {
        base: "#1A2F6E", // Verbeterd contrast
        mid: "#2D54AE", 
        light1: "#F6F8FD",
        hover: "#EAF0F9"
      },
      "schakeljaar": {
        base: "#18306F", // Verbeterd contrast
        mid: "#2F56B0",
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
  
  // Exporteer configuratie
  getConfig: function() {
    return this.config;
  },
  
  getVersion: function() {
    return this.version;
  }
};

// Export voor gebruik in andere modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LessentabellenConfig;
}
