/**
 * Dynamische Lessentabellen - Hoofdbestand
 * Initialiseert en verbindt alle modules
 * @version 2.2.0
 * @copyright 2025 GO Campus Redingenhof
 */

// Gebruik dynamische imports voor de modules
async function loadModules() {
  try {
    // URLs voor de modules
    const baseUrl = 'https://cdn.jsdelivr.net/gh/GOcampusRedingenhof/lessenrooster@main/js/';
    
    // Dynamisch laden van modules
    await Promise.all([
      import(baseUrl + 'lessentabellen-config.js'),
      import(baseUrl + 'lessentabellen-data.js'),
      import(baseUrl + 'lessentabellen-utils.js'),
      import(baseUrl + 'lessentabellen-ui.js'),
      import(baseUrl + 'lessentabellen-events.js')
    ]);
    
    // Initialiseer de app
    LessentabellenApp.init();
  } catch (error) {
    console.error('Fout bij het laden van modules:', error);
  }
}

// Start het laden van modules
loadModules();
