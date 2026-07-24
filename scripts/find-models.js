/* One-off helper: queries the public Sketchfab search API for each car
   and prints the top embeddable model candidates. */
const QUERIES = {
  "ferrari-488-gtb": "ferrari 488 gtb",
  "lamborghini-huracan-evo": "lamborghini huracan",
  "porsche-911-carrera-s": "porsche 911 carrera",
  "bmw-m4-competition": "bmw m4",
  "porsche-taycan-turbo-s": "porsche taycan",
  "nissan-gtr-nismo": "nissan gtr",
  "chevrolet-corvette-c8": "corvette c8",
  "mercedes-amg-gt-r": "mercedes amg gt",
  "bmw-m8-gran-coupe": "bmw m8",
  "porsche-718-cayman-gts": "porsche cayman",
};

(async () => {
  for (const [id, q] of Object.entries(QUERIES)) {
    const url =
      "https://api.sketchfab.com/v3/search?type=models&sort_by=-likeCount&count=5&q=" +
      encodeURIComponent(q);
    const res = await fetch(url);
    const data = await res.json();
    console.log("\n### " + id + "  (query: " + q + ")");
    for (const m of data.results || []) {
      console.log(
        `  uid=${m.uid} likes=${m.likeCount} faces=${m.faceCount} anim=${m.animationCount} | ${m.name} — by ${m.user?.username}`
      );
    }
  }
})();
