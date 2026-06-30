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
     * Tenta converter string em Date de forma robusta
     */
    parseDate(val) {
        if (!val) return null;
        if (val instanceof Date) return val;

        // Tenta parse direto (ISO ou similar)
        let d = new Date(val);
        if (!isNaN(d.getTime())) return d;

        // Tenta formato DD/MM/YYYY HH:mm ou DD/MM/YYYY
        const match = String(val).match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:\s+(\d{1,2}):(\d{1,2}))?/);
        if (match) {
            let day = parseInt(match[1]);
            let month = parseInt(match[2]) - 1;
            let year = parseInt(match[3]);
            if (year < 100) year += 2000;
            let hour = parseInt(match[4] || 0);
            let min = parseInt(match[5] || 0);
            return new Date(year, month, day, hour, min);
        }

        return null;
    },

    /**
     * Formata uma data para o padrão brasileiro (DD/MM/YYYY HH:mm)
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = this.parseDate(dateString);
        if (!date) return dateString;

        return date.toLocaleDateString('pt-BR') + ' ' +
               date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },

    /**
     * Calcula a diferença em horas entre duas datas
     */
    diffInHours(dateStart, dateEnd) {
        const start = this.parseDate(dateStart);
        const end = this.parseDate(dateEnd);
        if (!start || !end) return null;

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
     * Converte string de moeda (R$ 1.500,00, 1500.00, etc) para Number.
     * Suporta formatos brasileiros e internacionais.
     */
    parseCurrency(val) {
        if (typeof val === 'number') return val;
        if (!val || val === '') return 0;

        let str = val.toString().replace(/R\$/g, '').replace(/\s/g, '');

        // Se tem vírgula, assume formato BR (1.234,56 ou 1234,56)
        if (str.includes(',')) {
            str = str.replace(/\./g, '').replace(',', '.');
        } else {
            // Se não tem vírgula, mas tem múltiplos pontos, assume pontos como milhar (1.234.567)
            const dotCount = (str.match(/\./g) || []).length;
            if (dotCount > 1) {
                str = str.replace(/\./g, '');
            }
            // Se tem apenas um ponto (ex: 1500.00), o parseFloat nativo já resolve corretamente.
        }

        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    },

    /**
     * Extrai o mês e ano de uma string de data (YYYY-MM)
     */
    getMonthYear(dateString) {
        const date = this.parseDate(dateString);
        if (!date) return null;
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
