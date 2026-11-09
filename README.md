# DREV DS

Digitalt Skogskort for drevprøve på dachshund (NKK 2026–2031). Versjon 3.0.

Appen er en PWA (Progressive Web App). Åpne adressen i Safari på iPhone og velg
Del → «Legg til på Hjem-skjerm». Etter første åpning virker den uten nett.

Prøver uten prøveperiode lagres bare på telefonen som bruker appen.
Prøver i en prøveperiode sendes til databasen hos Supabase (Stockholm) når
dommeren er logget inn, slik at prøveleder kan følge dem. Ingenting sendes hit
til GitHub.

`index.html` inneholder bare den offentlige nøkkelen (publishable) til databasen.
Den hemmelige nøkkelen skal aldri ligge her.

Ved ny versjon: last opp de nye filene og overskriv de gamle. `VERSION` i `sw.js`
er endret i hver nye pakke, slik at telefonene henter oppdateringen.

Regelverk og veiledere vises som ferdige sidebilder fra `docs/sider`.

Skrift: Barlow og Barlow Condensed (SIL Open Font License 1.1).
PDF: jsPDF og jsPDF-AutoTable (MIT-lisens).
Database: supabase-js (MIT). QR: jsQR (Apache 2.0) og qrcode-generator (MIT).

© 2026 Dirk Scheid
