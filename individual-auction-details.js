const puppeteer = require("puppeteer");

const url =
  "https://subastas.boe.es/detalleSubasta.php?idSub=SUB-JA-2019-141546&ver=1&numPagBus=";
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

    if (tabType.includes("pujas")) {
      const amount = document.querySelector("#idBloqueDatos8 .destaca");
      if (!!amount) {
        return {
          [tabType]: {
            pujaMaxima: amount.innerText
          }
        };
      } else {
        return {
          [tabType]: {
            pujaMaxima: null
          }
        };
      }
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

(async () => {
  console.log("Starting crawling detail page...");

  const pageAvailableIndexes = [1, 2, 3, 4, 5];

  const browser = await puppeteer.launch();
  const detailPage = await browser.newPage();

  let data = {};
  let page = 1;
  let url;

  do {
    // IMPORTANT!!!!
    // TODO: SUB-JA-2019-141546 this one is hardcoded, once in lambda expect a variable to come from context
    url = makeUrlForDetailPage("SUB-JA-2019-141546", page);
    await detailPage.goto(url);
    const result = await extractDataFromTablesInPage(detailPage);

    const intersection = intersect(data, result);
    if (!intersection.length) {
      data = { ...data, ...result };
      page += 1;
    } else {
      break;
    }
  } while (true);

  console.log("Crawling done...");

  await browser.close();
})();
