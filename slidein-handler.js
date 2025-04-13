
function openSlidein(slug) {
  const slidein = document.getElementById("slidein");
  const overlay = document.getElementById("overlay");

  slidein.classList.add("open");
  overlay.classList.add("show");

  const data = window.csvData;
  const richting = data.find(r => slugify(r.titel.trim()) === slug);
  if (!richting) {
    document.getElementById("opleiding-titel").innerText = "Richting niet gevonden";
    document.getElementById("opleiding-beschrijving").innerText = "";
    document.getElementById("brochure-link").style.display = "none";
    document.getElementById("lessentabel-container").innerHTML = "";
    return;
  }

  document.getElementById("opleiding-titel").innerText = richting.titel;
  document.getElementById("opleiding-beschrijving").innerText = richting.beschrijving || "";
  document.getElementById("brochure-link").href = richting.brochure || "#";
  document.getElementById("brochure-link").style.display = richting.brochure ? "inline-block" : "none";

  buildLessonTable(slug);
}

function closeSlidein() {
  const slidein = document.getElementById("slidein");
  const overlay = document.getElementById("overlay");
  slidein.classList.remove("open");
  overlay.classList.remove("show");
}
