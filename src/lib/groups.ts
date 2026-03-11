import { CountryGroup } from './types';

const GROUPS_KEY = 'utm_hub_groups';

/** Direct mapping: country code → display name (Portuguese).
 *  This is the authoritative source for what each code means.
 *  Never add a code here unless you are certain what it represents. */
export const CODE_NAMES: Record<string, string> = {
  // Arabic
  'ARM':   'Árabe - Mundo',
  'AREU':  'Árabe - Europa',
  'ARIS':  'Árabe - Israel',
  'ARKU':  'Árabe - Kuwait',
  'AROM':  'Árabe - Oriente Médio',
  // Alemanha
  'DE':    'Alemanha',
  // Bangladesh
  'BN':    'Bangladesh',
  'BNOM':  'Bangladesh - Oriente Médio',
  // Brasil
  'BR':    'Brasil',
  'BREUA': 'Brasil - EUA',
  'BREU':  'Brasil - Europa',
  // Bulgária
  'BG':    'Bulgária',
  // Coreia
  'KO':    'Coreia',
  // Croácia
  'HR':    'Croácia',
  // Chinês
  'ZHHK':  'Chinês - Hong Kong',
  'ZHML':  'Chinês - Malásia',
  'ZHTW':  'Chinês - Taiwan',
  // Eslováquia / Eslovênia
  'SK':    'Eslováquia',
  'SL':    'Eslovênia',
  // Espanhol
  'ESM':   'Espanhol - Mundo',
  'ESARG': 'Espanhol - Argentina',
  'ESCB':  'Espanhol - Colômbia',
  'ESCH':  'Espanhol - Chile',
  'ESEUA': 'Espanhol - EUA',
  'ESEU':  'Espanhol - Europa',
  'ESMX':  'Espanhol - México',
  // Filipinas
  'TL':    'Filipinas',
  'TLOM':  'Filipinas - Oriente Médio',
  // Francês
  'FRCN':  'Francês - Canadá',
  'FREU':  'Francês - Europa',
  'FRMD':  'Francês - Mundo',
  // Grécia
  'EL':    'Grécia',
  // Holanda
  'NL':    'Holanda',
  // Hungria
  'HU':    'Hungria',
  // Hindi
  'HI':    'Hindi',
  'HIOM':  'Hindi - Oriente Médio',
  // Indonésia
  'ID':    'Indonésia',
  // Inglês
  'ENAU':  'Inglês - Austrália',
  'ENCA':  'Inglês - Canadá',
  'ENOM':  'Inglês - Oriente Médio',
  'ENRU':  'Inglês - Rússia',
  'ENNZ':  'Inglês - Nova Zelândia',
  'ENAF':  'Inglês - África do Sul',
  // Israel
  'HE':    'Israel',
  // Itália
  'IT':    'Itália',
  // Japão
  'JP':    'Japão',
  // Lituânia
  'LT':    'Lituânia',
  // Malásia
  'MS':    'Malásia',
  // Polônia
  'PL':    'Polônia',
  // Romênia
  'RO':    'Romênia',
  // Russo
  'RUEU':  'Russo - Europa',
  'SRO':   'Sérvia - Romênia',
  'RU':    'Rússia',
  'SR':    'Sérvia',
  // Tailândia
  'TH':    'Tailândia',
  // Tcheco
  'CS':    'Tcheco',
  // Turco
  'TREU':  'Turco - Europa',
  'TRM':   'Turco - Mundo',
  // Ucraniano
  'UK':    'Ucraniano',
  // Urdu
  'UROM':  'Urdu - Oriente Médio',
  // Vietnã
  'VI':    'Vietnã',
};

/** Returns the display name for a code, or the code itself if unknown. */
export function getCodeName(code: string): string {
  return CODE_NAMES[code.toUpperCase()] ?? code;
}

/** Builds reverse map: code → primary group name (for the generate-from-group feature). */
export function buildCodeToGroup(groups: CountryGroup[]): Record<string, string> {
  const map: Record<string, string> = {};
  // Iterate in reverse so earlier (more general) groups don't overwrite specific ones
  for (const group of [...groups].reverse()) {
    for (const code of group.codes) {
      map[code.toUpperCase()] = group.name;
    }
  }
  return map;
}

export const DEFAULT_GROUPS: CountryGroup[] = [
  { id: '1',  name: 'ARABE-MUNDO',              codes: ['ARM', 'AREU', 'ARIS', 'ARKU', 'AROM'] },
  { id: '2',  name: 'ARABE-EUROPA',             codes: ['AREU'] },
  { id: '3',  name: 'ARABE-ISRAEL',             codes: ['ARIS'] },
  { id: '4',  name: 'ARABE-KUWAIT',             codes: ['ARKU'] },
  { id: '5',  name: 'ARABE-ORIENTE MEDIO',      codes: ['AROM'] },
  { id: '6',  name: 'ALEMANHA',                 codes: ['DE'] },
  { id: '7',  name: 'BANGLADESH',               codes: ['BN'] },
  { id: '8',  name: 'BANGLADESH-ORIENTE MEDIO', codes: ['BNOM'] },
  { id: '9',  name: 'BRASIL',                   codes: ['BR'] },
  { id: '10', name: 'BRASIL-EUA',               codes: ['BREUA'] },
  { id: '11', name: 'BRASIL-EUROPA',            codes: ['BREU'] },
  { id: '12', name: 'BULGARIA',                 codes: ['BG'] },
  { id: '13', name: 'COREIA',                   codes: ['KO'] },
  { id: '14', name: 'CROACIA',                  codes: ['HR'] },
  { id: '15', name: 'CHINES-HONG KONG',         codes: ['ZHHK'] },
  { id: '16', name: 'CHINES-MALASIA',           codes: ['ZHML'] },
  { id: '17', name: 'CHINES-TAIWAN',            codes: ['ZHTW'] },
  { id: '18', name: 'ESLOVAQUIA',               codes: ['SK'] },
  { id: '19', name: 'ESLOVENIA',                codes: ['SL'] },
  { id: '20', name: 'ESPANHOL-MUNDO',           codes: ['ESM'] },
  { id: '21', name: 'ESPANHOL-ARGENTINA',       codes: ['ESARG'] },
  { id: '22', name: 'ESPANHOL-CHILE',           codes: ['ESCH'] },
  { id: '23', name: 'ESPANHOL-COLOMBIA',        codes: ['ESCB'] },
  { id: '24', name: 'ESPANHOL-EUA',             codes: ['ESEUA'] },
  { id: '25', name: 'ESPANHOL-EUROPA',          codes: ['ESEU'] },
  { id: '26', name: 'ESPANHOL-MEXICO',          codes: ['ESMX'] },
  { id: '27', name: 'FILIPINAS',                codes: ['TL'] },
  { id: '28', name: 'FILIPINAS-ORIENTE MEDIO',  codes: ['TLOM'] },
  { id: '29', name: 'FRANCA-CANADA',            codes: ['FRCN'] },
  { id: '30', name: 'FRANCA-EUROPA',            codes: ['FREU'] },
  { id: '31', name: 'FRANCA-MUNDO',             codes: ['FRMD'] },
  { id: '32', name: 'GRECIA',                   codes: ['EL'] },
  { id: '33', name: 'HINDI',                    codes: ['HI'] },
  { id: '34', name: 'HINDI-ORIENTE MEDIO',      codes: ['HIOM'] },
  { id: '35', name: 'HOLANDA',                  codes: ['NL'] },
  { id: '36', name: 'HUNGRIA',                  codes: ['HU'] },
  { id: '37', name: 'INDONESIA',                codes: ['ID'] },
  { id: '38', name: 'INGLES-AFRICA-SUL',        codes: ['ENAF'] },
  { id: '39', name: 'INGLES-AUSTRALIA',         codes: ['ENAU'] },
  { id: '40', name: 'INGLES-CANADA',            codes: ['ENCA'] },
  { id: '41', name: 'INGLES-NOVA ZELANDIA',     codes: ['ENNZ'] },
  { id: '42', name: 'INGLES-ORIENTE MEDIO',     codes: ['ENOM'] },
  { id: '43', name: 'INGLES-RUSSIA',            codes: ['ENRU'] },
  { id: '44', name: 'ISRAEL',                   codes: ['HE'] },
  { id: '45', name: 'ITALIA',                   codes: ['IT'] },
  { id: '46', name: 'JAPAO',                    codes: ['JP'] },
  { id: '47', name: 'LITUANIA',                 codes: ['LT'] },
  { id: '48', name: 'MALASIA',                  codes: ['MS'] },
  { id: '49', name: 'POLONIA',                  codes: ['PL'] },
  { id: '50', name: 'ROMENIA',                  codes: ['RO'] },
  { id: '51', name: 'RUSSIA-EUROPA',            codes: ['RUEU'] },
  { id: '52', name: 'RUSSIA-MUNDO',             codes: ['RU'] },
  { id: '53', name: 'SERBIA',                   codes: ['SR'] },
  { id: '54', name: 'SROMENIA',                 codes: ['SRO'] },
  { id: '55', name: 'TAILANDIA',                codes: ['TH'] },
  { id: '56', name: 'TCHECO',                   codes: ['CS'] },
  { id: '57', name: 'TURCO-EUROPA',             codes: ['TREU'] },
  { id: '58', name: 'TURCO-MUNDO',              codes: ['TRM'] },
  { id: '59', name: 'UCRANIO',                  codes: ['UK'] },
  { id: '60', name: 'URDU-ORIENTE MEDIO',       codes: ['UROM'] },
  { id: '61', name: 'VIETNA',                   codes: ['VI'] },
];

export function getGroups(): CountryGroup[] {
  if (typeof window === 'undefined') return DEFAULT_GROUPS;
  try {
    const stored = localStorage.getItem(GROUPS_KEY);
    if (!stored) return DEFAULT_GROUPS;
    return JSON.parse(stored) as CountryGroup[];
  } catch {
    return DEFAULT_GROUPS;
  }
}

export function saveGroups(groups: CountryGroup[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

export function getGroupByName(name: string): CountryGroup | undefined {
  const groups = getGroups();
  return groups.find(g => g.name.toUpperCase() === name.toUpperCase());
}

export function addGroup(name: string, codes: string[]): CountryGroup {
  const groups = getGroups();
  const newGroup: CountryGroup = {
    id: Date.now().toString(),
    name: name.toUpperCase().trim(),
    codes: codes.map(c => c.toUpperCase().trim()).filter(Boolean),
  };
  saveGroups([...groups, newGroup]);
  return newGroup;
}

export function updateGroup(id: string, name: string, codes: string[]): void {
  const groups = getGroups();
  const updated = groups.map(g =>
    g.id === id
      ? { ...g, name: name.toUpperCase().trim(), codes: codes.map(c => c.toUpperCase().trim()).filter(Boolean) }
      : g
  );
  saveGroups(updated);
}

export function deleteGroup(id: string): void {
  const groups = getGroups();
  saveGroups(groups.filter(g => g.id !== id));
}

export function resetGroups(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GROUPS_KEY);
}
