const Helpers = {
  slugify(text) {
    return text.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[\/]/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  },

  async fetchCSV(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const csv = await res.text();
      return csv.trim().split("\n").map(line => line.split(';').map(v => v.trim()));
    } catch (e) {
      console.error("Fout bij laden CSV:", e);
      return [];
    }
  },

  parseCSV(csvArray) {
    const [headers, ...rows] = csvArray;
    return rows.map(row => headers.reduce((acc, header, idx) => {
      acc[header] = row[idx] || '';
      return acc;
    }, {}));
  }
};
