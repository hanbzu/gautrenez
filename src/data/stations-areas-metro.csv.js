import { csvFormat } from "d3-dsv";

const QUERIES = [
  ["madrid", "M"],
  ["barcelona", "B"],
  ["valencia", "VA"],
  ["sevilla", "SE"],
  ["malaga", "ML"],
  ["bilbao", "BI"],
  ["oviedo", "AS"],
  ["gijon", "AS"],
  ["zaragoza", "ZA"],
  ["alicante", "AC"],
  ["elche", "AC"],
  ["murcia", "MU"],
  ["cadiz", "CA"],
  ["jerez", "CA"],
  ["vigo", "VG"],
  ["pontevedra", "VG"],
  ["granada", "GR"],
  ["a Coruña", "CÑ"],
  ["san sebastian", "DO"],
  ["valladolid", "VL"],
  ["tarragona", "TA"],
  ["reus", "TA"],
  ["pamplona", "IÑ"],
  ["santander", "SA"],
  ["torrelavega", "SA"],
  ["cordoba", "CO"],
  ["castello", "CL"],
  ["vitoria", "GZ"],
  ["algeciras", "AG"],
  ["cartagena", "CR"],
  ["almeria", "AL"],
  ["benidorm", "CB"],
  ["marbella", "CT"],
  ["leon", "LE"],
  ["santiago", "ST"],
  ["salamanca", "SL"],
  ["logroño", "LO"],
  ["burgos", "BU"],
  ["huelva", "HU"],
  ["albacete", "AB"],
  ["lleida", "LL"],
  ["guadalajara", "GU"],
  ["girona", "GI"],
  ["badajoz", "BD"],
  ["jaen", "JN"],
  ["ourense", "OU"],
  ["ferrol", "FE"],
  ["gandia", "GD"],
  ["toledo", "TO"],
  ["caceres", "CS"],
  ["manresa", "MR"],
  ["orihuela", "OR"],
  ["denia", "DN"],
  ["javea", "DN"],
  ["roquetas", "RO"],
];

// It uses https://v5.db.transport.rest/
function getStationsDeutscheBahn(query) {
  return fetch(
    `https://v5.db.transport.rest/locations?query=${query}&poi=false&addresses=false`
  ).then((res) => res.json());
}

const stationAreasMetro = await Promise.all(
  QUERIES.map(([query, area]) =>
    getStationsDeutscheBahn(query).then((stations) =>
      stations.map(({ id, name }) => ({ id: +id, name, area }))
    )
  )
).then((d) => d.flat());

// We cannot use this result because there's many wrong results shown in the autocomplete
process.stdout.write(csvFormat(stationAreasMetro));
