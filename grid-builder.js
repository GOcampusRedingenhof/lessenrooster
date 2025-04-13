
function slugify(text) {
  return text.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[\/]/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
function buildGrid(data) {
  const container = document.getElementById("domains-container");
  const structuur = {};
  const seen = new Set();
  data.forEach(item => {
    const domein = item["domein"];
    const graadRaw = item["graad"].trim();
    const graad = graadRaw.toLowerCase().includes("2de") ? "TWEEDE GRAAD" : "DERDE GRAAD";
    const finaliteit = item["finaliteit"];
    const richting = item["titel"];
    const key = `${domein}|${graad}|${finaliteit}|${richting}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (!structuur[domein]) structuur[domein] = {};
    if (!structuur[domein][graad]) structuur[domein][graad] = {};
    if (!structuur[domein][graad][finaliteit]) structuur[domein][graad][finaliteit] = [];
    structuur[domein][graad][finaliteit].push(richting);
  });
  Object.entries(structuur).forEach(([domein, graden]) => {
    const block = document.createElement("div");
    block.className = "domain-block";
    block.setAttribute("data-domain", domein.toLowerCase());
    block.innerHTML = `<h2>${domein.toUpperCase()}</h2>`;
    const graadVolgorde = ["TWEEDE GRAAD", "DERDE GRAAD"];
    graadVolgorde.forEach(graad => {
      if (!graden[graad]) return;
      const graadContainer = document.createElement("div");
      graadContainer.className = "domain-card";
      graadContainer.innerHTML = `<strong class="grade-label">${graad}</strong>`;
      Object.entries(graden[graad]).forEach(([finaliteit, richtingen]) => {
        const finaliteitBlock = document.createElement("div");
        finaliteitBlock.innerHTML = `<h3>${finaliteit}</h3><ul>${
          richtingen.map(r => {
            const slug = slugify(r);
            return `<li><a href="#" onclick="openSlidein('${slug}')">${r}</a></li>`;
          }).join("")
        }</ul>`;
        graadContainer.appendChild(finaliteitBlock);
      });
      block.appendChild(graadContainer);
    });
    container.appendChild(block);
  });
}
