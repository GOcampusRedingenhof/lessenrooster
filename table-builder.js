
function slugify(text) {
  return text.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[\/]/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function buildLessonTable(slug) {
  const container = document.getElementById("lessentabel-container");
  const data = window.csvData;

  console.log("🧪 Aangeklikte slug:", slug);
  console.log("🧪 Beschikbare titels:", [...new Set(data.map(r => r.titel))]);

  const matching = data.filter(r => slugify(r.titel.trim()) === slug.trim());
  console.log("🔍 Matching entries gevonden:", matching.length);

  if (matching.length === 0) {
    container.innerHTML = `<p style='color:red;'>Geen lessentabel beschikbaar voor slug: <code>${slug}</code></p>`;
    return;
  }

  const klassendata = {};
  const vakken = [];

  matching.forEach(r => {
    const klas = r["code"]?.trim();
    const vak = r["label"]?.trim();
    const uren = r["uren"]?.trim();

    if (!klas || !vak) return;
    if (!klassendata[klas]) klassendata[klas] = {};
    klassendata[klas][vak] = uren || "";

    if (!vakken.includes(vak)) {
      vakken.push(vak);
    }
  });

  const klassen = Object.keys(klassendata).sort();

  container.innerHTML = `
    <p style='font-size:0.9rem;color:#999;'>Richting: <strong>${slug}</strong></p>
    <p style='font-size:0.85rem;color:#999;'>Klassen: ${klassen.join(", ")}</p>
  `;

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  thead.innerHTML = "<tr><th>VAK</th>" + klassen.map(k => `<th>${k}</th>`).join("") + "</tr>";
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  vakken.forEach(vak => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${vak}</td>` + klassen.map(k => `<td>${klassendata[k][vak] || ""}</td>`).join("");
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}
