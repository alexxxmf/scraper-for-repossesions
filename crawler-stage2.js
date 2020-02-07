const puppeteer = require("puppeteer");
// https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2020-142269

// https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2020-142269&ver=5&idBus=&idLote=&numPagBus=
// ver=5 this is what changes 1,2,3,4... for the different tabs
// when there are lots, this it what changes when navigating... idLote=2

// .navlist
// #idBloqueDatos1

// td.innerText
// th.innerText

// Everything should be lower case

// Normalize strings, how to remove accents:
// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
// str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

// Important Note: There are two main differences in the detail page. We can have a single auction or a lot

const getTrsAsKeyValue = trs => {
  return trs.map(e => {
    // Performance note on the replace vs split and join for the spacing...
    // https://stackoverflow.com/questions/441018/replacing-spaces-with-underscores-in-javascript/441035

    const key = e.children[0].innerText
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/ /g, "_");

    const value = e.children[1].innerText;

    return { [key]: value };
  });
};

const url =
  "https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2020-142269&ver=5&idBus=&idLote=&numPagBus=";

const makeUrlFordetailPage = () =>
  `https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2020-142269&ver=5&idBus=&idLote=&numPagBus=`;

(async () => {
  console.log("Starting crawling detail page...");

  const browser = await puppeteer.launch();
  const detailPage = await browser.newPage();
  await detailPage.goto(url);

  await detailPage.evaluate(() => {
    const trs = $$("#idBloqueDatos1 table tbody tr");
    const keyValuesFromTrs = getTrsAsKeyValue(trs);
  });

  await browser.close();
})();
