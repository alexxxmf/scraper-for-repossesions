const fs = require("fs");
const utils = require("./utils");

const extractDetailsFromSingleAuction =
  require("./individual-auction-details").default;
const extractLotAuctionDetails = require("./lot-auction-details").default;

const main = async () => {
  const files = fs.readdirSync("./results/details");

  let rawData = fs.readFileSync("./results/results-2021-7-7.json");
  let auctions = JSON.parse(rawData);

  const subIdsForAlreadyScraped = files.map((file) => file.split(".json")[0]);

  let crawledItems = 0;

  for (let i = 0; i < auctions.length; i++) {
    const auction = auctions[i];

    if (subIdsForAlreadyScraped.includes(auction.subId)) {
      console.log(`Skipping crawling for ${auction.subId}`);
    } else {
      if (crawledItems !== 0 && crawledItems % 500 === 0) {
        console.log("::: Taking a short nap... :::");
        await utils.sleep(utils.randomNumberInRange(36500, 54069));
      }
      console.log(`Started crawling for ${auction.subId}`);

      let details;
      if (auction.lot) {
        details = await extractLotAuctionDetails(auction.subId);
      } else {
        details = await extractDetailsFromSingleAuction(auction.subId);
      }

      const jsonData = JSON.stringify(details);

      utils.writeResults(auction.subId, jsonData, "details");
      crawledItems += 1;
      await utils.sleep(utils.randomNumberInRange(1303, 1765));
      console.log(`Crawling for ${auction.subId} is done`);
    }
  }
};

main();
