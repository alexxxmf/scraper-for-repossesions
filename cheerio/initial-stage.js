const axios = require("axios");
const cheerio = require("cheerio");

const RESULTS_PER_PAGE = 2000;

const getUrl = (resultsRange = 0, resultsPerPage = RESULTS_PER_PAGE) =>
  `https://subastas.boe.es/subastas_ava.php?accion=Mas&id_busqueda=_cjliQkZ0a0RXT1NOUDZiNjFzSmU0VldJUjE1MDJRalZGMmEzcmgwZVd6WDVDNTR0aHRTaW5YeUIweTQ2V28yZy9HUnU0TGdnaUtyQnlKZnJqTmU0eHlLSHpkaGZjVU5NVy81Qnl3MVBKODZtSU1Ic2FFTGYwY044OGdsV1NibUtkMUF2VUtOa05qeWl5Q0M1Z2tQaEduemd6eHJrMWI4b0VrVzVsOVU4WCsvQWlDM3ppUG5zVFE2ZGtKNVBabStIR0daaEFxRys0ZmVIeitTRVdzK2lEVW83czd1UkMwS3dKSDhZc0YyQzhxNlRFODZOM2tzQkFvQkpGVkw5c1NjL3VlcTlHV3M5RGwzc1NYS2lYc2FYMDRtU1FOMUVBQTdyNzhnM0VlTm5seUU9-${resultsRange}-${resultsPerPage}`;

let records = [];
let step = 0;
let pagSig;

const getRecordsFromPage = async $ => {
  //   let i;
  //   for (i = 0; i < links.length; i++) {
  //     const lot = links[i].innerText.includes("lotes");
  //     const linkA = links[i].querySelector(".resultado-busqueda-link-defecto");
  //     const href = linkA.href;
  //     const queryParamsString = href.substring(href.indexOf("?") + 1);
  //     const queryParams = new URLSearchParams(queryParamsString);
  //     const subId = queryParams.get("idSub");
  //     records.push({ subId, href, lot });
  //   }
  //   return records;
  // });
  // return recordsInPage;
};

const main = async () => {
  records = [];

  do {
    console.log(`::: Crawling page ${step + 1} ::: \n`);
    let newRange = RESULTS_PER_PAGE * step;
    url = getUrl(newRange);
    const response = await axios.get(url);
    const $ = await cheerio.load(response.data);

    pagSig = $(".pagSig").attr("class");

    const recordsPerPage = [];

    const links = $(".resultado-busqueda");

    let i;
    for (i = 0; i < links.length; i++) {
      console.log(links[i].attr("class"));
      // const lot = links[i].innerText.includes("lotes");
      // const linkA = links[i].querySelector(".resultado-busqueda-link-defecto");
      // const href = linkA.href;
      // const queryParamsString = href.substring(href.indexOf("?") + 1);
      // const queryParams = new URLSearchParams(queryParamsString);
      // const subId = queryParams.get("idSub");
      // recordsPerPage.push({ subId, href, lot });
    }

    step += 1;
    records = [...records, ...recordsPerPage];
  } while (!!pagSig);

  console.log(records);

  console.log(`::: Done crawling page ${step + 1} :::\n`);
};

main();
