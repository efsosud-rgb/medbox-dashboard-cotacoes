/**
 * Motor de análise de dados e KPIs
 */
const Analytics = {
    /**
     * Processa os dados brutos e calcula todos os KPIs e métricas
     */
    process(data) {
        if (!data || data.length === 0) return this.getEmptyState();

        const stats = {
            total: data.length,
            respondidas: 0,
            pendentes: 0,
            atrasadas: 0,
            pedidos: 0,
            valorTotal: 0,
            temposResposta: [], // em horas
            temposCotacao: [],   // em horas
            porStatus: {},
            porResponsavel: {},
            porCliente: {},
            porMes: {},
            porDiaSemana: Array(7).fill(0),
            alertas: [],
            cotacoesCriticas: []
        };

        data.forEach(item => {
            // Normalização de dados
            const valor = parseFloat(item.Valor) || 0;
            const status = (item.Status || 'Pendente').trim();
            const responsavel = (item.Responsável || 'Não Atribuído').trim();
            const cliente = (item.Cliente || 'Desconhecido').trim();
            const dataCriacao = item.Data;
            const dataPrimeiraResposta = item['Primeira Resposta'];
            const dataCotacaoEnviada = item['Cotação Enviada'];

            stats.valorTotal += valor;

            // Contagem de status
            stats.porStatus[status] = (stats.porStatus[status] || 0) + 1;
            if (status === 'Pedido') stats.pedidos++;
            if (status === 'Pendente' || status === 'Atrasada') stats.pendentes++;
            if (status === 'Respondida' || status === 'Pedido') stats.respondidas++;
            if (status === 'Atrasada') stats.atrasadas++;

            // Agrupamento por Responsável
            if (!stats.porResponsavel[responsavel]) {
                stats.porResponsavel[responsavel] = { total: 0, pendentes: 0, respondidas: 0, pedidos: 0, temposSLA: [], valor: 0 };
            }
            stats.porResponsavel[responsavel].total++;
            stats.porResponsavel[responsavel].valor += valor;
            if (status === 'Pendente' || status === 'Atrasada') stats.porResponsavel[responsavel].pendentes++;
            if (status === 'Respondida' || status === 'Pedido') stats.porResponsavel[responsavel].respondidas++;
            if (status === 'Pedido') stats.porResponsavel[responsavel].pedidos++;

            // Agrupamento por Cliente
            if (!stats.porCliente[cliente]) {
                stats.porCliente[cliente] = { total: 0, valor: 0 };
            }
            stats.porCliente[cliente].total++;
            stats.porCliente[cliente].valor += valor;

            // SLA e Tempos
            if (dataCriacao) {
                const dt = new Date(dataCriacao);
                if (!isNaN(dt.getTime())) {
                    stats.porDiaSemana[dt.getDay()]++;
                    const mes = Utils.getMonthYear(dataCriacao);
                    if (mes) {
                        if (!stats.porMes[mes]) stats.porMes[mes] = { total: 0, valor: 0 };
                        stats.porMes[mes].total++;
                        stats.porMes[mes].valor += valor;
                    }
                }

                // Tempo até primeira resposta
                if (dataPrimeiraResposta) {
                    const tempo = Utils.diffInHours(dataCriacao, dataPrimeiraResposta);
                    if (tempo !== null) {
                        stats.temposResposta.push(tempo);
                        stats.porResponsavel[responsavel].temposSLA.push(tempo);
                    }
                }

                // Tempo até cotação enviada
                if (dataCotacaoEnviada) {
                    const tempo = Utils.diffInHours(dataCriacao, dataCotacaoEnviada);
                    if (tempo !== null) stats.temposCotacao.push(tempo);
                }

                // Detectar se está atrasado via tempo real se ainda estiver pendente
                if ((status === 'Pendente') && !dataPrimeiraResposta) {
                    const horasPassadas = Utils.diffInHours(dataCriacao, new Date());
                    if (horasPassadas > CONFIG.sla.attentionLimit) {
                        stats.atrasadas++;
                        stats.porResponsavel[responsavel].pendentes++;
                        if (horasPassadas > 24) {
                            stats.cotacoesCriticas.push({
                                cliente, responsavel, valor, horasPassadas,
                                assunto: item.Assunto, data: dataCriacao
                            });
                        }
                    }
                }
            }
        });

        // Cálculos Médios
        stats.mediaResposta = this.calculateAverage(stats.temposResposta);
        stats.mediaCotacao = this.calculateAverage(stats.temposCotacao);
        stats.taxaResposta = (stats.respondidas / stats.total) * 100;
        stats.taxaConversao = (stats.pedidos / stats.total) * 100;
        stats.ticketMedio = stats.valorTotal / stats.total;

        // Rankings e Insights
        stats.rankingClientesVolume = Object.entries(stats.porCliente)
            .sort((a, b) => b[1].total - a[1].total).slice(0, 10);

        stats.rankingClientesValor = Object.entries(stats.porCliente)
            .sort((a, b) => b[1].valor - a[1].valor).slice(0, 10);

        stats.responsavelMaisPendencias = Object.entries(stats.porResponsavel)
            .sort((a, b) => b[1].pendentes - a[1].pendentes)[0];

        this.generateInsights(stats);

        return stats;
    },

    calculateAverage(arr) {
        if (!arr || arr.length === 0) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    },

    generateInsights(stats) {
        if (stats.atrasadas > 0) {
            stats.alertas.push(`Existem ${stats.atrasadas} cotações fora do SLA (Atrasadas).`);
        }
        if (stats.taxaResposta < 80) {
            stats.alertas.push(`A taxa de resposta está baixa (${stats.taxaResposta.toFixed(1)}%). Alvo: > 80%.`);
        }
        if (stats.responsavelMaisPendencias && stats.responsavelMaisPendencias[1].pendentes > 5) {
            stats.alertas.push(`Atenção: ${stats.responsavelMaisPendencias[0]} possui um volume alto de pendências.`);
        }

        // Sugestões
        stats.sugestoes = [];
        if (stats.atrasadas > 5) stats.sugestoes.push("Redistribuir carga de trabalho dos responsáveis sobrecarregados.");
        if (stats.mediaResposta > CONFIG.sla.onTimeLimit) stats.sugestoes.push("Revisar processo de triagem para baixar tempo de 1ª resposta.");
        if (stats.taxaConversao < 10) stats.sugestoes.push("Analisar preços comparativos; taxa de conversão em pedido abaixo da média.");
    },

    getEmptyState() {
        return {
            total: 0, respondidas: 0, pendentes: 0, atrasadas: 0, pedidos: 0,
            valorTotal: 0, mediaResposta: 0, mediaCotacao: 0, taxaResposta: 0,
            taxaConversao: 0, ticketMedio: 0, porStatus: {}, porResponsavel: {},
            porMes: {}, alertas: ["Nenhum dado carregado."], sugestoes: []
        };
    }
};
