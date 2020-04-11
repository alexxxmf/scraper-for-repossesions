const fs = require("fs");
const { Parser } = require("json2csv");

const utils = require("./utils");
const getCoordinates = require("./getCoordinatesFromPostalCode").default;

const BASE_PATH = `${__dirname}/results`;
const DETAILS_PATH = `${__dirname}/results/details`;

const fields = [
  "subId",
  "estimatedValue",
  "debtAmount",
  "independentValuation",
  "longitude",
  "latitude",
  "maxBid"
];

const json2csvParser = new Parser({ fields });

const getOrCreateFileForCoordinates = () => {
  let rawData;
  try {
    rawData = fs.readFileSync(`${BASE_PATH}/coordinates.json`);
  } catch (err) {
    if (err.code === "ENOENT") {
      fs.writeFile(`${BASE_PATH}/coordinates.json`, "{}", function(err) {
        if (err) {
          return console.log(err);
        } else {
          console.log("Coordinates file was saved!");
          rawData = fs.readFileSync(`${BASE_PATH}/coordinates.json`);
        }
      });
    }
  }
  return JSON.parse(rawData);
};

const generateSingleAuctionEntry = async (auction, coordinatesObject) => {
  const postalCode = auction.bienes.codigo_postal
    ? auction.bienes.codigo_postal
    : "";

  const province = auction.bienes.provincia
    ? utils.cleanAndNormalizeString(auction.bienes.provincia.toLowerCase())
    : "";

  let coordinates;

  if (!!postalCode.length) {
    if (coordinatesObject.hasOwnProperty(postalCode)) {
      coordinates = coordinatesObject[postalCode];
    } else {
      coordinates = await getCoordinates(postalCode, province);
      console.log(
        `\nNetwork call with "postal code: ${postalCode}, province ${province}"\n`
      );

      if (!!coordinates) {
        const { lat, lng } = coordinates;

        coordinatesObject[postalCode] = {
          lat,
          lng
        };
      } else {
        coordinatesObject[postalCode] = null;
      }

      // To avoid overload google geocode with many requests
      await utils.sleep(500);
    }
  }

  return {
    subId: auction.informacion_general.identificador,
    estimatedValue: auction.informacion_general.valor_subasta
      ? utils.deEurofy(auction.informacion_general.valor_subasta)
      : null,
    debtAmount: auction.informacion_general.cantidad_reclamada
      ? utils.deEurofy(auction.informacion_general.cantidad_reclamada)
      : 0,
    independentValuation: auction.informacion_general.tasacion
      ? utils.deEurofy(auction.informacion_general.tasacion)
      : null,
    province: province,
    longitude: !!coordinates && !!coordinates.lng ? coordinates.lng : null,
    latitude: !!coordinates && !!coordinates.lat ? coordinates.lat : null,
    maxBid: auction.pujas.pujaMaxima
      ? utils.deEurofy(auction.pujas.pujaMaxima)
      : 0
  };
};

async function main() {
  let files = fs.readdirSync(DETAILS_PATH);
  const coordinatesObject = getOrCreateFileForCoordinates();

  const allSingleAuctions = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.includes(".json")) {
      continue;
    }
    let rawData = fs.readFileSync(`${DETAILS_PATH}/${file}`);
    let auction = JSON.parse(rawData);

    if (auction.informacion_general.lotes !== "Sin lotes") {
      continue;
    }

    try {
      allSingleAuctions.push(
        await generateSingleAuctionEntry(auction, coordinatesObject)
      );
    } catch (err) {
      console.error(err);
    }
  }

  const csv = json2csvParser.parse(allSingleAuctions);
  fs.writeFileSync(`${__dirname}/results/csv/allAuctions1.csv`, csv);
  fs.writeFileSync(
    `${__dirname}/results/coordinates.json`,
    JSON.stringify(coordinatesObject)
  );
}

main();
