const puppeteer = require("puppeteer");
const fs = require("fs");
const utils = require("./utils");

const RESULTS_PER_PAGE = 2000;

// const url =
//   "https://subastas.boe.es/subastas_ava.php?campo%5B0%5D=SUBASTA.ORIGEN&dato%5B0%5D=&campo%5B1%5D=SUBASTA.ESTADO&dato%5B1%5D=PC&campo%5B2%5D=BIEN.TIPO&dato%5B2%5D=I&dato%5B3%5D=&campo%5B4%5D=BIEN.DIRECCION&dato%5B4%5D=&campo%5B5%5D=BIEN.CODPOSTAL&dato%5B5%5D=&campo%5B6%5D=BIEN.LOCALIDAD&dato%5B6%5D=&campo%5B8%5D=SUBASTA.POSTURA_MINIMA_MINIMA_LOTES&dato%5B8%5D=&campo%5B9%5D=SUBASTA.NUM_CUENTA_EXPEDIENTE_1&dato%5B9%5D=&campo%5B10%5D=SUBASTA.NUM_CUENTA_EXPEDIENTE_2&dato%5B10%5D=&campo%5B11%5D=SUBASTA.NUM_CUENTA_EXPEDIENTE_3&dato%5B11%5D=&campo%5B12%5D=SUBASTA.NUM_CUENTA_EXPEDIENTE_4&dato%5B12%5D=&campo%5B13%5D=SUBASTA.NUM_CUENTA_EXPEDIENTE_5&dato%5B13%5D=&campo%5B14%5D=SUBASTA.ID_SUBASTA_BUSCAR&dato%5B14%5D=&campo%5B15%5D=SUBASTA.FECHA_FIN_YMD&dato%5B15%5D%5B0%5D=&dato%5B15%5D%5B1%5D=&campo%5B16%5D=SUBASTA.FECHA_INICIO_YMD&dato%5B16%5D%5B0%5D=&dato%5B16%5D%5B1%5D=&page_hits=500&sort_field%5B0%5D=SUBASTA.FECHA_FIN_YMD&sort_order%5B0%5D=desc&sort_field%5B1%5D=SUBASTA.FECHA_FIN_YMD&sort_order%5B1%5D=asc&sort_field%5B2%5D=SUBASTA.HORA_FIN&sort_order%5B2%5D=asc&accion=Buscar";

const getUrl = (resultsRange = 0, resultsPerPage = RESULTS_PER_PAGE) =>
  `https://subastas.boe.es/subastas_ava.php?accion=Mas&id_busqueda=_cjliQkZ0a0RXT1NOUDZiNjFzSmU0VldJUjE1MDJRalZGMmEzcmgwZVd6WDVDNTR0aHRTaW5YeUIweTQ2V28yZy9HUnU0TGdnaUtyQnlKZnJqTmU0eHlLSHpkaGZjVU5NVy81Qnl3MVBKODZtSU1Ic2FFTGYwY044OGdsV1NibUtkMUF2VUtOa05qeWl5Q0M1Z2tQaEduemd6eHJrMWI4b0VrVzVsOVU4WCsvQWlDM3ppUG5zVFE2ZGtKNVBabStIR0daaEFxRys0ZmVIeitTRVdzK2lEVW83czd1UkMwS3dKSDhZc0YyQzhxNlRFODZOM2tzQkFvQkpGVkw5c1NjL3VlcTlHV3M5RGwzc1NYS2lYc2FYMDRtU1FOMUVBQTdyNzhnM0VlTm5seUU9-${resultsRange}-${resultsPerPage}`;

// .paginar p

// id=contenido
// No se han encontrado documentos

const getRecordsFromPage = async (page) => {
  const recordsInPage = await page.evaluate(() => {
    let pagSig = document.querySelector(".pagSig");
    const records = [];

    const links = document.querySelectorAll(".resultado-busqueda");

    let i;
    for (i = 0; i < links.length; i++) {
      const lot = links[i].innerText.includes("lotes");
      const linkA = links[i].querySelector(".resultado-busqueda-link-defecto");
      const href = linkA.href;
      const queryParamsString = href.substring(href.indexOf("?") + 1);
      const queryParams = new URLSearchParams(queryParamsString);

      const subId = queryParams.get("idSub");

      records.push({ subId, href, lot });
    }

    return records;
  });

  return recordsInPage;
};

(async () => {
  const start = Date.now();
  console.log("Starting crawling...");

  const browser = await puppeteer.launch();
  const resultsPage = await browser.newPage();

  let records = [];

  let step = 0;

  while (true) {
    console.log(`::: Crawling page ${step + 1} ::: \n`);
    let newRange = RESULTS_PER_PAGE * step;
    url = getUrl(newRange);
    await resultsPage.goto(url);
    console.log("resultsPage", resultsPage);

    const pageRecords = await getRecordsFromPage(resultsPage);

    records = [...records, ...pageRecords];
    console.log(`::: Done crawling page ${step + 1} :::\n`);

    if (!pageRecords.length) {
      break;
    } else {
      step += 1;
    }
  }

  const elapsedTime = (Date.now() - start) / 1000;

  console.log(`Number of records crawled: ${records.length}`);
  console.log(`Elapsed time: ${elapsedTime} seconds`);

  const jsonData = JSON.stringify(records);

  utils.writeResults("results", jsonData);

  await browser.close();
})();
