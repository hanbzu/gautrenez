---
toc: false
---

<div class="hero">
  <h1>Gautrenez!</h1>
</div>

## Lotuneak

Kontutan hartu dira gune metropolitarrak [Espainiar Etxebizitza eta Hiri Agendarako Ministeritzaren zerrenda](https://es.wikipedia.org/wiki/Anexo:%C3%81reas_metropolitanas_de_Espa%C3%B1a#Listado_del_Ministerio_de_Vivienda_y_Agenda_Urbana) baliatuz. Hemendik soilik lotune penintsularrak hartu dira.

[wikitable2csv](https://wikitable2csv.ggor.de/) tresna erabili da Wikipediako taulatik datuak ateratzeko, eta gero, eskuz, 1-2 hizkiko kodigo bat eta sektore kodigo zutabeak gehitu dira.

```js
const areasMetro = await FileAttachment(
  "./data/areas-metro-peninsula-clean.csv"
).csv({ typed: true });
display(Inputs.table(areasMetro));
```

## Bidai denbora minimoak

Hauek lortzeko lotune bakoitzean dauden geltokiak behar ditugu (oraingoz prozesu semi-automatikoa).

```js
const stationsAreasMetro = await FileAttachment(
  "./data/stations-areas-metro-hand.csv"
).csv({ typed: true });
display(Inputs.table(stationsAreasMetro));
```

Gero, denbora minimoak kalkulatuko ditugu eta lotuneen arteko geltokietan minimoa hartuko dugu.

```js
const timesStations = await FileAttachment("./data/times-stations.csv").csv({
  typed: true,
});
display(Inputs.table(timesStations));
```

Eta hona hemen, azkenik, grafika:

```js
import * as Plot from "npm:@observablehq/plot";
import { format } from "npm:d3-format";
const areaInfo = new Map(
  areasMetro.map(({ area, name, sec, pop2022 }) => [
    area,
    { name, sec, pop2022 },
  ])
);

import _ from "npm:lodash";

function getColorBySector(sector) {
  switch (sector) {
    case "CN":
      return "#dce6a5";
    case "AT":
      return "#4285f4";
    case "CA":
      return "#34a853";
    case "MD":
      return "#fbbd05";
    case "SU":
      return "#ff6d01";
    case "PA":
      return "#131597";
    case "PR":
      return "#ab5fee";
    default:
      return "brown";
  }
}

const popFormat = format(".2s");
const formatMinutes = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let formattedTime = "";
  if (hours > 0) {
    formattedTime += `${hours} h `;
  }
  if (minutes > 0) {
    formattedTime += `${minutes} mins`;
  }
  return formattedTime.trim();
};

const FROM_TO_SHOW = ["B", "M", "BI", "VA", "SE", "VG", "CÑ"];
const dataConsidered = _.sortBy(
  timesStations
    .filter((d) => d.t <= 6 * 60)
    .filter(({ fromArea }) => FROM_TO_SHOW.includes(fromArea)),
  (d) => FROM_TO_SHOW.indexOf(d.fromArea)
);

const chart = Plot.plot({
  marginLeft: 90,
  insetLeft: 20,
  height: 450,
  width: 400,
  tip: true,
  fy: {
    grid: true,
    tickFormat: (d) => areaInfo.get(d).name,
  },
  marks: [
    Plot.dot(
      dataConsidered,
      Plot.dodgeY("middle", {
        fy: "fromArea",
        x: (d) => d.t / 60,
        r: (d) => areaInfo.get(d.toArea).pop2022,
        title: (d) => {
          const { name, pop2022 } = areaInfo.get(d.toArea);
          return `${areaInfo.get(d.fromArea)?.name} → ${name} (${popFormat(
            pop2022
          )} habitantes): ${formatMinutes(d.t)}`;
        },
        stroke: "white",
        fill: (d) =>
          d.t <= 3.75 * 60
            ? getColorBySector(areaInfo.get(d.toArea)?.sec)
            : "#e8e8e8",
      })
    ),
    Plot.text(
      dataConsidered,
      Plot.dodgeY("middle", {
        fy: "fromArea",
        filter: (d) => areaInfo.get(d.toArea).pop2022 > 5e5,
        x: (d) => d.t / 60,
        r: (d) => areaInfo.get(d.toArea).pop2022,
        text: "toArea",
        fill: "white",
        pointerEvents: "none",
        fontWeight: 700,
        fontSize: (d) => (areaInfo.get(d.toArea).pop2022 > 5e6 ? 20 : 6.5),
      })
    ),
    // Plot.tip(
    //   DATA_MA,
    //   Plot.pointerX({
    //     x: (d) => d.t / 60,
    //     title: (d) => {
    //       const { area:name, pop2022:pop } = areaInfo[d.area]
    //       return `${name} ${pop}`;
    //     },
    //   })
    // ),
  ],
});
display(chart);
```

<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 2rem 0;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>
