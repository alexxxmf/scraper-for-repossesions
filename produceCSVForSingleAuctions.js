const fs = require("fs");
const utils = require("./utils");

const BASE_PATH = `${__dirname}/results/details`;

function main() {
  const files = fs.readdirSync(BASE_PATH);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let rawData = fs.readFileSync(`${BASE_PATH}/${file}`);
    let auctionDetail = JSON.parse(rawData);

    const auctionDetailCopy = JSON.parse(JSON.stringify(auctionDetail));
    delete auctionDetailCopy.lotes;

    if (
      auctionDetail.informacion_general.lotes !== "Sin lotes" &&
      !!auctionDetail.lotes
    ) {
      const subId = auctionDetail.informacion_general.identificador;
      const lots = auctionDetail.lotes;

      const lotsArray = Object.values(lots);

      const totalValuationForAssets = lotsArray.reduce((total, currentLot) => {
        if (!currentLot.valor_subasta) {
          return 0;
        }
        return (total += utils.deEurofy(currentLot.valor_subasta));
      }, 0);

      const arrayOfAuctions = lotsArray.map((lot, index) => {
        auctionDetailCopy.informacion_general.identificador = `${subId}-lote${index}`;

        if (!!lot.valor_subasta) {
          const lotValue = utils.deEurofy(lot.valor_subasta);

          auctionDetailCopy.informacion_general.cantidad_reclamada = utils.round_to_precision(
            (lotValue / totalValuationForAssets) *
              utils.deEurofy(
                auctionDetail.informacion_general.cantidad_reclamada
              ),
            0.01
          );
        } else {
          auctionDetailCopy.informacion_general.cantidad_reclamada = "";
        }

        auctionDetailCopy.pujas = {
          pujaMaxima: auctionDetail.pujas[`${index}`]
            ? auctionDetail.pujas[`${index}`]
            : "Sin pujas"
        };

        return { ...auctionDetailCopy, bienes: { ...lot } };
      });
      console.log(arrayOfAuctions);
    }
  }
}

main();
