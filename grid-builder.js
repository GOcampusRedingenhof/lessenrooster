const GridBuilder = {
  build(data) {
    const container = document.getElementById("domains-container");
    container.innerHTML = "";

    const structuur = {};

    data.forEach(({ domein, graad, finaliteit, titel }) => {
      if (!domein || !graad || !finaliteit || !titel) return;
      const graadKey = graad.includes("2de") ? "TWEEDE GRAAD" : "DERDE GRAAD";
      structuur[domein] ??= {};
      structuur[domein][graadKey] ??= {};
      structuur[domein][graadKey][finaliteit] ??= [];
      structuur[domein][graadKey][finaliteit].push(titel);
    });

    Object.entries(structuur).forEach(([domein, graden]) => {
      const wrapper = document.createElement("div");
      wrapper.className = "domain-wrapper";
      wrapper.dataset.domain = Helpers.slugify(domein);

      wrapper.innerHTML = `<div class="domain-header"><h2>${domein}</h2></div>`;

      const gradeContainer = document.createElement("div");
      gradeContainer.className = "grade-container";

      Object.entries(graden).forEach(([graad, finaliteiten]) => {
        const graadBlok = document.createElement("div");
        graadBlok.className = "graad-blok";
        graadBlok.innerHTML = `<strong class="grade-label">${graad}</strong>`;

        Object.entries(finaliteiten).forEach(([finaliteit, richtingen]) => {
          const finaliteitBlok = document.createElement("div");
          finaliteitBlok.className = "finaliteit-blok";
          finaliteitBlok.innerHTML = `<h3>${finaliteit}</h3><ul>` +
            richtingen.map(r => `<li><a href=\"#\" onclick=\"SlideinHandler.open('${Helpers.slugify(r)}')\">${r}</a></li>`).join("") +
            `</ul>`;
          graadBlok.appendChild(finaliteitBlok);
        });

        gradeContainer.appendChild(graadBlok);
      });

      wrapper.appendChild(gradeContainer);
      container.appendChild(wrapper);
    });
  }
};
