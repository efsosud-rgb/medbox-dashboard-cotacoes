/**
 * Coordenação principal da aplicação
 */
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

const App = {
    rawData: [],
    filteredData: [],
    currentStats: {},
    colMap: {},
    sortConfig: { key: null, direction: 'asc' },

    async init() {
        this.bindEvents();
        await this.loadData();
    },

    bindEvents() {
        // Filtros
        document.getElementById('btnFiltrar').addEventListener('click', () => this.applyFilters());
        document.getElementById('btnLimpar').addEventListener('click', () => this.clearFilters());

        // Filtros Rápidos
        document.getElementById('btnPendentes').addEventListener('click', () => this.quickFilter('Pendente'));
        document.getElementById('btnRespondidas').addEventListener('click', () => this.quickFilter('Respondida'));
        document.getElementById('btnPedidos').addEventListener('click', () => this.quickFilter('Pedido'));

        // Busca ao digitar
        document.getElementById('searchGeneral').addEventListener('input', (e) => {
            if (e.target.value.length > 2 || e.target.value.length === 0) {
                this.applyFilters();
            }
        });

        // Ordenação da Tabela
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const key = th.dataset.sort;
                this.setSort(key);
            });
        });
    },

    async loadData() {
        this.showLoading(true);
        try {
            // Tenta carregar da URL configurada
            let response = await fetch(CONFIG.csvUrl);
            if (!response.ok) throw new Error('Falha ao carregar CSV remoto');

            const csvText = await response.text();
            this.parseCSV(csvText);
        } catch (error) {
            console.warn('Usando CSV de fallback devido ao erro:', error);
            try {
                let response = await fetch(CONFIG.fallbackCsvPath);
                const csvText = await response.text();
                this.parseCSV(csvText);
            } catch (fallbackError) {
                console.error('Erro crítico: não foi possível carregar nenhum dado.', fallbackError);
                alert('Erro ao carregar dados. Verifique a conexão ou as configurações.');
            }
        } finally {
            this.showLoading(false);
        }
    },

    parseCSV(csvText) {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                this.rawData = results.data;
                this.detectColumns(results.meta.fields);
                this.filteredData = [...this.rawData];
                this.populateFilterOptions();
                this.updateDashboard();
            }
        });
    },

    detectColumns(headers) {
        const find = (keywords) => {
            return headers.find(h => {
                const norm = h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return keywords.some(k => norm.includes(k));
            }) || '';
        };

        this.colMap = {
            dataRecebimento: find(['data', 'recebimento', 'criado']),
            cliente: find(['cliente', 'empresa', 'hospital', 'clinica']),
            responsavel: find(['responsavel', 'vendedor', 'atendente']),
            status: find(['status', 'fase', 'situacao']),
            valor: find(['valor', 'total', 'preco', 'montante']),
            primeiraResposta: find(['primeira resposta', '1a resposta', 'resp 1']),
            cotacaoEnviada: find(['cotacao enviada', 'envio', 'enviada']),
            pedido: find(['pedido', 'venda', 'n pedido']),
            assunto: find(['assunto', 'titulo', 'item']),
            descricao: find(['descricao', 'obs', 'detalhe'])
        };

        console.log('Colunas detectadas:', this.colMap);
    },

    populateFilterOptions() {
        const responsaveis = [...new Set(this.rawData.map(i => i[this.colMap.responsavel]))].filter(Boolean).sort();
        const clientes = [...new Set(this.rawData.map(i => i[this.colMap.cliente]))].filter(Boolean).sort();
        const status = [...new Set(this.rawData.map(i => i[this.colMap.status]))].filter(Boolean).sort();

        this.fillSelect('filterResponsavel', responsaveis);
        this.fillSelect('filterCliente', clientes);
        this.fillSelect('filterStatus', status);
    },


    setSort(key) {
        if (this.sortConfig.key === key) {
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortConfig.key = key;
            this.sortConfig.direction = 'asc';
        }

        // Atualiza UI dos cabeçalhos
        document.querySelectorAll('.sortable').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.sort === key) {
                th.classList.add(this.sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });

        this.updateDashboard();
    },

    fillSelect(id, options) {
        const select = document.getElementById(id);
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = '<option value="">Todos</option>';
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            select.appendChild(option);
        });
        select.value = currentVal;
    },

    applyFilters() {
        const searchTerm = document.getElementById('searchGeneral').value.toLowerCase();
        const dateStart = document.getElementById('filterDateStart').value;
        const dateEnd = document.getElementById('filterDateEnd').value;
        const responsavel = document.getElementById('filterResponsavel').value;
        const cliente = document.getElementById('filterCliente').value;
        const status = document.getElementById('filterStatus').value;
        const sla = document.getElementById('filterSLA').value;

        this.filteredData = this.rawData.filter(item => {
            const matchSearch = !searchTerm ||
                Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm));

            const matchResponsavel = !responsavel || item[this.colMap.responsavel] === responsavel;
            const matchCliente = !cliente || item[this.colMap.cliente] === cliente;
            const matchStatus = !status || item[this.colMap.status] === status;

            let matchDate = true;
            if (dateStart || dateEnd) {
                const itemDate = Utils.parseDate(item[this.colMap.dataRecebimento]);
                if (!itemDate) {
                    matchDate = false;
                } else {
                    if (dateStart && itemDate < new Date(dateStart)) matchDate = false;
                    if (dateEnd) {
                        const end = new Date(dateEnd);
                        end.setHours(23, 59, 59);
                        if (itemDate > end) matchDate = false;
                    }
                }
            }

            let matchSLA = true;
            if (sla) {
                const itemSLA = this.calculateSLAStatus(item);
                if (itemSLA !== sla) matchSLA = false;
            }

            return matchSearch && matchResponsavel && matchCliente && matchStatus && matchDate && matchSLA;
        });

        this.updateDashboard();
    },

    quickFilter(status) {
        document.getElementById('filterStatus').value = status;
        this.applyFilters();
    },

    clearFilters() {
        document.getElementById('filterForm').reset();
        this.filteredData = [...this.rawData];
        this.updateDashboard();
    },

    updateDashboard() {
        this.applySort();
        this.currentStats = Analytics.process(this.filteredData, this.colMap);
        this.renderKPIs();
        Charts.renderAll(this.currentStats);
        this.renderTable();
        this.renderInsights();
        this.renderProgressBars();
        this.updateSLATrafficLight();
    },

    renderKPIs() {
        document.getElementById('kpiTotal').textContent = this.currentStats.total;
        document.getElementById('kpiRespondidas').textContent = this.currentStats.respondidas;
        document.getElementById('kpiPendentes').textContent = this.currentStats.pendentes;
        document.getElementById('kpiAtrasadas').textContent = this.currentStats.atrasadas;
        document.getElementById('kpiValorTotal').textContent = Utils.formatCurrency(this.currentStats.valorTotal);
        document.getElementById('kpiTicketMedio').textContent = Utils.formatCurrency(this.currentStats.ticketMedio);
        document.getElementById('kpiTaxaResposta').textContent = this.currentStats.taxaResposta.toFixed(1) + '%';
        document.getElementById('kpiTaxaConversao').textContent = this.currentStats.taxaConversao.toFixed(1) + '%';
        document.getElementById('kpiMediaResposta').textContent = this.currentStats.mediaResposta.toFixed(1) + 'h';
        document.getElementById('kpiMediaCotacao').textContent = this.currentStats.mediaCotacao.toFixed(1) + 'h';

        const topCli = this.currentStats.rankingClientesVolume[0];
        document.getElementById('kpiTopCliente').textContent = topCli ? topCli[0] : '-';

        const topPend = this.currentStats.responsavelMaisPendencias;
        document.getElementById('kpiTopPendencias').textContent = topPend ? topPend[0] : '-';
    },

    applySort() {
        if (!this.sortConfig.key) return;

        const key = this.sortConfig.key;
        const dir = this.sortConfig.direction === 'asc' ? 1 : -1;

        this.filteredData.sort((a, b) => {
            let valA, valB;

            switch(key) {
                case 'data':
                    valA = Utils.parseDate(a[this.colMap.dataRecebimento]) || new Date(0);
                    valB = Utils.parseDate(b[this.colMap.dataRecebimento]) || new Date(0);
                    break;
                case 'cliente':
                    valA = (a[this.colMap.cliente] || '').toLowerCase();
                    valB = (b[this.colMap.cliente] || '').toLowerCase();
                    break;
                case 'status':
                    valA = (a[this.colMap.status] || '').toLowerCase();
                    valB = (b[this.colMap.status] || '').toLowerCase();
                    break;
                case 'responsavel':
                    valA = (a[this.colMap.responsavel] || '').toLowerCase();
                    valB = (b[this.colMap.responsavel] || '').toLowerCase();
                    break;
                case 'valor':
                    valA = Utils.parseCurrency(a[this.colMap.valor]);
                    valB = Utils.parseCurrency(b[this.colMap.valor]);
                    break;
                case 'sla':
                    const slaPriority = { 'ATRASADO': 3, 'ATENÇÃO': 2, 'NO PRAZO': 1, 'N/A': 0 };
                    valA = slaPriority[this.calculateSLAStatus(a)] || 0;
                    valB = slaPriority[this.calculateSLAStatus(b)] || 0;
                    break;
                default:
                    valA = a[key];
                    valB = b[key];
            }

            if (valA < valB) return -1 * dir;
            if (valA > valB) return 1 * dir;
            return 0;
        });
    },

    renderTable() {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        // Limite de renderização para performance
        const displayData = this.filteredData.slice(0, CONFIG.table.rowsPerPage);

        displayData.forEach(item => {
            const tr = document.createElement('tr');
            const slaStatus = this.calculateSLAStatus(item);
            const slaClass = this.getSLAClass(slaStatus);

            const rowData = [
                Utils.formatDate(item[this.colMap.dataRecebimento]),
                Utils.escapeHTML(item[this.colMap.cliente]),
                `<span class="badge badge-status">${Utils.escapeHTML(item[this.colMap.status])}</span>`,
                Utils.escapeHTML(item[this.colMap.responsavel]),
                Utils.formatCurrency(Utils.parseCurrency(item[this.colMap.valor])),
                `<span class="badge ${slaClass}">${slaStatus}</span>`,
                Utils.escapeHTML(item[this.colMap.assunto])
            ];

            tr.innerHTML = rowData.map(d => `<td>${d}</td>`).join('');
            tbody.appendChild(tr);
        });

        document.getElementById('filteredCount').textContent = this.filteredData.length;
    },

    calculateSLAStatus(item) {
        const status = item[this.colMap.status];
        const data = item[this.colMap.dataRecebimento];
        const resp = item[this.colMap.primeiraResposta];

        if (status === 'Respondida' || status === 'Pedido') {
            const horas = Utils.diffInHours(data, resp);
            if (horas === null) return 'N/A';
            if (horas <= CONFIG.sla.onTimeLimit) return 'NO PRAZO';
            if (horas <= CONFIG.sla.attentionLimit) return 'ATENÇÃO';
            return 'ATRASADO';
        }

        // Para pendentes, calcula baseado no tempo atual
        const horasPassadas = Utils.diffInHours(data, new Date());
        if (horasPassadas <= CONFIG.sla.onTimeLimit) return 'NO PRAZO';
        if (horasPassadas <= CONFIG.sla.attentionLimit) return 'ATENÇÃO';
        return 'ATRASADO';
    },

    getSLAClass(status) {
        switch(status) {
            case 'NO PRAZO': return 'bg-success';
            case 'ATENÇÃO': return 'bg-warning';
            case 'ATRASADO': return 'bg-danger';
            default: return 'bg-secondary';
        }
    },

    renderInsights() {
        const alertsDiv = document.getElementById('insightAlerts');
        const suggestDiv = document.getElementById('insightSuggestions');
        const criticalDiv = document.getElementById('insightCritical');

        alertsDiv.innerHTML = this.currentStats.alertas.map(a => `<div class="alert-item text-danger">⚠️ ${a}</div>`).join('');
        suggestDiv.innerHTML = this.currentStats.sugestoes.map(s => `<div class="alert-item text-info">💡 ${s}</div>`).join('');

        criticalDiv.innerHTML = this.currentStats.cotacoesCriticas.slice(0, 5).map(c => `
            <div class="critical-item">
                <strong>${Utils.escapeHTML(c.cliente)}</strong> - ${Utils.formatCurrency(c.valor)}<br>
                <small>${Utils.escapeHTML(c.responsavel)} | ${c.horasPassadas.toFixed(0)}h aguardando</small>
            </div>
        `).join('') || '<p>Nenhuma cotação crítica detectada.</p>';
    },

    renderProgressBars() {
        const container = document.getElementById('progressBarsContainer');
        container.innerHTML = '';

        Object.entries(this.currentStats.porResponsavel).forEach(([name, data]) => {
            const percent = (data.respondidas / data.total) * 100 || 0;
            const div = document.createElement('div');
            div.className = 'mb-3';
            div.innerHTML = `
                <div class="d-flex justify-content-between mb-1">
                    <span>${Utils.escapeHTML(name)}</span>
                    <span>${data.respondidas}/${data.total} (${percent.toFixed(0)}%)</span>
                </div>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${percent}%; background-color: ${CONFIG.colors.secondary}"></div>
                </div>
            `;
            container.appendChild(div);
        });
    },

    updateSLATrafficLight() {
        const light = document.getElementById('slaTrafficLight');
        const statusText = document.getElementById('slaTrafficStatus');

        const ratioAtrasadas = (this.currentStats.atrasadas / this.currentStats.total) * 100;

        light.className = 'traffic-light';
        if (ratioAtrasadas < 5) {
            light.classList.add('light-green');
            statusText.textContent = 'Operação Saudável';
        } else if (ratioAtrasadas < 15) {
            light.classList.add('light-yellow');
            statusText.textContent = 'Atenção Necessária';
        } else {
            light.classList.add('light-red');
            statusText.textContent = 'Crítico: Gargalo Identificado';
        }
    },

    showLoading(show) {
        document.getElementById('loader').style.display = show ? 'flex' : 'none';
    }
};
