const fs = require("fs");
const utils = require("./utils");

const BASE_PATH = `${__dirname}/results`;

const threshold = {
  minLat: 27,
  maxLat: 36,
  minLng: -20,
  maxLng: 5
};

const main = () => {
  const rawData = fs.readFileSync(`${BASE_PATH}/coordinates.json`);
  const parsedData = JSON.parse(rawData);

  const postalCodes = Object.keys(parsedData);

  const postalCodesWithAnomalousCoordinates = postalCodes.filter(postalCode => {
    if (!!parsedData[postalCode]) {
      const { lat, lng } = parsedData[postalCode];
      if (lat > threshold.maxLat || lat < threshold.minLat) {
        return false;
      }
      if (lng > threshold.maxLng || lng < threshold.minLng) {
        return false;
      }

      return true;
    } else {
      return true;
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

  postalCodesWithAnomalousCoordinates.forEach(conflictingPostalCode => {
    delete parsedData[conflictingPostalCode];
  });

  fs.writeFileSync(
    `${__dirname}/results/coordinates.json`,
    JSON.stringify(parsedData)
  );
};

main();
