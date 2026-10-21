#!/usr/bin/env python3
"""
Builds the city tables in src/places/ from GeoNames (CC-BY 4.0, https://www.geonames.org/).

Inputs (download into a scratch directory first, not into the repo):
  https://download.geonames.org/export/dump/cities500.zip        -> cities500.txt
  https://download.geonames.org/export/dump/cities15000.zip      -> cities15000.txt
  https://download.geonames.org/export/dump/alternateNamesV2.zip -> filtered to Hebrew names:
      python3 scripts/build-places.py hebrew <alternateNamesV2.txt> <cities500.txt> > he-names.tsv

Then:
  python3 scripts/build-places.py build <dir with cities500.txt, cities15000.txt, he-names.tsv>

Writes src/places/cities-data.ts (the small built-in table, by explicit GeoNames id, plus
our own spelling aliases) and src/places/full-data.ts (every city of 15,000+ people).
"""
import sys, re, json, unicodedata

DEFAULT = [
  # (slug, geonameid, extra aliases)
  # Israel
  ('jerusalem', 281184, ['Yerushalayim', 'Yerushalaim']),
  ('bnei-brak', 295514, ['Bene Beraq', 'Bnai Brak', 'Bene Brak']),
  ('tel-aviv', 293397, ['Tel Aviv-Yafo', 'Tel Aviv Jaffa']),
  ('haifa', 294801, ['Hefa', 'Chaifa']),
  ('petach-tikva', 293918, ['Petah Tikva', 'Petach Tikvah', 'Petah Tiqwa']),
  ('beit-shemesh', 295432, ['Bet Shemesh']),
  ('modiin-illit', 8199378, ["Modi'in Illit", 'Kiryat Sefer', 'Qiryat Sefer']),
  ('modiin', 282926, ["Modi'in", 'Modiin Maccabim Reut']),
  ('elad', 8428480, ["El'ad"]),
  ('maale-adumim', 282993, ["Ma'ale Adumim", 'Maale Adumim']),
  ('givat-zeev', 8199386, ["Giv'at Ze'ev"]),
  ('efrat', 283991, ['Efrata', 'Efrat']),
  ('alon-shvut', 11979628, ['Alon Shevut', 'Gush Etzion']),
  ('ariel', 8199394, []),
  ('tzfas', 293100, ['Safed', 'Tsfat', 'Zefat', 'Tzfat', 'Tzefas']),
  ('teverya', 293322, ['Tiberias', 'Tveria']),
  ('ashdod', 295629, []),
  ('netanya', 294071, []),
  ('beer-sheva', 295530, ["Be'er Sheva", 'Beersheba', 'Beer Sheba']),
  ('eilat', 295277, ['Elat']),
  ('herzliya', 294778, []),
  ('raanana', 293807, ["Ra'anana"]),
  ('ramat-gan', 293788, []),
  ('holon', 294751, []),
  ('bat-yam', 295548, []),
  ('rishon-letzion', 293703, ['Rishon LeZion', 'Rishon Lezion']),
  ('rechovot', 293725, ['Rehovot', 'Rechovot']),
  ('ashkelon', 295620, []),
  ('afula', 295740, []),
  ('hadera', 294946, []),
  ('kfar-saba', 294514, ['Kefar Sava']),
  ('zichron-yaakov', 293067, ["Zikhron Ya'akov", 'Zichron Yaakov']),
  ('kiryat-gat', 293842, ['Qiryat Gat']),
  ('kiryat-shmona', 293825, ['Qiryat Shemona', 'Kiryat Shemona']),
  ('netivot', 294068, []),
  ('dimona', 295328, []),
  ('arad', 295657, []),
  ('sderot', 293619, []),
  ('katzrin', 443093, ['Qatsrin', 'Katsrin']),
  ('shoham', 8428283, []),
  ('rosh-haayin', 293690, ["Rosh Ha'Ayin"]),
  ('yavne', 293222, ['Yavneh']),
  ('karmiel', 294577, ["Karmi'el", 'Carmiel']),
  ('hod-hasharon', 294760, []),
  ('akko', 295721, ['Acre', 'Acco', 'Ako']),
  ('nahariya', 294117, ['Nahariyya', 'Naharia']),
  ('immanuel', 283610, ['Emmanuel', 'Emanuel', 'Imanuel']),
  # United States
  ('brooklyn', 5110302, ['Williamsburg', 'Flatbush', 'Crown Heights']),
  ('borough-park', 5109790, ['Boro Park', 'Boropark']),
  ('queens', 5133273, ['Kew Gardens Hills', 'Forest Hills']),
  ('new-york', 5128581, ['NYC', 'Manhattan']),
  ('far-rockaway', 5116917, ['Five Towns']),
  ('lakewood', 5100280, ['Lakewood NJ']),
  ('toms-river', 4504476, []),
  ('monsey', 5127315, []),
  ('spring-valley', 5139301, []),
  ('kiryas-joel', 5123533, ['Kiryas Yoel', 'Kiryat Yoel']),
  ('passaic', 5102443, []),
  ('teaneck', 5105262, []),
  ('baltimore', 4347778, []),
  ('washington', 4140963, ['Washington DC', 'Washington D.C.']),
  ('pittsburgh', 5206379, []),
  ('scranton', 5211303, []),
  ('new-haven', 4839366, []),
  ('stamford', 4843564, []),
  ('providence', 5224151, []),
  ('albany', 5106834, []),
  ('buffalo', 5110629, []),
  ('silver-spring', 4369596, []),
  ('philadelphia', 4560349, []),
  ('boston', 4930956, []),
  ('chicago', 4887398, []),
  ('skokie', 4911600, []),
  ('southfield', 5010636, []),
  ('cincinnati', 4508722, []),
  ('columbus', 4509177, []),
  ('minneapolis', 5037649, []),
  ('milwaukee', 5263045, []),
  ('cleveland', 5150529, []),
  ('detroit', 4990729, []),
  ('miami', 4164138, []),
  ('miami-beach', 4164143, []),
  ('boca-raton', 4148411, []),
  ('hollywood-fl', 4158928, ['Hollywood']),
  ('orlando', 4167147, []),
  ('atlanta', 4180439, []),
  ('charlotte', 4460243, []),
  ('memphis', 4641239, []),
  ('nashville', 4644585, []),
  ('austin', 4671654, []),
  ('dallas', 4684888, []),
  ('houston', 4699066, []),
  ('denver', 5419384, []),
  ('phoenix', 5308655, []),
  ('los-angeles', 5368361, ['LA']),
  ('san-diego', 5391811, []),
  ('san-francisco', 5391959, []),
  ('portland', 5746545, ['Portland Oregon']),
  ('seattle', 5809844, []),
  ('las-vegas', 5506956, []),
  ('st-louis', 4407066, ['Saint Louis']),
  ('anchorage', 5879400, []),
  ('honolulu', 5856195, []),
  # Canada
  ('toronto', 6167865, []),
  ('montreal', 6077243, ['Montréal']),
  ('vancouver', 6173331, []),
  ('ottawa', 6094817, []),
  ('winnipeg', 6183235, []),
  ('calgary', 5913490, []),
  # Latin America
  ('mexico-city', 3530597, ['Ciudad de Mexico', 'CDMX']),
  ('buenos-aires', 3435910, []),
  ('sao-paulo', 3448439, ['São Paulo']),
  ('rio-de-janeiro', 3451190, []),
  ('panama-city', 3703443, ['Panama']),
  ('santiago', 3871336, []),
  ('montevideo', 3441575, []),
  ('caracas', 3646738, []),
  ('bogota', 3688689, ['Bogotá']),
  ('lima', 3936456, []),
  # United Kingdom and Ireland
  ('london', 2643743, []),
  ('stamford-hill', 11669854, []),
  ('golders-green', 7535506, []),
  ('manchester', 2643123, []),
  ('salford', 2638671, []),
  ('birmingham', 2655603, []),
  ('liverpool', 2644210, []),
  ('gateshead', 2648773, []),
  ('leeds', 2644688, []),
  ('glasgow', 2648579, []),
  ('dublin', 2964574, []),
  # Europe
  ('antwerp', 2803138, ['Antwerpen', 'Anvers']),
  ('brussels', 2800866, ['Bruxelles', 'Brussel']),
  ('amsterdam', 2759794, []),
  ('paris', 2988507, []),
  ('strasbourg', 2973783, []),
  ('marseille', 2995469, ['Marseilles']),
  ('lyon', 2996944, []),
  ('nice', 2990440, []),
  ('zurich', 2657896, ['Zürich']),
  ('geneva', 2660646, ['Genève', 'Geneve']),
  ('basel', 2661604, []),
  ('vienna', 2761369, ['Wien']),
  ('berlin', 2950159, []),
  ('frankfurt', 2925533, ['Frankfurt am Main']),
  ('munich', 2867714, ['München']),
  ('rome', 3169070, ['Roma']),
  ('milan', 3173435, ['Milano']),
  ('madrid', 3117735, []),
  ('barcelona', 3128760, []),
  ('lisbon', 2267057, ['Lisboa']),
  ('budapest', 3054643, []),
  ('prague', 3067696, ['Praha']),
  ('warsaw', 756135, ['Warszawa']),
  ('krakow', 3094802, ['Kraków', 'Cracow']),
  ('bucharest', 683506, ['București', 'Bucuresti']),
  ('vilnius', 593116, ['Vilna', 'Vilne']),
  ('riga', 456172, []),
  ('minsk', 625144, []),
  ('copenhagen', 2618425, ['København']),
  ('stockholm', 2673730, []),
  ('oslo', 3143244, []),
  ('helsinki', 658225, []),
  ('reykjavik', 3413829, ['Reykjavík']),
  ('tromso', 3133895, ['Tromsø', 'Tromso']),
  ('moscow', 524901, ['Moskva']),
  ('st-petersburg', 498817, ['Saint Petersburg']),
  ('kyiv', 703448, ['Kiev']),
  ('odesa', 698740, ['Odessa']),
  ('dnipro', 709930, ['Dnepropetrovsk']),
  ('uman', 690688, []),
  ('istanbul', 745044, []),
  ('tbilisi', 611717, []),
  ('baku', 587084, []),
  ('tashkent', 1512569, []),
  ('athens', 264371, []),
  ('thessaloniki', 734077, ['Salonika']),
  # Africa, Asia, Oceania
  ('johannesburg', 993800, []),
  ('cape-town', 3369157, []),
  ('durban', 1007311, []),
  ('casablanca', 2553604, []),
  ('dubai', 292223, []),
  ('mumbai', 1275339, ['Bombay']),
  ('new-delhi', 1261481, ['Delhi']),
  ('bangkok', 1609350, []),
  ('hong-kong', 1819729, []),
  ('singapore', 1880252, []),
  ('tokyo', 1850147, []),
  ('beijing', 1816670, []),
  ('shanghai', 1796236, []),
  ('melbourne', 2158177, []),
  ('sydney', 2147714, []),
  ('perth', 2063523, []),
  ('brisbane', 2174003, []),
  ('adelaide', 2078025, []),
  ('auckland', 2193733, []),
  ('wellington', 2179537, []),
  ('chatham-islands', 4032804, ['Waitangi', 'Chatham']),
]

# Overrides for the built-in table (ours, not GeoNames'). English display names: the common
# English spelling. Hebrew: where GeoNames has none, or a historic one. Zones: Israeli
# communities keep Israel time (Asia/Jerusalem); GeoNames gives some Asia/Hebron, whose DST
# dates differ.
NAME = {
  'petach-tikva': 'Petah Tikva', 'rechovot': 'Rehovot', 'holon': 'Holon', 'yavne': 'Yavne', 'elad': 'Elad',
  'modiin': "Modi'in", 'modiin-illit': "Modi'in Illit", 'maale-adumim': "Ma'ale Adumim", 'givat-zeev': "Giv'at Ze'ev",
  'efrat': 'Efrat', 'alon-shvut': 'Alon Shvut', 'rosh-haayin': 'Rosh HaAyin', 'zichron-yaakov': 'Zichron Yaakov',
  'kiryat-shmona': 'Kiryat Shmona', 'rishon-letzion': 'Rishon LeZion', 'beer-sheva': "Be'er Sheva",
  'beit-shemesh': 'Beit Shemesh', 'tzfas': 'Safed (Tzfas)', 'teverya': 'Tiberias', 'chatham-islands': 'Chatham Islands (Waitangi)',
  'thessaloniki': 'Thessaloniki', 'zurich': 'Zurich', 'montreal': 'Montreal', 'krakow': 'Krakow', 'reykjavik': 'Reykjavik',
  'karmiel': 'Karmiel', 'akko': 'Akko (Acre)', 'nahariya': 'Nahariya', 'immanuel': 'Immanuel', 'washington': 'Washington, D.C.',
  'hollywood-fl': 'Hollywood (Florida)', 'portland': 'Portland (Oregon)', 'bogota': 'Bogota',
}
HEBREW = {
  'elad': 'אלעד', 'istanbul': 'איסטנבול', 'passaic': 'פסייק', 'teaneck': 'טינק', 'silver-spring': 'סילבר ספרינג',
  'miami-beach': 'מיאמי ביץ׳', 'chatham-islands': 'איי צ׳טהאם', 'dnipro': 'דניפרו', 'santiago': 'סנטיאגו',
  'queens': 'קווינס', 'toms-river': 'טומס ריבר', 'spring-valley': 'ספרינג ואלי', 'washington': 'וושינגטון',
  'boca-raton': 'בוקה רטון', 'salford': 'סלפורד', 'nahariya': 'נהריה',
}
ZONE = {'immanuel': 'Asia/Jerusalem', 'givat-zeev': 'Asia/Jerusalem', 'maale-adumim': 'Asia/Jerusalem', 'efrat': 'Asia/Jerusalem', 'alon-shvut': 'Asia/Jerusalem', 'ariel': 'Asia/Jerusalem'}

HEB = re.compile('[א-ת]')
NIKUD = re.compile('[֑-ׇ]')

def hebrew(path_alt, path_cities):
    ids = set(l.split('\t', 1)[0] for l in open(path_cities, encoding='utf8'))
    for line in open(path_alt, encoding='utf8'):
        p = line.rstrip('\n').split('\t')
        if len(p) > 3 and p[2] == 'he' and p[1] in ids:
            print('\t'.join([p[1], p[3], p[4], p[5], p[6], p[7]]))

def pick_hebrew(names):
    """Preferred, then the first plain (no nikud, not historic) name."""
    names = [(n, f) for n, f in names if HEB.search(n)]
    pref = [n for n, flags in names if flags[0] == '1' and not NIKUD.search(n)]
    if pref: return pref[0]
    plain = [n for n, flags in names if not NIKUD.search(n) and flags[3] != '1']
    return plain[0] if plain else None

def load(dir_):
    rows = {}
    for f in ('cities500.txt',):
        for l in open(f'{dir_}/{f}', encoding='utf8'):
            p = l.rstrip('\n').split('\t')
            rows[int(p[0])] = p
    he = {}
    for l in open(f'{dir_}/he-names.tsv', encoding='utf8'):
        p = l.rstrip('\n').split('\t')
        he.setdefault(int(p[0]), []).append((p[1], p[2:]))
    return rows, he

def elevation(p):
    for v in (p[15], p[16]):
        if v and v != '-9999': return max(0, int(v))
    return 0

def build(dir_):
    rows, he = load(dir_)
    out = []
    for slug, gid, aliases in DEFAULT:
        p = rows[gid]
        hname = HEBREW.get(slug) or pick_hebrew(he.get(gid, []))
        name = NAME.get(slug, p[1])
        extra = [x for x in (p[1], p[2]) if x != name]
        out.append([slug, name, hname or '', round(float(p[4]), 4), round(float(p[5]), 4), elevation(p), ZONE.get(slug, p[17]), p[8], sorted(set(aliases + extra) - {name}), gid])
    with open('src/places/cities-data.ts', 'w', encoding='utf8') as f:
        f.write('/**\n * The built-in city table. Data from GeoNames (https://www.geonames.org/), CC-BY 4.0;\n')
        f.write(' * aliases added for Luach. Generated by scripts/build-places.py; do not edit by hand.\n *\n * @packageDocumentation\n */\n\n')
        f.write('/** [id, name, Hebrew name, latitude, longitude, elevation (m), IANA zone, country, aliases, GeoNames id] */\n')
        f.write('export type CityRow = readonly [string, string, string, number, number, number, string, string, readonly string[], number];\n\n')
        f.write('export const CITY_ROWS: readonly CityRow[] = [\n')
        for r in out: f.write('  ' + json.dumps(r, ensure_ascii=False) + ',\n')
        f.write('];\n')
    # Full table: every city of 15,000+ people.
    full = []
    for l in open(f'{dir_}/cities15000.txt', encoding='utf8'):
        p = l.rstrip('\n').split('\t')
        gid = int(p[0])
        hname = pick_hebrew(he.get(gid, [])) or ''
        name = p[1].replace('\t', ' ')
        ascii_ = p[2] if p[2] != p[1] else ''
        full.append('\t'.join([str(gid), name, ascii_, hname, f'{float(p[4]):.4f}'.rstrip('0').rstrip('.'), f'{float(p[5]):.4f}'.rstrip('0').rstrip('.'), str(elevation(p)), p[17], p[8], p[10], p[14]]))
    with open('src/places/full-data.ts', 'w', encoding='utf8') as f:
        f.write('/**\n * Every city of 15,000+ people, from GeoNames (https://www.geonames.org/), CC-BY 4.0.\n')
        f.write(' * Generated by scripts/build-places.py; do not edit by hand. One city per line:\n')
        f.write(' * GeoNames id, name, ASCII name (if different), Hebrew name, latitude, longitude,\n * elevation (m), IANA zone, country, admin1 code, population; tab-separated.\n *\n * @packageDocumentation\n */\n\n')
        f.write('export const FULL_CITY_DATA = ' + json.dumps('\n'.join(full), ensure_ascii=False) + ';\n')
    print(len(out), 'default cities;', len(full), 'full')

if __name__ == '__main__':
    if sys.argv[1] == 'hebrew': hebrew(sys.argv[2], sys.argv[3])
    else: build(sys.argv[2])
