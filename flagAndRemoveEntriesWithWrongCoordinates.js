const fs = require("fs");
const utils = require("./utils");

const BASE_PATH = `${__dirname}/results`;

const threshold = {
  minLat: 24.0,
  maxLat: 44.0,
  minLng: -20.0,
  maxLng: 5.2
};

const DELETE_MODE = true;

const main = () => {
  const rawData = fs.readFileSync(`${BASE_PATH}/coordinates.json`);
  const parsedData = JSON.parse(rawData);

  const postalCodes = Object.keys(parsedData);

  const postalCodesWithAnomalousCoordinates = postalCodes.filter(postalCode => {
    if (!!parsedData[postalCode]) {
      const { lat, lng } = parsedData[postalCode];
      if (lat > threshold.maxLat || lat < threshold.minLat) {
        return true;
      }
      if (lng > threshold.maxLng || lng < threshold.minLng) {
        return true;
      }

      return false;
    } else {
      return false;
    }
  });

  const amountOfAnomCoord = postalCodesWithAnomalousCoordinates.length;
  const amountOfEntries = postalCodes.length;

  console.log("Amount of anomalous Coordinates", amountOfAnomCoord);
  console.log("Amount of entries in coordinates file", amountOfEntries);
  console.log(
    "Error percentage",
    `${(amountOfAnomCoord / amountOfEntries) * 100}%`
  );
  console.log("Conflicting postal codes", postalCodesWithAnomalousCoordinates);

  if (DELETE_MODE) {
    postalCodesWithAnomalousCoordinates.forEach(conflictingPostalCode => {
      delete parsedData[conflictingPostalCode];
    });

    fs.writeFileSync(
      `${__dirname}/results/coordinates.json`,
      JSON.stringify(parsedData)
    );
  }
};

main();
