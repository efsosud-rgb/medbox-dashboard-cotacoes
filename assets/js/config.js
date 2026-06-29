const CONFIG = {
    // URL do CSV (Google Sheets exportado como CSV)
    // Exemplo: https://docs.google.com/spreadsheets/d/ID_DA_PLANILHA/export?format=csv&gid=GID_DA_ABA
    csvUrl: 'https://docs.google.com/spreadsheets/d/17j2HAa1cCqufL6uSGtlSbeWKIR2JpadmIcACQRhmPA0/export?format=csv&gid=933511869',

    // Caminho para o CSV de exemplo caso a URL falhe
    fallbackCsvPath: 'data/exemplo-cotacoes.csv',

    // Configurações de SLA (em horas)
    sla: {
        onTimeLimit: 2,    // Até 2 horas: NO PRAZO
        attentionLimit: 6, // De 2 a 6 horas: ATENÇÃO (Acima disso: ATRASADO)
    },

    // Identidade Visual
    colors: {
        primary: '#D80024',    // Vermelho MedBox
        secondary: '#00486C',  // Azul-marinho MedBox
        background: '#F4F6F8', // Fundo claro
        card: '#FFFFFF',       // Cards brancos
        status: {
            onTime: '#28a745',    // Verde
            attention: '#ffc107', // Amarelo
            delayed: '#dc3545',   // Vermelho
            pending: '#6c757d'    // Cinza
        }
    },

    // Configurações da Tabela
    table: {
        rowsPerPage: 50 // Limite de renderização para performance
    }
};
