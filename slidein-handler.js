const SlideinHandler = {
  open(slug) {
    document.getElementById("slidein").classList.add("open");
    document.getElementById("overlay").classList.add("show");

    const richting = window.csvData.find(r => Helpers.slugify(r.titel) === slug);
    if (!richting) {
      document.getElementById("opleiding-titel").textContent = "Niet gevonden";
      return;
    }

    document.getElementById("opleiding-titel").textContent = richting.titel;
    document.getElementById("opleiding-beschrijving").textContent = richting.beschrijving || "";
    document.getElementById("brochure-link").href = richting.brochure || "#";
    document.getElementById("brochure-link").style.display = richting.brochure ? "block" : "none";
    LessonTable.build(slug);
  },

  close() {
    document.getElementById("slidein").classList.remove("open");
    document.getElementById("overlay").classList.remove("show");
  }
};
