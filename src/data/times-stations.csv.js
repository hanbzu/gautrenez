import { csvFormat, csvParse } from "d3-dsv";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import _ from "lodash";

const STATIONS_AREAS_METRO = csvParse(
  await readFile(
    fileURLToPath(import.meta.resolve("./stations-areas-metro-hand.csv")),
    "utf8"
  )
);

const dictStationIdToAreaCode = new Map(
  STATIONS_AREAS_METRO.map(({ id, area }) => [+id, area])
);

const dictStationNames = new Map();
// direkt.bahn.guru/?origin=7100011
function retrieveDirektBahnGuru(from) {
  return fetch(
    `https://api.direkt.bahn.guru/${from}?localTrainsOnly=false&v=4`
  ).then((res) => res.json());
}

const timesStations = await Promise.all(
  STATIONS_AREAS_METRO.map(({ id: from, station, area }) => {
    dictStationNames.set(from, station);
    return retrieveDirektBahnGuru(from).then((results) =>
      // Each entry looks like { id, name, location: { type, id, latitude, longitude }, duration, dbUrlEnglish, calendarUrl }
      results
        .filter(({ id, name }) => {
          dictStationNames.set(id, name);
          return STATIONS_AREAS_METRO.map((d) => d.id).includes(id);
        })
        .map(({ id: to, duration: t }) => ({
          from,
          fromArea: area,
          to: +to,
          toArea: dictStationIdToAreaCode.get(+to),
          t,
        }))
    );
  })
).then((arr) => arr.flat());

const timesAreas = Object.entries(
  _.mapValues(_.groupBy(timesStations, "fromArea"), (val) =>
    _.mapValues(
      _.groupBy(
        val.filter(
          ({ fromArea, toArea }) => fromArea !== toArea // No intra-area trips
        ),
        "toArea" // Group by destination
      ),
      (options) => _.minBy(options, "t")?.t
    )
  )
)
  .map(([fromArea, dests]) =>
    Object.entries(dests).map(([toArea, t]) => ({ fromArea, toArea, t }))
  )
  .flat();

process.stdout.write(csvFormat(timesAreas));
