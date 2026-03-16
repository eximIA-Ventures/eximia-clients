export interface ClauseSeed {
  clause_id: string;
  title: string;
  category: string;
  body: string;
  risk_level: "low" | "medium" | "high" | "critical";
  applicable_to: string[];
  is_required: boolean;
  version: string;
}

export const CLAUSES_SEED: ClauseSeed[] = [
  {
    clause_id: "CL-ESCOPO-001",
    title: "Objeto e Escopo",
    category: "escopo",
    body: `CLÁUSULA PRIMEIRA — DO OBJETO

O presente instrumento tem por objeto a prestação de serviços de {servico.descricao} pela CONTRATADA ({contratada.razaoSocial}, inscrita no CNPJ sob o nº {contratada.cnpj}, com sede em {contratada.endereco}) à CONTRATANTE ({contratante.razaoSocial}, inscrita no CNPJ sob o nº {contratante.cnpj}, com sede em {contratante.endereco}), conforme especificações técnicas detalhadas no Anexo I — Escopo de Serviços.

Parágrafo Primeiro. O escopo dos serviços compreende exclusivamente as atividades descritas no Anexo I, não se incluindo quaisquer serviços ou entregas não expressamente mencionados.

Parágrafo Segundo. Alterações no escopo deverão ser formalizadas por meio de aditivo contratual assinado por ambas as Partes, com definição clara de impacto em prazo e valores.

Parágrafo Terceiro. A CONTRATADA executará os serviços com autonomia técnica, sem subordinação hierárquica à CONTRATANTE, utilizando seus próprios métodos, ferramentas e processos de trabalho.`,
    risk_level: "high",
    applicable_to: ["consultoria", "desenvolvimento", "saas", "suporte", "nda", "dpa"],
    is_required: true,
    version: "1.0.0",
  },
  {
    clause_id: "CL-PRAZO-001",
    title: "Prazo e Vigência",
    category: "prazo",
    body: `CLÁUSULA SEGUNDA — DO PRAZO E DA VIGÊNCIA

O presente contrato terá vigência de {contrato.vigenciaMeses} ({contrato.vigenciaMesesExtenso}) meses, com início em {contrato.dataInicio} e término previsto em {contrato.dataFim}, podendo ser renovado por iguais períodos mediante acordo expresso das Partes, formalizado por escrito com antecedência mínima de 30 (trinta) dias do término vigente.

Parágrafo Primeiro. O prazo de execução dos serviços descritos no Anexo I é de {servico.prazoExecucao}, contado a partir da data de assinatura deste instrumento e do recebimento do sinal previsto na Cláusula de Pagamento.

Parágrafo Segundo. Eventuais atrasos decorrentes de pendências da CONTRATANTE — incluindo, mas não se limitando a, aprovações, fornecimento de acessos, credenciais e informações técnicas — não serão imputáveis à CONTRATADA e poderão ensejar revisão justificada dos prazos acordados.

Parágrafo Terceiro. A não manifestação de qualquer das Partes com antecedência de 30 (trinta) dias do término vigente importará na renovação automática do contrato por período idêntico, mantidas as mesmas condições.`,
    risk_level: "medium",
    applicable_to: ["consultoria", "desenvolvimento", "saas", "suporte", "nda", "dpa"],
    is_required: true,
    version: "1.0.0",
  },
  {
    clause_id: "CL-PAGAMENTO-001",
    title: "Condições de Pagamento",
    category: "pagamento",
    body: `CLÁUSULA TERCEIRA — DAS CONDIÇÕES DE PAGAMENTO

Pelos serviços descritos na Cláusula Primeira, a CONTRATANTE pagará à CONTRATADA o valor total de R$ {contrato.valorTotal} ({contrato.valorTotalExtenso}), nas seguintes condições:

I. Valor mensal: R$ {contrato.valorMensal} ({contrato.valorMensalExtenso}), com vencimento no dia {contrato.diaVencimento} de cada mês subsequente ao da prestação dos serviços;

II. Sinal de início: R$ {contrato.valorSinal} ({contrato.valorSinalExtenso}), a ser pago até {contrato.dataPagamentoSinal}, condição para o início efetivo dos trabalhos;

III. Forma de pagamento: transferência bancária (PIX ou TED) para a conta indicada pela CONTRATADA.

Parágrafo Primeiro. O atraso no pagamento de qualquer parcela implicará a incidência de multa moratória de 2% (dois por cento) sobre o valor em atraso, acrescido de juros de 1% (um por cento) ao mês, calculados pro rata die, além de correção monetária pelo IPCA/IBGE.

Parágrafo Segundo. O atraso superior a 15 (quinze) dias corridos facultará à CONTRATADA a suspensão imediata da execução dos serviços, sem prejuízo da cobrança dos valores devidos, não configurando tal suspensão qualquer forma de inadimplemento por parte da CONTRATADA.

Parágrafo Terceiro. Os valores estabelecidos neste contrato serão reajustados anualmente, na data-base de aniversário do contrato, pela variação acumulada do IPCA/IBGE ou, na sua falta, pelo índice que vier a substituí-lo oficialmente.`,
    risk_level: "critical",
    applicable_to: ["consultoria", "desenvolvimento", "saas", "suporte"],
    is_required: true,
    version: "1.0.0",
  },
  {
    clause_id: "CL-CONFIDENCIALIDADE-001",
    title: "Confidencialidade e NDA",
    category: "confidencialidade",
    body: `CLÁUSULA QUARTA — DA CONFIDENCIALIDADE

As Partes obrigam-se a manter em absoluto sigilo e confidencialidade todas as informações técnicas, comerciais, financeiras, estratégicas e operacionais obtidas em razão deste contrato ("Informações Confidenciais"), comprometendo-se a não divulgar, reproduzir, utilizar ou dar conhecimento a terceiros, direta ou indiretamente, sob qualquer forma.

Parágrafo Primeiro. São consideradas Informações Confidenciais, sem limitação: dados de clientes, estratégias de negócio, códigos-fonte, documentação técnica, metodologias proprietárias, bases de dados, planos de produto, informações financeiras e quaisquer dados marcados como confidenciais ou que, pela sua natureza, assim devam ser tratados.

Parágrafo Segundo. As obrigações de confidencialidade não se aplicam a informações que: (i) sejam ou se tornem de domínio público sem culpa da Parte receptora; (ii) já eram conhecidas pela Parte receptora antes da divulgação, comprovadamente; (iii) sejam obtidas legitimamente de terceiros sem restrição de divulgação; (iv) devam ser divulgadas por determinação legal ou judicial, sendo a Parte reveladora notificada previamente quando possível.

Parágrafo Terceiro. A obrigação de confidencialidade perdurará pelo prazo de {contrato.prazoConfidencialidadeAnos} ({contrato.prazoConfidencialidadeAnosExtenso}) anos após o encerramento deste contrato, independentemente do motivo da rescisão.

Parágrafo Quarto. O descumprimento desta cláusula sujeitará a Parte infratora ao pagamento de multa no valor de R$ {contrato.multaConfidencialidade}, sem prejuízo de indenização por perdas e danos efetivamente comprovados.`,
    risk_level: "critical",
    applicable_to: ["consultoria", "desenvolvimento", "saas", "suporte", "nda", "dpa"],
    is_required: true,
    version: "1.0.0",
  },
  {
    clause_id: "CL-PI-001",
    title: "Propriedade Intelectual",
    category: "pi",
    body: `CLÁUSULA QUINTA — DA PROPRIEDADE INTELECTUAL

Todos os direitos de propriedade intelectual sobre os deliverables, códigos-fonte, layouts, documentação técnica e demais materiais desenvolvidos especificamente para a CONTRATANTE no âmbito deste contrato serão transferidos à CONTRATANTE após a quitação integral dos valores pactuados.

Parágrafo Primeiro. Ficam excluídos da transferência: (i) ferramentas, bibliotecas, frameworks, componentes e módulos preexistentes de propriedade da CONTRATADA ("Tecnologia Própria"), os quais permanecerão de titularidade exclusiva da CONTRATADA; (ii) componentes open-source utilizados no desenvolvimento, que permanecerão regidos por suas respectivas licenças.

Parágrafo Segundo. Sobre a Tecnologia Própria eventualmente incorporada nos deliverables, a CONTRATADA concede à CONTRATANTE licença perpétua, irrevogável, não exclusiva e intransferível de uso, exclusivamente para operação dos sistemas e produtos objeto deste contrato.

Parágrafo Terceiro. A CONTRATANTE não poderá sublicenciar, decompilar, fazer engenharia reversa ou utilizar a Tecnologia Própria da CONTRATADA para fins diversos dos previstos neste contrato, salvo autorização expressa por escrito.

Parágrafo Quarto. Até a quitação integral de todos os valores devidos, os direitos de propriedade intelectual sobre os deliverables permanecerão em titularidade da CONTRATADA, a título de garantia.`,
    risk_level: "critical",
    applicable_to: ["desenvolvimento", "saas"],
    is_required: true,
    version: "1.0.0",
  },
  {
    clause_id: "CL-LGPD-001",
    title: "Proteção de Dados Pessoais — LGPD",
    category: "lgpd",
    body: `CLÁUSULA SEXTA — DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)

As Partes declaram ciência e comprometem-se a cumprir integralmente a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais — LGPD) e demais regulamentações aplicáveis à proteção de dados pessoais.

Parágrafo Primeiro. Para fins desta cláusula, a CONTRATANTE atua como CONTROLADORA dos dados pessoais e a CONTRATADA como OPERADORA, realizando o tratamento de dados pessoais exclusivamente conforme instruções documentadas da CONTRATANTE e para as finalidades previstas neste contrato.

Parágrafo Segundo. A CONTRATADA se obriga a: (i) tratar dados pessoais apenas conforme instruções da CONTRATANTE; (ii) garantir que seus colaboradores e subcontratados estejam sujeitos a obrigações de confidencialidade; (iii) implementar medidas técnicas e organizacionais de segurança adequadas, incluindo criptografia em trânsito e em repouso; (iv) auxiliar a CONTRATANTE no atendimento às solicitações dos titulares de dados; (v) notificar a CONTRATANTE em até 48 (quarenta e oito) horas sobre qualquer incidente de segurança que envolva dados pessoais tratados no âmbito deste contrato.

Parágrafo Terceiro. A CONTRATADA não realizará transferência internacional de dados pessoais sem autorização prévia e expressa da CONTRATANTE, observados os mecanismos de adequação previstos na LGPD.

Parágrafo Quarto. Ao término da vigência contratual, a CONTRATADA deverá, a critério da CONTRATANTE, devolver ou eliminar de forma segura todos os dados pessoais tratados, no prazo de até 30 (trinta) dias, certificando por escrito a eliminação realizada.

Parágrafo Quinto. As Partes respondem solidariamente perante os titulares dos dados e a Autoridade Nacional de Proteção de Dados (ANPD) pelos danos causados em virtude do descumprimento das obrigações previstas na LGPD.`,
    risk_level: "critical",
    applicable_to: ["consultoria", "desenvolvimento", "saas", "suporte", "dpa"],
    is_required: true,
    version: "1.0.0",
  },
  {
    clause_id: "CL-SLA-001",
    title: "Nível de Serviço — SLA",
    category: "sla",
    body: `CLÁUSULA SÉTIMA — DO NÍVEL DE SERVIÇO (SLA)

A CONTRATADA compromete-se a manter a disponibilidade dos serviços em conformidade com os seguintes níveis de serviço:

I. Disponibilidade mínima mensal: {sla.disponibilidade} ({sla.disponibilidadeExtenso}), calculada sobre o período total do mês, excluídas as janelas de manutenção programada;

II. Tempo máximo de resposta para incidentes críticos (Severidade 1 — serviço indisponível): {sla.tempoRespostaCritico};

III. Tempo máximo de resposta para incidentes graves (Severidade 2 — funcionalidade essencial comprometida): {sla.tempoRespostaGrave};

IV. Tempo máximo de resposta para incidentes moderados (Severidade 3 — funcionalidade não essencial comprometida): {sla.tempoRespostaModerado};

V. Janelas de manutenção programada: {sla.janelasManutencao}, com notificação prévia de 48 (quarenta e oito) horas.

Parágrafo Primeiro. Caso a disponibilidade mensal fique abaixo do nível contratado, a CONTRATANTE terá direito a crédito proporcional sobre o valor mensal, conforme a seguinte tabela: (a) disponibilidade entre {sla.faixa1Min} e {sla.faixa1Max}: crédito de {sla.credito1}; (b) disponibilidade abaixo de {sla.faixa2Min}: crédito de {sla.credito2}.

Parágrafo Segundo. O monitoramento da disponibilidade será realizado pela CONTRATADA por meio de ferramentas automatizadas, cujos relatórios mensais serão disponibilizados à CONTRATANTE.

Parágrafo Terceiro. Não serão contabilizadas no cálculo de disponibilidade as indisponibilidades decorrentes de: (i) caso fortuito ou força maior; (ii) falhas em serviços de terceiros (provedores de infraestrutura, DNS, etc.); (iii) manutenção programada dentro das janelas acordadas; (iv) ações ou omissões da própria CONTRATANTE.`,
    risk_level: "high",
    applicable_to: ["saas", "suporte"],
    is_required: true,
    version: "1.0.0",
  },
  {
    clause_id: "CL-RESPONSABILIDADE-001",
    title: "Limitação de Responsabilidade",
    category: "responsabilidade",
    body: `CLÁUSULA OITAVA — DA LIMITAÇÃO DE RESPONSABILIDADE

A responsabilidade total e agregada da CONTRATADA sob este contrato, independentemente da forma da ação (contratual, extracontratual, negligência ou outra), estará limitada ao valor total efetivamente pago pela CONTRATANTE nos {contrato.periodoLimitacaoMeses} ({contrato.periodoLimitacaoMesesExtenso}) meses anteriores ao evento que der causa à responsabilização.

Parágrafo Primeiro. Em nenhuma hipótese qualquer das Partes será responsável perante a outra por danos indiretos, incidentais, consequenciais, punitivos ou especiais, incluindo, sem limitação: lucros cessantes, perda de receita, perda de dados, interrupção de negócios ou danos à reputação, ainda que tenha sido advertida da possibilidade de tais danos.

Parágrafo Segundo. As limitações previstas nesta cláusula não se aplicam: (i) a obrigações de indenização decorrentes de violação de propriedade intelectual de terceiros; (ii) a obrigações decorrentes da cláusula de confidencialidade; (iii) a atos de dolo ou má-fé; (iv) a obrigações de pagamento dos valores devidos sob este contrato.

Parágrafo Terceiro. A CONTRATADA não será responsável por falhas, atrasos ou impossibilidade de prestação dos serviços decorrentes de atos ou omissões da CONTRATANTE, incluindo: atraso no fornecimento de informações, acessos e aprovações; alterações de escopo não formalizadas; e indisponibilidade de interlocutores designados.`,
    risk_level: "high",
    applicable_to: ["consultoria", "desenvolvimento", "saas", "suporte"],
    is_required: false,
    version: "1.0.0",
  },
  {
    clause_id: "CL-RESCISAO-001",
    title: "Rescisão Contratual",
    category: "rescisao",
    body: `CLÁUSULA NONA — DA RESCISÃO

O presente contrato poderá ser rescindido nas seguintes hipóteses:

I. Por acordo mútuo das Partes, mediante termo de distrato assinado por ambas;

II. Por qualquer das Partes, sem justa causa, mediante notificação escrita à outra Parte com antecedência mínima de {contrato.prazoNotificacaoRescisao} ({contrato.prazoNotificacaoRescisaoExtenso}) dias corridos;

III. De pleno direito, por qualquer das Partes, em caso de descumprimento de obrigação material por parte da outra Parte, desde que a Parte inadimplente seja notificada e não sane o inadimplemento no prazo de 15 (quinze) dias corridos;

IV. De pleno direito, em caso de decretação de falência, recuperação judicial ou extrajudicial, liquidação ou dissolução de qualquer das Partes.

Parágrafo Primeiro. Em caso de rescisão sem justa causa pela CONTRATANTE, esta deverá pagar à CONTRATADA: (i) todos os valores devidos pelos serviços já prestados até a data de rescisão; (ii) multa rescisória de {contrato.multaRescisoria} sobre o valor remanescente do contrato.

Parágrafo Segundo. Em caso de rescisão sem justa causa pela CONTRATADA, esta deverá concluir os serviços em andamento no prazo de {contrato.prazoTransicao} ({contrato.prazoTransicaoExtenso}) dias e realizar a transição adequada do conhecimento à CONTRATANTE ou a terceiro por ela indicado.

Parágrafo Terceiro. A rescisão do contrato não afetará as obrigações de confidencialidade, proteção de dados e propriedade intelectual, que permanecerão vigentes pelos prazos previstos em suas respectivas cláusulas.`,
    risk_level: "high",
    applicable_to: ["consultoria", "desenvolvimento", "saas", "suporte", "nda", "dpa"],
    is_required: true,
    version: "1.0.0",
  },
  {
    clause_id: "CL-FORO-001",
    title: "Foro e Resolução de Disputas",
    category: "foro",
    body: `CLÁUSULA DÉCIMA — DO FORO E DA RESOLUÇÃO DE DISPUTAS

As Partes elegem o foro da comarca de {contrato.foro}, Estado de {contrato.estado}, como competente para dirimir quaisquer questões oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

Parágrafo Primeiro. Antes de submeter qualquer controvérsia ao Poder Judiciário, as Partes comprometem-se a empreender esforços de boa-fé para resolvê-la por meio de negociação direta, no prazo de 30 (trinta) dias contados da notificação escrita da controvérsia.

Parágrafo Segundo. Não sendo possível a resolução por negociação direta, as Partes poderão, de comum acordo, submeter a controvérsia à mediação, nos termos da Lei nº 13.140/2015, a ser conduzida por mediador indicado pela Câmara de Mediação e Arbitragem de {contrato.foro}.

Parágrafo Terceiro. O presente contrato é regido pelas leis da República Federativa do Brasil.

E por estarem assim justas e contratadas, as Partes firmam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença de 2 (duas) testemunhas.

{contrato.foro}, {contrato.dataAssinatura}.

___________________________
{contratante.razaoSocial}
{contratante.representante}
CPF: {contratante.representanteCpf}

___________________________
{contratada.razaoSocial}
{contratada.representante}
CPF: {contratada.representanteCpf}

Testemunhas:
1. _________________________ CPF: _________________
2. _________________________ CPF: _________________`,
    risk_level: "medium",
    applicable_to: ["consultoria", "desenvolvimento", "saas", "suporte", "nda", "dpa"],
    is_required: true,
    version: "1.0.0",
  },
  {
    clause_id: "CL-ANTICORRUPCAO-001",
    title: "Compliance e Anticorrupção",
    category: "anticorrupcao",
    body: `CLÁUSULA — DO COMPLIANCE E ANTICORRUPÇÃO

As Partes declaram conhecer e comprometem-se a cumprir, em todas as suas atividades relacionadas a este contrato, as disposições da Lei nº 12.846/2013 (Lei Anticorrupção), do Decreto nº 11.129/2022, da Lei nº 14.133/2021 e demais legislações anticorrupção aplicáveis.

Parágrafo Primeiro. As Partes obrigam-se a: (i) não prometer, oferecer ou dar, direta ou indiretamente, vantagem indevida a agente público ou a terceiro a ele relacionado; (ii) não financiar, custear, patrocinar ou de qualquer modo subvencionar a prática de atos ilícitos previstos na legislação anticorrupção; (iii) não utilizar interposta pessoa para ocultar ou dissimular seus reais interesses ou a identidade dos beneficiários dos atos praticados; (iv) conduzir seus negócios de forma ética e transparente.

Parágrafo Segundo. Caso qualquer das Partes tome conhecimento de atos ou práticas que possam constituir violação à legislação anticorrupção, deverá notificar imediatamente a outra Parte por escrito.

Parágrafo Terceiro. A comprovação de violação desta cláusula constituirá motivo para rescisão imediata deste contrato, sem necessidade de notificação prévia, sem prejuízo das medidas judiciais e indenizatórias cabíveis.`,
    risk_level: "medium",
    applicable_to: ["consultoria", "desenvolvimento", "saas", "suporte", "nda", "dpa"],
    is_required: false,
    version: "1.0.0",
  },
  {
    clause_id: "CL-FORCAMAIOR-001",
    title: "Força Maior e Caso Fortuito",
    category: "forcamaior",
    body: `CLÁUSULA — DA FORÇA MAIOR E CASO FORTUITO

Nenhuma das Partes será responsável pelo descumprimento de suas obrigações contratuais quando tal descumprimento resultar de evento de força maior ou caso fortuito, conforme definido no artigo 393 do Código Civil Brasileiro.

Parágrafo Primeiro. Consideram-se eventos de força maior ou caso fortuito, de forma exemplificativa e não exaustiva: catástrofes naturais, epidemias, pandemias, guerras, atos terroristas, greves gerais, interrupção generalizada de serviços de telecomunicações ou energia elétrica, e atos governamentais que impeçam ou restrinjam significativamente a execução dos serviços.

Parágrafo Segundo. A Parte afetada pelo evento de força maior ou caso fortuito deverá: (i) notificar a outra Parte por escrito no prazo de 5 (cinco) dias úteis da ocorrência do evento, descrevendo sua natureza e os impactos estimados; (ii) empreender todos os esforços razoáveis para mitigar os efeitos do evento; (iii) retomar a execução normal de suas obrigações tão logo cessem os efeitos do evento.

Parágrafo Terceiro. Se o evento de força maior ou caso fortuito persistir por mais de 90 (noventa) dias consecutivos, qualquer das Partes poderá rescindir este contrato mediante notificação escrita, sem que tal rescisão gere direito a indenização ou multa.`,
    risk_level: "low",
    applicable_to: ["consultoria", "desenvolvimento", "saas", "suporte", "nda", "dpa"],
    is_required: false,
    version: "1.0.0",
  },
];

export const TEMPLATE_SEEDS = [
  {
    name: "Consultoria Tech",
    slug: "consultoria-tech",
    description: "Contrato padrão para serviços de consultoria em tecnologia, diagnóstico, assessment e advisory.",
    type: "consultoria" as const,
    variables: [
      "contratante.razaoSocial", "contratante.cnpj", "contratante.endereco", "contratante.representante", "contratante.representanteCpf",
      "contratada.razaoSocial", "contratada.cnpj", "contratada.endereco", "contratada.representante", "contratada.representanteCpf",
      "servico.descricao", "servico.prazoExecucao",
      "contrato.dataInicio", "contrato.dataFim", "contrato.vigenciaMeses", "contrato.vigenciaMesesExtenso",
      "contrato.valorTotal", "contrato.valorTotalExtenso", "contrato.valorMensal", "contrato.valorMensalExtenso",
      "contrato.valorSinal", "contrato.valorSinalExtenso", "contrato.dataPagamentoSinal", "contrato.diaVencimento",
      "contrato.prazoConfidencialidadeAnos", "contrato.prazoConfidencialidadeAnosExtenso", "contrato.multaConfidencialidade",
      "contrato.periodoLimitacaoMeses", "contrato.periodoLimitacaoMesesExtenso",
      "contrato.prazoNotificacaoRescisao", "contrato.prazoNotificacaoRescisaoExtenso",
      "contrato.multaRescisoria", "contrato.prazoTransicao", "contrato.prazoTransicaoExtenso",
      "contrato.foro", "contrato.estado", "contrato.dataAssinatura",
    ],
    clauses: [
      "CL-ESCOPO-001", "CL-PRAZO-001", "CL-PAGAMENTO-001", "CL-CONFIDENCIALIDADE-001",
      "CL-PI-001", "CL-RESPONSABILIDADE-001", "CL-RESCISAO-001", "CL-FORO-001",
    ],
  },
  {
    name: "Desenvolvimento de Software",
    slug: "desenvolvimento-software",
    description: "Contrato completo para projetos de desenvolvimento de software sob medida, incluindo todas as cláusulas de proteção.",
    type: "desenvolvimento" as const,
    variables: [
      "contratante.razaoSocial", "contratante.cnpj", "contratante.endereco", "contratante.representante", "contratante.representanteCpf",
      "contratada.razaoSocial", "contratada.cnpj", "contratada.endereco", "contratada.representante", "contratada.representanteCpf",
      "servico.descricao", "servico.prazoExecucao",
      "contrato.dataInicio", "contrato.dataFim", "contrato.vigenciaMeses", "contrato.vigenciaMesesExtenso",
      "contrato.valorTotal", "contrato.valorTotalExtenso", "contrato.valorMensal", "contrato.valorMensalExtenso",
      "contrato.valorSinal", "contrato.valorSinalExtenso", "contrato.dataPagamentoSinal", "contrato.diaVencimento",
      "contrato.prazoConfidencialidadeAnos", "contrato.prazoConfidencialidadeAnosExtenso", "contrato.multaConfidencialidade",
      "contrato.periodoLimitacaoMeses", "contrato.periodoLimitacaoMesesExtenso",
      "contrato.prazoNotificacaoRescisao", "contrato.prazoNotificacaoRescisaoExtenso",
      "contrato.multaRescisoria", "contrato.prazoTransicao", "contrato.prazoTransicaoExtenso",
      "contrato.foro", "contrato.estado", "contrato.dataAssinatura",
    ],
    clauses: [
      "CL-ESCOPO-001", "CL-PRAZO-001", "CL-PAGAMENTO-001", "CL-CONFIDENCIALIDADE-001",
      "CL-PI-001", "CL-LGPD-001", "CL-SLA-001", "CL-RESPONSABILIDADE-001",
      "CL-RESCISAO-001", "CL-FORO-001", "CL-ANTICORRUPCAO-001", "CL-FORCAMAIOR-001",
    ],
  },
  {
    name: "Plataforma SaaS",
    slug: "plataforma-saas",
    description: "Contrato para licenciamento e operação de plataforma SaaS, com SLA, LGPD e todas as proteções legais.",
    type: "saas" as const,
    variables: [
      "contratante.razaoSocial", "contratante.cnpj", "contratante.endereco", "contratante.representante", "contratante.representanteCpf",
      "contratada.razaoSocial", "contratada.cnpj", "contratada.endereco", "contratada.representante", "contratada.representanteCpf",
      "servico.descricao", "servico.prazoExecucao",
      "contrato.dataInicio", "contrato.dataFim", "contrato.vigenciaMeses", "contrato.vigenciaMesesExtenso",
      "contrato.valorTotal", "contrato.valorTotalExtenso", "contrato.valorMensal", "contrato.valorMensalExtenso",
      "contrato.valorSinal", "contrato.valorSinalExtenso", "contrato.dataPagamentoSinal", "contrato.diaVencimento",
      "contrato.prazoConfidencialidadeAnos", "contrato.prazoConfidencialidadeAnosExtenso", "contrato.multaConfidencialidade",
      "sla.disponibilidade", "sla.disponibilidadeExtenso",
      "sla.tempoRespostaCritico", "sla.tempoRespostaGrave", "sla.tempoRespostaModerado",
      "sla.janelasManutencao", "sla.faixa1Min", "sla.faixa1Max", "sla.credito1", "sla.faixa2Min", "sla.credito2",
      "contrato.periodoLimitacaoMeses", "contrato.periodoLimitacaoMesesExtenso",
      "contrato.prazoNotificacaoRescisao", "contrato.prazoNotificacaoRescisaoExtenso",
      "contrato.multaRescisoria", "contrato.prazoTransicao", "contrato.prazoTransicaoExtenso",
      "contrato.foro", "contrato.estado", "contrato.dataAssinatura",
    ],
    clauses: [
      "CL-ESCOPO-001", "CL-PRAZO-001", "CL-PAGAMENTO-001", "CL-CONFIDENCIALIDADE-001",
      "CL-PI-001", "CL-LGPD-001", "CL-SLA-001", "CL-RESPONSABILIDADE-001",
      "CL-RESCISAO-001", "CL-FORO-001", "CL-ANTICORRUPCAO-001", "CL-FORCAMAIOR-001",
    ],
  },
];
