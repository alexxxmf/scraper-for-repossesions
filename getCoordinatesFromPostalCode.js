require("dotenv").config();
const fs = require("fs");
const utils = require("./utils");

const googleMapsClient = require("@google/maps").createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
  Promise: Promise
});

const getCoordinatesByPostalCode = async (postalCode, province) => {
  return await googleMapsClient
    .geocode({ address: `españa, ${province}, ${postalCode}` })
    .asPromise()
    .then(response => {
      const firstResult = response.json.results[0];
      if (
        !!firstResult &&
        !!firstResult.geometry &&
        !!firstResult.geometry.location
      ) {
        const { lat, lng } = response.json.results[0].geometry.location;

        return { lat, lng };
      } else {
        return null;
      }
    })
    .catch(error => console.log(error));
};

getCoordinatesByPostalCode(38399, "santa_cruz_de_tenerife");

exports.default = getCoordinatesByPostalCode;
