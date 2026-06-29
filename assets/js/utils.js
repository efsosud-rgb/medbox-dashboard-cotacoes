/**
 * Utilitários gerais para o Dashboard
 */
const Utils = {
    /**
     * Formata um valor numérico para moeda BRL
     */
    formatCurrency(value) {
        if (isNaN(value) || value === null) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    /**
     * Formata uma data para o padrão brasileiro (DD/MM/YYYY HH:mm)
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        return date.toLocaleDateString('pt-BR') + ' ' +
               date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },

    /**
     * Calcula a diferença em horas entre duas datas
     */
    diffInHours(dateStart, dateEnd) {
        if (!dateStart || !dateEnd) return null;
        const start = new Date(dateStart);
        const end = new Date(dateEnd);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

        return Math.abs(end - start) / 36e5;
    },

    /**
     * Escapa caracteres HTML para evitar XSS
     */
    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Agrupa um array de objetos por uma chave
     */
    groupBy(array, key) {
        return array.reduce((acc, obj) => {
            const property = obj[key];
            acc[property] = acc[property] || [];
            acc[property].push(obj);
            return acc;
        }, {});
    },

    /**
     * Extrai o mês e ano de uma string de data (YYYY-MM)
     */
    getMonthYear(dateString) {
        if (!dateString) return null;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    },

    /**
     * Traduz o nome do mês para Português
     */
    translateMonth(yearMonth) {
        if (!yearMonth) return '';
        const [year, month] = yearMonth.split('-');
        const months = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        return months[parseInt(month) - 1] + '/' + year.substring(2);
    }
};
