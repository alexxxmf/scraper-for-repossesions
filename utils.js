const fs = require("fs");

function writeResults(title, json, type = "results") {
  const dateObj = new Date();
  const month = dateObj.getUTCMonth() + 1; //months from 1-12
  const day = dateObj.getUTCDate();
  const year = dateObj.getUTCFullYear();

  const newdate = year + "-" + month + "-" + day;

  const basePath = `${__dirname}/results`;
  const resultsPath = `${basePath}/${title}-${newdate}.json`;
  const detailsPath = `${basePath}/details/${title}.json`;

  fs.writeFile(
    `${type === "results" ? resultsPath : detailsPath}`,
    json,
    function(err) {
      if (err) {
        console.log(err);
      }
    }
  );
}

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function randomNumberInRange(low, high) {
  return round_to_precision(Math.random() * (high - low) + low, 0.01);
}

function round_to_precision(x, precision) {
  var y = +x + (precision === undefined ? 0.5 : precision / 2);
  return y - (y % (precision === undefined ? 1 : +precision));
}

function deEurofy(euro) {
  var euro = euro.match(/[\s-\d,\.]+/g);
  if (euro) {
    return +euro[0]
      .replace(/\./g, "")
      .replace(/,/g, ".")
      .replace(/\s/g, ""); // return decimal
  }
  return undefined;
}

const cleanAndNormalizeString = string => {
  return string
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ /g, "_");
};

exports.writeResults = writeResults;
exports.sleep = sleep;
exports.randomNumberInRange = randomNumberInRange;
exports.deEurofy = deEurofy;
exports.round_to_precision = round_to_precision;
exports.cleanAndNormalizeString = cleanAndNormalizeString;
