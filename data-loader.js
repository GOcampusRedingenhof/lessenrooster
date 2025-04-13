async function loadAndBuild(url) {
  const csvArray = await Helpers.fetchCSV(url);
  const data = Helpers.parseCSV(csvArray);
  window.csvData = data;
  GridBuilder.build(data);
}
