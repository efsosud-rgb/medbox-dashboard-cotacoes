# MedBox - Dashboard de Cotações

Dashboard profissional para gestão e análise de respostas às cotações recebidas da MedBox.

## 🚀 Visão Geral

Este projeto é um dashboard executivo desenvolvido para monitorar o desempenho da equipe de vendas no tratamento de cotações. Ele permite visualizar KPIs críticos, gargalos operacionais e a eficiência do SLA (Service Level Agreement).

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3**: Estrutura e estilização (Design System ERP).
- **JavaScript (Pure JS)**: Lógica de negócios e manipulação de dados.
- **[Chart.js](https://www.chartjs.org/)**: Visualização de dados e gráficos interativos.
- **[PapaParse](https://www.papaparse.com/)**: Processamento eficiente de arquivos CSV.
- **[Google Fonts](https://fonts.google.com/)**: Tipografia (Inter).

## 📊 Funcionalidades Principais

- **Mapeamento Inteligente de Colunas**: Detecta automaticamente as colunas do CSV (Data, Cliente, Responsável, Status, Valor, etc) com base em palavras-chave, permitindo flexibilidade no formato do arquivo original.
- **KPIs em Tempo Real**:
    - Total de cotações, respondidas, pendentes e atrasadas.
    - Taxas de resposta e conversão em pedido.
    - Valor total cotado e ticket médio.
    - Identificação automática do maior cliente e responsável com mais pendências.
- **Gráficos Avançados**:
    - Funil de vendas (Recebidas -> Respondidas -> Pedidos).
    - Distribuição por status e responsável.
    - Evolução mensal de volume e valores.
    - Heatmap de demanda por dia da semana.
    - SLA e Conversão por responsável.
- **Filtros Dinâmicos**: Busca global, período, cliente, responsável, status e filtros rápidos (Somente Pendentes, Respondidas ou Pedidos).
- **Análises Inteligentes**: Seção dedicada a alertas automáticos, sugestões de ação e identificação de cotações críticas.
- **Tabela Analítica**: Listagem detalhada com ordenação interativa e indicadores visuais de SLA (Verde: No Prazo, Amarelo: Atenção, Vermelho: Atrasado).

## ⚙️ Configuração

As configurações principais do dashboard podem ser ajustadas em `assets/js/config.js`:

- **URL do CSV**: Link para a planilha Google ou servidor de dados.
- **SLA**: Limites de tempo (horas) para os status "No Prazo", "Atenção" e "Atrasado".
- **Fallback**: Se a URL principal falhar, o sistema carrega automaticamente `data/exemplo-cotacoes.csv`.

## 📂 Estrutura do Projeto

```text
├── index.html              # Estrutura principal do Dashboard
├── README.md               # Documentação
├── assets/
│   ├── css/
│   │   └── style.css       # Estilização profissional e responsiva
│   └── js/
│       ├── config.js       # Parâmetros e configurações de SLA/URL
│       ├── utils.js        # Utilitários de parsing (Data/Moeda) e DOM
│       ├── charts.js       # Configurações de gráficos Chart.js
│       ├── analytics.js    # Lógica de cálculo de KPIs e alertas
│       └── app.js          # Orquestração de dados e UI
└── data/
    └── exemplo-cotacoes.csv # Dados de exemplo para demonstração
```

## 📝 Como Usar

1. Clone o repositório.
2. Abra o arquivo `index.html` em qualquer navegador moderno.
3. Para usar seus próprios dados, aponte a `CSV_URL` em `assets/js/config.js` para o link de exportação do seu CSV ou substitua o arquivo `data/exemplo-cotacoes.csv`.

**Dica para Google Sheets:** Use a opção "Publicar na Web" -> "Valores separados por vírgula (.csv)" e cole o link gerado no `config.js`.

## ⚖️ Licença

Este projeto é de uso interno da MedBox.
