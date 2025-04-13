
async function loadCSVData(url) {
  const res = await fetch(url);
  const csv = await res.text();
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(";").map(h => h.trim());
  const data = lines.slice(1).map(line => {
    const values = line.split(";").map(v => v.trim());
    return headers.reduce((obj, key, i) => {
      obj[key] = values[i] || '';
      return obj;
    }, {});
  });
  window.csvData = data;
  console.log("✅ CSV geladen:", data.length, "rijen");
  buildGrid(data);
}
loadCSVData("https://raw.githubusercontent.com/GOcampusRedingenhof/lessenrooster/refs/heads/main/lessentabellen_tabel.csv");
