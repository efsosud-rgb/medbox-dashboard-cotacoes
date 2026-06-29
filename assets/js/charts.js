/**
 * Gerenciamento de Gráficos (Chart.js)
 */
const Charts = {
    instances: {},

    /**
     * Inicializa ou atualiza todos os gráficos
     */
    renderAll(stats) {
        this.destroyAll();

        this.renderStatusPie(stats);
        this.renderStatusFunnel(stats);
        this.renderResponsavelBar(stats);
        this.renderPendenciasBar(stats);
        this.renderTopClientesVol(stats);
        this.renderTopClientesVal(stats);
        this.renderEvolucaoMensal(stats);
        this.renderSLAByResponsavel(stats);
        this.renderConversionByResponsavel(stats);
        this.renderValueByMonth(stats);
        this.renderHeatmap(stats);
    },

    destroyAll() {
        Object.values(this.instances).forEach(chart => chart.destroy());
        this.instances = {};
    },

    createChart(id, config) {
        const ctx = document.getElementById(id);
        if (!ctx) return;
        this.instances[id] = new Chart(ctx, config);
    },

    renderStatusPie(stats) {
        const labels = Object.keys(stats.porStatus);
        const data = Object.values(stats.porStatus);
        this.createChart('chartStatus', {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: [CONFIG.colors.primary, CONFIG.colors.secondary, '#FFCE56', '#4BC0C0', '#9966FF']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    },

    renderStatusFunnel(stats) {
        // Funil simulado com gráfico de barras horizontal
        const data = [
            stats.total,
            stats.respondidas,
            stats.pedidos
        ];
        this.createChart('chartFunnel', {
            type: 'bar',
            data: {
                labels: ['Recebidas', 'Respondidas', 'Pedidos'],
                datasets: [{
                    label: 'Volume',
                    data,
                    backgroundColor: [CONFIG.colors.secondary, '#36A2EB', CONFIG.colors.primary]
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    },

    renderResponsavelBar(stats) {
        const entries = Object.entries(stats.porResponsavel);
        this.createChart('chartResponsavel', {
            type: 'bar',
            data: {
                labels: entries.map(e => e[0]),
                datasets: [{
                    label: 'Cotações Atribuídas',
                    data: entries.map(e => e[1].total),
                    backgroundColor: CONFIG.colors.secondary
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    },

    renderPendenciasBar(stats) {
        const entries = Object.entries(stats.porResponsavel);
        this.createChart('chartPendencias', {
            type: 'bar',
            data: {
                labels: entries.map(e => e[0]),
                datasets: [{
                    label: 'Pendências',
                    data: entries.map(e => e[1].pendentes),
                    backgroundColor: CONFIG.colors.primary
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    },

    renderTopClientesVol(stats) {
        this.createChart('chartTopClientesVol', {
            type: 'bar',
            data: {
                labels: stats.rankingClientesVolume.map(e => e[0]),
                datasets: [{
                    label: 'Quantidade',
                    data: stats.rankingClientesVolume.map(e => e[1].total),
                    backgroundColor: '#4BC0C0'
                }]
            },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
        });
    },

    renderTopClientesVal(stats) {
        this.createChart('chartTopClientesVal', {
            type: 'bar',
            data: {
                labels: stats.rankingClientesValor.map(e => e[0]),
                datasets: [{
                    label: 'Valor Total (R$)',
                    data: stats.rankingClientesValor.map(e => e[1].valor),
                    backgroundColor: '#FF9F40'
                }]
            },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
        });
    },

    renderEvolucaoMensal(stats) {
        const sortedMonths = Object.keys(stats.porMes).sort();
        this.createChart('chartEvolucao', {
            type: 'line',
            data: {
                labels: sortedMonths.map(Utils.translateMonth),
                datasets: [{
                    label: 'Volume de Cotações',
                    data: sortedMonths.map(m => stats.porMes[m].total),
                    borderColor: CONFIG.colors.secondary,
                    tension: 0.1,
                    fill: true,
                    backgroundColor: 'rgba(0, 72, 108, 0.1)'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    },

    renderValueByMonth(stats) {
        const sortedMonths = Object.keys(stats.porMes).sort();
        this.createChart('chartValorMensal', {
            type: 'bar',
            data: {
                labels: sortedMonths.map(Utils.translateMonth),
                datasets: [{
                    label: 'Valor Cotado (R$)',
                    data: sortedMonths.map(m => stats.porMes[m].valor),
                    backgroundColor: '#28a745'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    },

    renderSLAByResponsavel(stats) {
        const entries = Object.entries(stats.porResponsavel);
        this.createChart('chartSLAResponsavel', {
            type: 'bar',
            data: {
                labels: entries.map(e => e[0]),
                datasets: [{
                    label: 'SLA Médio (Horas)',
                    data: entries.map(e => Analytics.calculateAverage(e[1].temposSLA)),
                    backgroundColor: '#9966FF'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    },

    renderConversionByResponsavel(stats) {
        const entries = Object.entries(stats.porResponsavel);
        this.createChart('chartConversaoResponsavel', {
            type: 'bar',
            data: {
                labels: entries.map(e => e[0]),
                datasets: [{
                    label: 'Taxa de Conversão (%)',
                    data: entries.map(e => (e[1].pedidos / e[1].total) * 100),
                    backgroundColor: '#36A2EB'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    },

    renderHeatmap(stats) {
        const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        this.createChart('chartHeatmap', {
            type: 'polarArea',
            data: {
                labels: dias,
                datasets: [{
                    data: stats.porDiaSemana,
                    backgroundColor: 'rgba(216, 0, 36, 0.5)'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
};
