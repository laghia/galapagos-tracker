const CACHE='galapagos-tracker-v1';
const ASSETS=[
  './',
  './index.html',
  "images/Actiniaria.jpg",
  "images/Aegialomys_galapagoensis.jpg",
  "images/American_flamingo.jpg",
  "images/American_oystercatcher.jpg",
  "images/American_yellow_warbler.jpg",
  "images/Barn_owl.jpg",
  "images/Black-necked_stilt.jpg",
  "images/Blacktip_reef_shark.jpg",
  "images/Blue-footed_booby.jpg",
  "images/Brown_noddy.jpg",
  "images/Brown_pelican.jpg",
  "images/Bryde's_whale.jpg",
  "images/Common_bottlenose_dolphin.jpg",
  "images/Common_cactus_finch.jpg",
  "images/Common_gallinule.jpg",
  "images/Española_cactus_finch.jpg",
  "images/Española_mockingbird.jpg",
  "images/Eucidaris.jpg",
  "images/Flightless_cormorant.jpg",
  "images/Floreana_mockingbird.jpg",
  "images/Galápagos_dove.jpg",
  "images/Galápagos_flycatcher.jpg",
  "images/Galápagos_fur_seal.jpg",
  "images/Galápagos_hawk.jpg",
  "images/Galápagos_land_iguana.jpg",
  "images/Galápagos_martin.jpg",
  "images/Galápagos_mockingbird.jpg",
  "images/Galápagos_penguin.jpg",
  "images/Galápagos_petrel.jpg",
  "images/Galápagos_pink_land_iguana.jpg",
  "images/Galápagos_rail.jpg",
  "images/Galápagos_sea_lion.jpg",
  "images/Galápagos_shark.jpg",
  "images/Galápagos_shearwater.jpg",
  "images/Galápagos_tortoise.jpg",
  "images/Giant_oceanic_manta_ray.jpg",
  "images/Golden_cownose_ray.jpg",
  "images/Grapsus_grapsus.jpg",
  "images/Great_blue_heron.jpg",
  "images/Great_frigatebird.jpg",
  "images/Green_sea_turtle.jpg",
  "images/Green_warbler-finch.jpg",
  "images/Hawksbill_sea_turtle.jpg",
  "images/Hermit_crab.jpg",
  "images/Horn_shark.jpg",
  "images/Humpback_whale.jpg",
  "images/King_angelfish.jpg",
  "images/Large_ground_finch.jpg",
  "images/Lava_gull.jpg",
  "images/Magnificent_frigatebird.jpg",
  "images/Mangrove_finch.jpg",
  "images/Marine_iguana.jpg",
  "images/Medium_ground_finch.jpg",
  "images/Microlophus.jpg",
  "images/Moorish_idol.jpg",
  "images/Nazca_booby.jpg",
  "images/Nidorellia_armata.jpg",
  "images/Ocean_sunfish.jpg",
  "images/Ocypode.jpg",
  "images/Orca.jpg",
  "images/Paint-billed_crake.jpg",
  "images/Parrotfish.jpg",
  "images/Pentaceraster_cumingi.jpg",
  "images/Phyllodactylus_galapagensis.jpg",
  "images/Prionurus_laticlavius.jpg",
  "images/Pseudalsophis_biserialis.jpg",
  "images/Red-billed_tropicbird.jpg",
  "images/Red-footed_booby.jpg",
  "images/Ruddy_turnstone.jpg",
  "images/San_Cristóbal_mockingbird.jpg",
  "images/Sanderling.jpg",
  "images/Santa_Fe_land_iguana.jpg",
  "images/Scalloped_hammerhead.jpg",
  "images/Schistocerca_melanocera.jpg",
  "images/Scolopendra_galapagoensis.jpg",
  "images/Scyllarides_astori.jpg",
  "images/Semipalmated_plover.jpg",
  "images/Sharp-beaked_ground_finch.jpg",
  "images/Short-beaked_common_dolphin.jpg",
  "images/Short-eared_owl.jpg",
  "images/Small_ground_finch.jpg",
  "images/Sperm_whale.jpg",
  "images/Spotted_eagle_ray.jpg",
  "images/Striated_heron.jpg",
  "images/Swallow-tailed_gull.jpg",
  "images/Taeniurops_meyeni.jpg",
  "images/Tetraodontidae.jpg",
  "images/Vampire_ground_finch.jpg",
  "images/Vermilion_flycatcher.jpg",
  "images/Wandering_tattler.jpg",
  "images/Waved_albatross.jpg",
  "images/Western_cattle_egret.jpg",
  "images/Whale_shark.jpg",
  "images/Whimbrel.jpg",
  "images/White-cheeked_pintail.jpg",
  "images/White-vented_storm_petrel.jpg",
  "images/Whitetip_reef_shark.jpg",
  "images/Woodpecker_finch.jpg",
  "images/Xylocopa_darwini.jpg",
  "images/Yellow-crowned_night_heron.jpg"
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.all(ASSETS.map(url => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
