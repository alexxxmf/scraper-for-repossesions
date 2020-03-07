const puppeteer = require("puppeteer");

const makeUrlForDetailPage = (idSub, page = 1, idLot = "") =>
  `https://subastas.boe.es/detalleSubasta.php?idSub=${idSub}&ver=${page}&idLote=${idLot}`;

const extractDataFromTablesInPage = async detailPage => {
  return await detailPage.evaluate(() => {
    const cleanAndNormalizeString = string => {
      return string
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/ /g, "_");
    };

    const getTrsAsKeyValue = trs => {
      let trsObject = {};
      trs.forEach(e => {
        const key = cleanAndNormalizeString(e.children[0].innerText);

        const value = e.children[1].innerText;
        trsObject[key] = value;
      });
      return trsObject;
    };

    const tabType = document
      .querySelector("#tabs .selected")
      .innerText.toLowerCase();

    if (tabType.includes("lotess")) {
      return { lotes: {} };
    } else {
      const trs = document.querySelectorAll("#contenido table tbody tr");
      const keyValuesFromTrs = getTrsAsKeyValue(Array(...trs));
      return { [cleanAndNormalizeString(tabType)]: keyValuesFromTrs };
    }
  });
};

const intersect = (o1, o2) => {
  return Object.keys(o1).filter(k => k in o2);
};

const extractLotAuctionDetails = async idSub => {
  {
    const start = Date.now();
    console.log("Starting crawling detail page...");

    const pageAvailableIndexes = [1, 2, 3, 4, 5];

    const browser = await puppeteer.launch();
    const detailPage = await browser.newPage();

    let data = {};
    let page = 1;
    let idLot = 1;
    let url;
    let lotAmount = 1;
    let pageForLots;

    /*
  ('.caja.gris.error p strong').innerText.toLowerCase().includes('error')
  */

    do {
      // IMPORTANT!!!!
      // TODO: SUB-JA-2020-142269 this one is hardcoded, once in lambda expect a variable to come from context
      url = makeUrlForDetailPage(idSub, page, idLot);
      await detailPage.goto(url);
      let result = await extractDataFromTablesInPage(detailPage);

      const resultKey = Object.keys(result);

      if (resultKey.includes("informacion_general")) {
        lotAmount = parseInt(result["informacion_general"]["lotes"]);
      }

      if (resultKey.includes("lotes")) {
        pageForLots = page;
        result = { lotes: { [idLot]: result.lotes } };
      }

      const intersection = intersect(data, result);
      if (!intersection.length) {
        data = { ...data, ...result };
        page += 1;
      } else {
        break;
      }
    } while (true);

    do {
      idLot += 1;
      let lotUrl = makeUrlForDetailPage(idSub, pageForLots, idLot);
      await detailPage.goto(lotUrl);
      let newLot = await extractDataFromTablesInPage(detailPage);
      data.lotes = { ...data.lotes, [idLot]: newLot.lotes };
    } while (idLot < lotAmount);

    const elapsedTime = (Date.now() - start) / 1000;

    console.log(`Elapsed time: ${elapsedTime} seconds`);

    console.log("Crawling done...");

    await browser.close();
    return data;
  }
};

exports.default = extractLotAuctionDetails;
