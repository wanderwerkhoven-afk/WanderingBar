import type { MenuEntry } from './menuCatalog';

// Tijdelijke eenmalige bierimport. Na verificatie in Firestore v3 verwijderen.
export const temporaryBeerSeed: MenuEntry[] = [
  {
    "name": "Affligem Blond BLADE 8 L",
    "sourceUrl": "https://eu.beerwulf.com/nl-nl/products/affligem-blonde-8l-blade-biervat",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "BLADE 8 L"
  },
  {
    "name": "Lagunitas IPA BLADE 8 L",
    "sourceUrl": "https://eu.beerwulf.com/nl-nl/products/lagunitas-ipa-8l-blade-biervat",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "BLADE 8 L"
  },
  {
    "name": "Birra Moretti BLADE 8 L",
    "sourceUrl": "https://beerwulf.com/products/birra-moretti-ricetta-originale-8l-blade-keg",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "BLADE 8 L"
  },
  {
    "name": "Affligem Blond fles",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Birra Moretti fles",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "BrewDog Punk IPA",
    "sourceUrl": "https://www.hanos.nl/nl/product/brewdog-punk-ipa-33cl-1213330",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Brouwerij 't IJ IJwit",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Brouwerij 't IJ Zatte",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Brouwerij Kees Caramel Fudge Stout",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Brouwerij Noordt Noordtsingle",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Corona Extra",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "De Molen Hel & Verdoemenis",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Desperados Original",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Frontaal Juice Punch",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Hoegaarden Wit",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Jopen Adriaan Wit",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Jopen Mooie Nel IPA",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Kasteel Rouge",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "La Chouffe",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Liefmans Fruitesse",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Moersleutel Crank the Juice",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Moersleutel Motor Oil",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Oedipus Mannenliefde",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Sol",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Speciaalbier tripel flesjes",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Texels Skuumkoppe",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Tripel Karmeliet",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Two Chefs Brewing Funky Falcon",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Uiltje Bird of Prey",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Uiltje Wit",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "vandeStreek Playground IPA 0.5",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  },
  {
    "name": "Vedett Extra White",
    "type": "Speciaalbier",
    "ingredients": [],
    "tasteProfile": "Flesbier"
  }
];

export function appendMissingBeers(existing: MenuEntry[]): { entries: MenuEntry[]; added: number } {
  const names = new Set(existing.map(entry => entry.name.trim().toLocaleLowerCase('nl')));
  const additions = temporaryBeerSeed.filter(entry => {
    const key = entry.name.trim().toLocaleLowerCase('nl');
    if (names.has(key)) return false;
    names.add(key);
    return true;
  });
  return { entries: [...existing, ...additions], added: additions.length };
}

/** Only fetch an image for an independently verified, exact product page. */
export async function enrichBeerImages(entries: MenuEntry[]): Promise<MenuEntry[]> {
  const allowedHosts = new Set(['eu.beerwulf.com', 'beerwulf.com', 'www.hanos.nl']);
  return Promise.all(entries.map(async entry => {
    if (!entry.sourceUrl || entry.imageUrl || entry.image) return entry;
    try {
      const page = new URL(entry.sourceUrl);
      if (page.protocol !== 'https:' || !allowedHosts.has(page.hostname)) return entry;
      const response = await fetch('https://api.microlink.io?url=' + encodeURIComponent(page.href), {
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) return entry;
      const result: unknown = await response.json();
      const image = (result as {data?:{image?:{url?:unknown}}})?.data?.image?.url;
      if (typeof image !== 'string' || !/^https:\/\//i.test(image)) return entry;
      return {...entry, imageUrl:image};
    } catch { return entry; }
  }));
}
