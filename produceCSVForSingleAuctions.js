const fs = require("fs");
const { Parser } = require("json2csv");

const utils = require("./utils");

const BASE_PATH = `${__dirname}/results/details`;

const generateSingleAuctionEntry = auction => {
  return {
    subId: auction.informacion_general.identificador,
    estimatedValue: auction.informacion_general.valor_subasta
      ? utils.deEurofy(auction.informacion_general.valor_subasta)
      : "",
    debtAmount: auction.informacion_general.cantidad_reclamada
      ? utils.deEurofy(auction.informacion_general.cantidad_reclamada)
      : "",
    independentValuation: auction.informacion_general.tasacion
      ? utils.deEurofy(auction.informacion_general.tasacion)
      : "",
    province: auction.bienes.provincia
      ? utils.cleanAndNormalizeString(auction.bienes.provincia.toLowerCase())
      : "",
    postalCode: auction.bienes.codigo_postal
      ? auction.bienes.codigo_postal
      : "",
    maxBid: auction.pujas.pujaMaxima
      ? utils.deEurofy(auction.pujas.pujaMaxima)
      : 0
  };
};

function main() {
  const files = fs.readdirSync(BASE_PATH);

  const allSingleAuctions = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.includes(".json")) {
      continue;
    }
    let rawData = fs.readFileSync(`${BASE_PATH}/${file}`);
    let auction = JSON.parse(rawData);

    if (auction.informacion_general.lotes !== "Sin lotes") {
      continue;
    }
    allSingleAuctions.push(generateSingleAuctionEntry(auction));
  }

  const fields = [
    "subId",
    "estimatedValue",
    "debtAmount",
    "independentValuation",
    "province",
    "postalCode",
    "maxBid"
  ];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(allSingleAuctions);

  fs.writeFileSync(`${__dirname}/results/csv/allAuctions.csv`, csv);
}

main();
