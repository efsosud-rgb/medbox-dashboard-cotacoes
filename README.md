# MedBox Dashboard | Gestão de Cotações

Dashboard profissional para gestão de respostas às cotações recebidas da MedBox.

## 🚀 Funcionalidades

- **KPIs em Tempo Real**: Total de cotações, respondidas, pendentes, atrasadas, valor total, ticket médio e taxa de conversão.
- **Filtros Avançados**: Busca geral, período, cliente, responsável, status, SLA e filtros rápidos (somente pendentes/pedidos).
- **Gráficos Interativos**: Funil de status, distribuição por responsável, evolução mensal, SLA e conversão.
- **Análises Inteligentes**: Alertas automáticos sobre cotações críticas, gargalos de SLA e maiores volumes.
- **Tabela Analítica**: Detalhamento completo das cotações com destaque visual de SLA.

## 🛠️ Tecnologias Utilizadas

- **HTML5, CSS3, JavaScript (ES6+)**
- **Chart.js**: Para visualização de dados.
- **PapaParse**: Para leitura e processamento de arquivos CSV.
- **Google Sheets**: Como fonte de dados remota.

## 📁 Estrutura do Projeto

```text
.
├── index.html              # Página principal do dashboard
├── README.md               # Documentação
├── assets/
│   ├── css/
│   │   └── style.css       # Estilização (Identidade MedBox)
│   └── js/
│       ├── config.js       # Configurações de URLs e SLA
│       ├── utils.js        # Utilitários de formatação e datas
│       ├── charts.js       # Lógica dos gráficos (Chart.js)
│       ├── analytics.js    # Processamento de dados e KPIs
│       └── app.js          # Coordenação principal da aplicação
└── data/
    └── exemplo-cotacoes.csv # Dados de fallback/exemplo
```

## ⚙️ Configuração

Para alterar a fonte de dados ou os limites de SLA, edite o arquivo `assets/js/config.js`:

```javascript
const CONFIG = {
    csvUrl: 'SUA_URL_DO_CSV_AQUI',
    sla: {
        onTimeLimit: 2, // Horas para "No Prazo"
        attentionLimit: 6, // Horas para "Atenção"
    }
};
```

## 🖥️ Como Executar

1. Clone o repositório.
2. Certifique-se de que os arquivos estão em um ambiente onde o JavaScript pode ser executado (navegador moderno).
3. Devido a restrições de CORS ao carregar arquivos locais via JavaScript, recomenda-se usar um servidor local (ex: VS Code Live Server, `npx serve`, etc.).
4. O dashboard tentará carregar o CSV da URL configurada. Se falhar, carregará automaticamente os dados de exemplo em `data/exemplo-cotacoes.csv`.

## 🎨 Identidade Visual

O projeto segue rigorosamente as cores da MedBox:
- **Vermelho**: #D80024
- **Azul Marinho**: #00486C
- **Fundo**: #F4F6F8

---
Desenvolvido para gestão executiva e otimização da operação comercial.
