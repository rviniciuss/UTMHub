import { CountryGroup } from './types';

const GROUPS_KEY = 'utm_hub_groups';

export const DEFAULT_GROUPS: CountryGroup[] = [
  { id: '1',  name: 'ARABE-MUNDO',              codes: ['ARM', 'AREU', 'ARIS', 'ARKU', 'AROM'] },
  { id: '2',  name: 'ARABE-EUROPA',             codes: ['AREU'] },
  { id: '3',  name: 'ARABE-ISRAEL',             codes: ['ARIS'] },
  { id: '4',  name: 'ARABE-KUWAIT',             codes: ['ARKU'] },
  { id: '5',  name: 'ARABE-ORIENTE MEDIO',      codes: ['AROM'] },
  { id: '6',  name: 'ALEMANHA',                 codes: ['DE'] },
  { id: '7',  name: 'BANGLADESH',               codes: [] },
  { id: '8',  name: 'BANGLADESH-ORIENTE MEDIO', codes: [] },
  { id: '9',  name: 'BRASIL',                   codes: ['BR'] },
  { id: '10', name: 'BRASIL-EUROPA',            codes: ['BREU'] },
  { id: '11', name: 'BULGARIA',                 codes: [] },
  { id: '12', name: 'COREIA',                   codes: [] },
  { id: '13', name: 'CROACIA',                  codes: ['HR'] },
  { id: '14', name: 'CHINES-HONG KONG',         codes: [] },
  { id: '15', name: 'CHINES-MALASIA',           codes: [] },
  { id: '16', name: 'CHINES-TAIWAN',            codes: [] },
  { id: '17', name: 'ESLOVAQUIA',               codes: ['SL'] },
  { id: '18', name: 'ESPANHOL-ARGENTINA',       codes: ['ESARG'] },
  { id: '19', name: 'ESPANHOL-CHILE',           codes: ['ESCH'] },
  { id: '20', name: 'ESPANHOL-COLOMBIA',        codes: ['ESCB'] },
  { id: '21', name: 'ESPANHOL-EUROPA',          codes: [] },
  { id: '22', name: 'ESPANHOL-MEXICO',          codes: ['ESMX'] },
  { id: '23', name: 'ESPANHOL-MUNDO',           codes: ['ESARG', 'ESCB', 'ESCH', 'ESMX'] },
  { id: '24', name: 'ESPANHOL-ORIENTE MEDIO',   codes: [] },
  { id: '25', name: 'FILIPINAS',                codes: ['TLCM'] },
  { id: '26', name: 'FRANCA-CANADA',            codes: ['FRMC'] },
  { id: '27', name: 'FRANCA-EUROPA',            codes: ['FREU'] },
  { id: '28', name: 'FRANCA-MUNDO',             codes: ['FRMD'] },
  { id: '29', name: 'GRECIA',                   codes: [] },
  { id: '30', name: 'HINDI',                    codes: [] },
  { id: '31', name: 'HINDI-ORIENTE MEDIO',      codes: ['HIOM'] },
  { id: '32', name: 'HOLANDA',                  codes: ['NL'] },
  { id: '33', name: 'HUNGRIA',                  codes: ['HU'] },
  { id: '34', name: 'INDONESIA',                codes: ['ID'] },
  { id: '35', name: 'INGLES-AFRICA-SUL',        codes: ['ENAF'] },
  { id: '36', name: 'INGLES-AUSTRALIA',         codes: ['ENAO'] },
  { id: '37', name: 'INGLES-CANADA',            codes: ['ENCA'] },
  { id: '38', name: 'INGLES-MUNDO',             codes: ['ENCA', 'ENAO', 'EINZ', 'ENAF'] },
  { id: '39', name: 'INGLES-NOVA ZELANDIA',     codes: ['EINZ'] },
  { id: '40', name: 'INGLES-ORIENTE MEDIO',     codes: [] },
  { id: '41', name: 'ISRAEL',                   codes: ['HE'] },
  { id: '42', name: 'ITALIA',                   codes: ['IT'] },
  { id: '43', name: 'JAPAO',                    codes: [] },
  { id: '44', name: 'LITUANIA',                 codes: ['LT'] },
  { id: '45', name: 'MALASIA',                  codes: ['MS'] },
  { id: '46', name: 'POLONIA',                  codes: ['PL'] },
  { id: '47', name: 'RUSSIA-EUROPA',            codes: [] },
  { id: '48', name: 'RUSSIA-MUNDO',             codes: ['RU'] },
  { id: '49', name: 'SROMENIA',                 codes: ['SRO'] },
  { id: '50', name: 'TAILANDIA',                codes: [] },
  { id: '51', name: 'TCHECO',                   codes: ['CS'] },
  { id: '52', name: 'TURCO-EUROPA',             codes: ['TREU'] },
  { id: '53', name: 'TURCO-MUNDO',              codes: ['TRM'] },
  { id: '54', name: 'UCRANIO',                  codes: ['UK'] },
  { id: '55', name: 'URDU-ORIENTE MEDIO',       codes: [] },
  { id: '56', name: 'VIETNA',                   codes: ['VI'] },
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
