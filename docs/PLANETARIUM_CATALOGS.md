# Planetarium Catalogs

## Included catalog

The project-owned planetarium distributes a compact, generated catalog instead
of querying a remote astronomy service at runtime.

| Data | Selection | Count |
|---|---|---:|
| Stars | HYG 4.1 visual magnitude `<= 6.5` | 8,920 |
| Deep-sky objects | Supported OpenNGC type and Messier, common name, or visual magnitude `<= 10` | 610 |
| Constellations | Stellarium Western sky-culture line figures | 88 |
| Constellation segments | Adjacent HIP identifiers in each line figure | 674 |

Deep-sky types are limited to galaxies, nebulae, open and globular clusters,
stellar associations, and cluster-nebula combinations. Comets, asteroids,
double-star-only records, novae, non-existent and duplicate OpenNGC rows are not
included.

The generated JSON uses compact tuples and loads as asynchronous chunks after
hydration. The deterministic 30-star core catalog remains in the initial route,
so server and first-client rendering match without putting the expanded catalog
in the initial JavaScript budget. Runtime code expands the tuples into the
domain model. Only important stars, Messier objects and commonly named deep-sky
objects are eligible for labels; all catalog objects remain searchable and
selectable.

## Coordinate handling

HYG, OpenNGC and the constellation HIP references use J2000 equatorial
coordinates. Before horizontal projection, the astronomy adapter applies the
Astronomy Engine `EQJ -> EQD` rotation for the selected instant, then converts
the equatorial-of-date coordinates to observer altitude and azimuth with normal
atmospheric refraction.

HYG proper-motion fields are intentionally not included. At the current field
of view and catalog limit this is acceptable for the product visualization, but
proper motion must be added before supporting high-magnification astrometry.

## Reproducible sources

| Source | Snapshot | Input SHA-256 |
|---|---|---|
| HYG Database 4.1 `hygdata_v41.csv` | `c7f7f883fe678cc7680169a50ccd7dcc49b060ce` | `d9f69fd86bbf90a4e4d52b4c5c53eacfa6dfc0bfdef85bfd94f095e0bebe4ebd` |
| OpenNGC `NGC.csv` | `da90466031b0372c896588b85be6016c617e205b` | `be150bdaa1997dacbcb39f303074403edec7a953b589b36d5f1c4522c0cc6fae` |
| OpenNGC `addendum.csv` | `da90466031b0372c896588b85be6016c617e205b` | `1d8f0914e643ada325a5a94d88d8fefad6a4937a2f77cc34f21483af22b11983` |
| Stellarium Western `index.json` | `014fbb5e59233d133c22f9811af96b67d05a95c9` | `a861accd345249a185a5ecfc2a516f34291c0aa52f4bb8d8337ffc53e9cef6b9` |

Download the four pinned inputs to a temporary directory and regenerate from
`frontend/`:

```bash
node scripts/generate-planetarium-catalogs.mjs \
  --hyg=/path/to/hygdata_v41.csv \
  --openngc=/path/to/NGC.csv \
  --openngc-addendum=/path/to/addendum.csv \
  --constellations=/path/to/western/index.json
```

Review count and checksum changes before replacing a snapshot. Generated data
inherits the attribution and share-alike requirements documented in
`docs/THIRD_PARTY_NOTICES.md`.
