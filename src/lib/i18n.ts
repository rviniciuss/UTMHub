export type Locale = 'pt' | 'en';

const translations: Record<Locale, Record<string, string>> = {
  pt: {
    // Nav
    'Dashboard': 'Painel',
    'UTM Generator': 'Gerador UTM',
    'Countries': 'Países',
    'Niches': 'Nichos',
    'Settings': 'Configurações',

    // Header
    'Add New UTM': 'Novo UTM',

    // Generator page
    'Paste Campaign Text': 'Colar Texto da Campanha',
    'Paste your campaign lines here...': 'Cole as linhas da campanha aqui...',
    'Extract Campaigns': 'Extrair Campanhas',
    'Generate UTMs': 'Gerar UTMs',
    'Copy All': 'Copiar Tudo',
    'Export CSV': 'Exportar CSV',
    'Clear': 'Limpar',
    'Copy': 'Copiar',
    'Copied!': 'Copiado!',

    // Table headers
    'Cartaz': 'Cartaz',
    'Group': 'Grupo',
    'Country': 'País',
    'Parameter': 'Parâmetro',
    'Platform': 'Plataforma',
    'UTM': 'UTM',
    'Actions': 'Ações',

    // Status / labels
    'Generated UTMs': 'UTMs Gerados',
    'Parsed Campaigns': 'Campanhas Extraídas',
    'No campaigns parsed yet': 'Nenhuma campanha extraída ainda',
    'No UTMs generated yet': 'Nenhum UTM gerado ainda',
    'Group not found in Settings': 'Grupo não encontrado nas Configurações',
    'Group has no country codes': 'Grupo sem códigos de país',
    'lines detected': 'linhas detectadas',
    'UTMs generated': 'UTMs gerados',
    'All UTMs copied!': 'Todos os UTMs copiados!',

    // Settings
    'Country Groups': 'Grupos de Países',
    'Add Group': 'Adicionar Grupo',
    'Edit Group': 'Editar Grupo',
    'Delete Group': 'Excluir Grupo',
    'Save': 'Salvar',
    'Cancel': 'Cancelar',
    'Group Name': 'Nome do Grupo',
    'Country Codes': 'Códigos de País',
    'Country codes separated by commas': 'Códigos separados por vírgula',
    'No codes': 'Sem códigos',
    'Reset to defaults': 'Restaurar padrões',
    'Data Management': 'Gerenciamento de Dados',
    'Appearance': 'Aparência',
    'Integrations': 'Integrações',
    'Export Campaigns': 'Exportar Campanhas',
    'Clear All Data': 'Limpar Todos os Dados',
    'Bulk Import (JSON)': 'Importação em Massa (JSON)',
    'Import JSON': 'Importar JSON',

    // Dashboard
    'Total UTMs': 'Total de UTMs',
    'Active': 'Ativos',
    'Testing': 'Em Teste',
    'Paused': 'Pausados',
    'Generate': 'Gerar',
    'Import': 'Importar',
    'Export': 'Exportar',

    // Misc
    'How It Works': 'Como Funciona',
    'Example': 'Exemplo',
    'Pro Tip': 'Dica Pro',
    'Use the UTM Generator for instant parameter creation.': 'Use o Gerador UTM para criar parâmetros rapidamente.',

    // Language
    'Language': 'Idioma',
    'Portuguese': 'Português',
    'English': 'Inglês',

    // Parser instructions
    'Parser format': 'Formato do texto',
    'Example input': 'Exemplo de entrada',
    'Paste one campaign per line. Format: Cartaz N [GROUP] ... CODE-Parameter-Platform': 'Cole uma campanha por linha. Formato: Cartaz N [GRUPO] ... CODIGO-Parametro-Plataforma',
  },
  en: {
    // Nav
    'Dashboard': 'Dashboard',
    'UTM Generator': 'UTM Generator',
    'Countries': 'Countries',
    'Niches': 'Niches',
    'Settings': 'Settings',

    // Header
    'Add New UTM': 'Add New UTM',

    // Generator page
    'Paste Campaign Text': 'Paste Campaign Text',
    'Paste your campaign lines here...': 'Paste your campaign lines here...',
    'Extract Campaigns': 'Extract Campaigns',
    'Generate UTMs': 'Generate UTMs',
    'Copy All': 'Copy All',
    'Export CSV': 'Export CSV',
    'Clear': 'Clear',
    'Copy': 'Copy',
    'Copied!': 'Copied!',

    // Table headers
    'Cartaz': 'Poster',
    'Group': 'Group',
    'Country': 'Country',
    'Parameter': 'Parameter',
    'Platform': 'Platform',
    'UTM': 'UTM',
    'Actions': 'Actions',

    // Status / labels
    'Generated UTMs': 'Generated UTMs',
    'Parsed Campaigns': 'Parsed Campaigns',
    'No campaigns parsed yet': 'No campaigns parsed yet',
    'No UTMs generated yet': 'No UTMs generated yet',
    'Group not found in Settings': 'Group not found in Settings',
    'Group has no country codes': 'Group has no country codes',
    'lines detected': 'lines detected',
    'UTMs generated': 'UTMs generated',
    'All UTMs copied!': 'All UTMs copied!',

    // Settings
    'Country Groups': 'Country Groups',
    'Add Group': 'Add Group',
    'Edit Group': 'Edit Group',
    'Delete Group': 'Delete Group',
    'Save': 'Save',
    'Cancel': 'Cancel',
    'Group Name': 'Group Name',
    'Country Codes': 'Country Codes',
    'Country codes separated by commas': 'Country codes separated by commas',
    'No codes': 'No codes',
    'Reset to defaults': 'Reset to defaults',
    'Data Management': 'Data Management',
    'Appearance': 'Appearance',
    'Integrations': 'Integrations',
    'Export Campaigns': 'Export Campaigns',
    'Clear All Data': 'Clear All Data',
    'Bulk Import (JSON)': 'Bulk Import (JSON)',
    'Import JSON': 'Import JSON',

    // Dashboard
    'Total UTMs': 'Total UTMs',
    'Active': 'Active',
    'Testing': 'Testing',
    'Paused': 'Paused',
    'Generate': 'Generate',
    'Import': 'Import',
    'Export': 'Export',

    // Misc
    'How It Works': 'How It Works',
    'Example': 'Example',
    'Pro Tip': 'Pro Tip',
    'Use the UTM Generator for instant parameter creation.': 'Use the UTM Generator for instant parameter creation.',

    // Language
    'Language': 'Language',
    'Portuguese': 'Portuguese',
    'English': 'English',

    // Parser instructions
    'Parser format': 'Parser format',
    'Example input': 'Example input',
    'Paste one campaign per line. Format: Cartaz N [GROUP] ... CODE-Parameter-Platform': 'Paste one campaign per line. Format: Cartaz N [GROUP] ... CODE-Parameter-Platform',
  },
};

export function translate(locale: Locale, key: string): string {
  return translations[locale][key] ?? translations['en'][key] ?? key;
}

export function createTranslator(locale: Locale) {
  return (key: string) => translate(locale, key);
}
