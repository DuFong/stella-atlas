import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const argumentsByName = new Map(
  process.argv.slice(2).map((argument) => {
    const separator = argument.indexOf("=");
    return [argument.slice(0, separator), argument.slice(separator + 1)];
  }),
);

const requiredInputs = ["--hyg", "--openngc", "--openngc-addendum", "--constellations"];
for (const input of requiredInputs) {
  if (!argumentsByName.get(input)) {
    throw new Error(`Missing required argument: ${input}=<path>`);
  }
}

const outputDirectory = resolve(
  argumentsByName.get("--output") ??
    "src/features/planetarium/data/generated",
);

const constellationSource = JSON.parse(
  await readFile(resolve(argumentsByName.get("--constellations")), "utf8"),
);
const constellationRows = constellationSource.constellations.map((constellation) => {
  const id = constellation.iau.toLowerCase();
  const segments = constellation.lines.flatMap((line) => {
    const hipparcosIds = line.filter(Number.isFinite);
    return hipparcosIds.slice(1).map((hipparcosId, index) => [
      hipparcosIds[index],
      hipparcosId,
    ]);
  });
  return [id, koreanConstellationName(constellation.iau), segments];
});
const constellationHipparcosIds = new Set(
  constellationRows.flatMap(([, , segments]) => segments.flat()),
);

const hygRows = parseDelimited(
  await readFile(resolve(argumentsByName.get("--hyg")), "utf8"),
  ",",
);
const stars = hygRows
  .filter((row) => {
    const magnitude = finiteNumber(row.mag);
    const hipparcosId = finiteNumber(row.hip);
    return Number(row.id) !== 0 && (
      magnitude !== undefined && magnitude <= 6.5 ||
      hipparcosId !== undefined && constellationHipparcosIds.has(hipparcosId)
    );
  })
  .map((row) => [
    Number(row.id),
    finiteNumber(row.hip) ?? 0,
    row.proper,
    row.bf,
    roundedNumber(row.ra, 6),
    roundedNumber(row.dec, 6),
    roundedNumber(row.mag, 2),
    finiteNumber(row.ci) === undefined ? null : roundedNumber(row.ci, 3),
  ])
  .sort((left, right) => left[6] - right[6] || left[0] - right[0]);

const openNgcRows = [
  ...parseDelimited(
    await readFile(resolve(argumentsByName.get("--openngc")), "utf8"),
    ";",
  ),
  ...parseDelimited(
    await readFile(resolve(argumentsByName.get("--openngc-addendum")), "utf8"),
    ";",
  ),
];
const deepSkyObjects = openNgcRows
  .filter((row) => deepSkyKind(row.Type))
  .filter((row) => row.M || row["Common names"] || isAtMostMagnitude(row["V-Mag"], 10))
  .map((row) => [
    row.Name,
    deepSkyKind(row.Type),
    parseRightAscension(row.RA),
    parseDeclination(row.Dec),
    preferredMagnitude(row),
    finiteNumber(row.MajAx) ?? null,
    row["Common names"],
    row.M ? Number(row.M) : null,
  ])
  .filter((row) => Number.isFinite(row[2]) && Number.isFinite(row[3]))
  .sort((left, right) => {
    const leftMessier = left[7] ?? Number.POSITIVE_INFINITY;
    const rightMessier = right[7] ?? Number.POSITIVE_INFINITY;
    return leftMessier - rightMessier || left[0].localeCompare(right[0]);
  });

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeJson("star-catalog.json", stars),
  writeJson("deep-sky-catalog.json", deepSkyObjects),
  writeJson("constellation-catalog.json", constellationRows),
  writeJson("catalog-metadata.json", {
    generatedAt: "2026-09-17",
    limits: {
      maximumStarMagnitude: 6.5,
      maximumDeepSkyMagnitude: 10,
      deepSkySelection: "Messier, common-name, or visual magnitude <= 10",
    },
    counts: {
      constellations: constellationRows.length,
      constellationSegments: constellationRows.reduce(
        (total, row) => total + row[2].length,
        0,
      ),
      deepSkyObjects: deepSkyObjects.length,
      stars: stars.length,
    },
    sources: {
      hyg: "HYG Database 4.1 @ c7f7f883fe678cc7680169a50ccd7dcc49b060ce",
      openNgc: "OpenNGC @ da90466031b0372c896588b85be6016c617e205b",
      stellarium: "Stellarium western sky culture @ 014fbb5e59233d133c22f9811af96b67d05a95c9",
    },
  }),
]);

async function writeJson(filename, value) {
  await writeFile(
    resolve(outputDirectory, filename),
    `${JSON.stringify(value)}\n`,
    "utf8",
  );
}

function parseDelimited(contents, delimiter) {
  const lines = contents.trim().split(/\r?\n/);
  const headers = parseLine(lines.shift(), delimiter);
  return lines.map((line) => {
    const values = parseLine(line, delimiter);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function parseLine(line, delimiter) {
  const values = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  values.push(current);
  return values;
}

function finiteNumber(value) {
  if (value === "" || value === undefined) {
    return undefined;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function roundedNumber(value, precision) {
  const number = finiteNumber(value);
  if (number === undefined) {
    throw new Error(`Expected a finite number, received: ${value}`);
  }
  return Number(number.toFixed(precision));
}

function isAtMostMagnitude(value, maximum) {
  const magnitude = finiteNumber(value);
  return magnitude !== undefined && magnitude <= maximum;
}

function preferredMagnitude(row) {
  const magnitude = finiteNumber(row["V-Mag"]) ?? finiteNumber(row["B-Mag"]);
  return magnitude === undefined ? null : Number(magnitude.toFixed(2));
}

function parseRightAscension(value) {
  const [hours, minutes, seconds] = value.split(":").map(Number);
  return Number((hours + minutes / 60 + seconds / 3_600).toFixed(6));
}

function parseDeclination(value) {
  const sign = value.startsWith("-") ? -1 : 1;
  const [degrees, minutes, seconds] = value.replace(/^[+-]/, "").split(":").map(Number);
  return Number((sign * (degrees + minutes / 60 + seconds / 3_600)).toFixed(6));
}

function deepSkyKind(type) {
  return {
    G: "G", GGroup: "G", GPair: "G", GTrpl: "G",
    Neb: "N", HII: "N", EmN: "N", RfN: "N", DrkN: "N", PN: "N", SNR: "N",
    OCl: "C", GCl: "C", "*Ass": "C", "Cl+N": "N",
  }[type];
}

function koreanConstellationName(abbreviation) {
  return ({
  And: "안드로메다자리", Ant: "공기펌프자리", Aps: "극락조자리", Aqr: "물병자리",
  Aql: "독수리자리", Ara: "제단자리", Ari: "양자리", Aur: "마차부자리",
  Boo: "목동자리", Cae: "조각칼자리", Cam: "기린자리", Cnc: "게자리",
  CVn: "사냥개자리", CMa: "큰개자리", CMi: "작은개자리", Cap: "염소자리",
  Car: "용골자리", Cas: "카시오페이아자리", Cen: "센타우루스자리", Cep: "세페우스자리",
  Cet: "고래자리", Cha: "카멜레온자리", Cir: "컴퍼스자리", Col: "비둘기자리",
  Com: "머리털자리", CrA: "남쪽왕관자리", CrB: "북쪽왕관자리", Crv: "까마귀자리",
  Crt: "컵자리", Cru: "남십자자리", Cyg: "백조자리", Del: "돌고래자리",
  Dor: "황새치자리", Dra: "용자리", Equ: "조랑말자리", Eri: "에리다누스자리",
  For: "화로자리", Gem: "쌍둥이자리", Gru: "두루미자리", Her: "헤르쿨레스자리",
  Hor: "시계자리", Hya: "바다뱀자리", Hyi: "물뱀자리", Ind: "인디언자리",
  Lac: "도마뱀자리", Leo: "사자자리", LMi: "작은사자자리", Lep: "토끼자리",
  Lib: "천칭자리", Lup: "이리자리", Lyn: "살쾡이자리", Lyr: "거문고자리",
  Men: "테이블산자리", Mic: "현미경자리", Mon: "외뿔소자리", Mus: "파리자리",
  Nor: "직각자자리", Oct: "팔분의자리", Oph: "뱀주인자리", Ori: "오리온자리",
  Pav: "공작자리", Peg: "페가수스자리", Per: "페르세우스자리", Phe: "불사조자리",
  Pic: "화가자리", Psc: "물고기자리", PsA: "남쪽물고기자리", Pup: "고물자리",
  Pyx: "나침반자리", Ret: "그물자리", Sge: "화살자리", Sgr: "궁수자리",
  Sco: "전갈자리", Scl: "조각가자리", Sct: "방패자리", Ser: "뱀자리",
  Sex: "육분의자리", Tau: "황소자리", Tel: "망원경자리", Tri: "삼각형자리",
  Tra: "남쪽삼각형자리", Tuc: "큰부리새자리", UMa: "큰곰자리", UMi: "작은곰자리",
    Vel: "돛자리", Vir: "처녀자리", Vol: "날치자리", Vul: "여우자리",
  })[abbreviation];
}
