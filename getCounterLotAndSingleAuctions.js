const fs = require("fs");
const utils = require("./utils");

const main = async () => {
  let rawData = fs.readFileSync("./results/results-2020-3-7.json");
  let auctions = JSON.parse(rawData);

  const counter = {
    single: 0,
    lot: 0
  };

  auctions.forEach(auction => {
    !!auction.lot ? (counter.lot += 1) : (counter.single += 1);
  });

  console.log("Single auctions", counter.single);
  console.log("Lot auctions", counter.lot);
};

main();
