const LessonTable = {
  build(slug) {
    const data = window.csvData.filter(r => Helpers.slugify(r.titel) === slug);
    const container = document.getElementById("lessentabel-container");
    container.innerHTML = "";

    if (!data.length) {
      container.textContent = "Geen lessentabel beschikbaar.";
      return;
    }

    const klassen = [...new Set(data.map(r => r.code))];
    const vakken = [...new Set(data.map(r => r.label))];

    const table = document.createElement("table");
    table.innerHTML = `<thead><tr><th>VAK</th>${klassen.map(k => `<th>${k}</th>`).join("")}</tr></thead>`;

    const tbody = document.createElement("tbody");
    vakken.forEach(vak => {
      const row = `<tr><td>${vak}</td>${klassen.map(klas => `<td>${(data.find(r => r.code === klas && r.label === vak) || {}).uren || ""}</td>`).join("")}</tr>`;
      tbody.innerHTML += row;
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }
};
