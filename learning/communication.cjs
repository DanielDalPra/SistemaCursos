module.exports = {
  id: 'comunicacao-clara',
  title: 'Encontre sua voz',
  apiBase: '/api/aprende/comunicacao-clara',
  pagesDirectory: 'comunicacao',
  revision: 1,
  passScore: 80,
  noteFields: ['situacao', 'intencao', 'publico', 'ideiaCentral', 'exemplo', 'pergunta', 'revisao'],
  steps: [
    {
      id: 'escuta',
      title: 'Clareza começa na escuta',
      kind: 'video',
      videoId: '_LsQyUaef0c',
      start: 0,
      sourceTitle: 'O que comunico quando me comunico | Mara Behlau | TEDxGovernadorValadares',
    },
    { id: 'material', title: 'Prepare uma conversa', kind: 'reading' },
    {
      id: 'mensagem',
      title: 'Dê forma à sua mensagem',
      kind: 'video',
      videoId: '3_F1kj-sBBY',
      start: 0,
      sourceTitle: 'Comunicação assertiva: 5 dicas práticas',
    },
    { id: 'avaliacao', title: 'Sua mensagem chegou?', kind: 'quiz' },
  ],
  questions: [
    {
      id: 'escuta',
      prompt: 'Alguém pede “preciso disso logo”. Como diminuir o risco de um desencontro?',
      options: [
        'Escolher sozinho um prazo que pareça razoável.',
        'Perguntar qual entrega é necessária, para quando e confirmar o combinado.',
        'Responder mais alto para mostrar que entendeu.',
        'Dizer que foi claro e encerrar a conversa.',
      ],
      answer: 1,
      explanation:
        'Uma frase que parece clara para quem fala pode ser ambígua para quem ouve. Perguntar e confirmar é mais seguro do que tratar uma interpretação como um acordo.',
    },
    {
      id: 'observacao',
      prompt:
        'Qual frase começa por uma observação concreta, em vez de afirmar a intenção da outra pessoa?',
      options: [
        '“Você nunca respeita minhas ideias.”',
        '“Você só quer me prejudicar.”',
        '“Na reunião de hoje, minha explicação foi interrompida duas vezes.”',
        '“Você não se importa com a equipe.”',
      ],
      answer: 2,
      explanation:
        'Uma observação descreve uma situação que pode ser discutida. Ela não prova o motivo de quem interrompeu nem elimina a necessidade de ouvir sua perspectiva.',
    },
    {
      id: 'estrutura',
      prompt:
        'Você quer sugerir uma melhoria a uma equipe que não conhece os detalhes. Qual preparação ajuda?',
      options: [
        'Definir uma ideia principal, explicar o contexto com um exemplo e fazer um pedido concreto.',
        'Reunir todas as informações possíveis e falar sem escolher o que importa.',
        'Usar termos técnicos sem explicá-los para parecer mais preparado.',
        'Decorar uma frase e repeti-la mesmo se surgirem dúvidas.',
      ],
      answer: 0,
      explanation:
        'O roteiro do material organiza o que a pessoa precisa compreender e qual próximo passo você quer discutir. Ele orienta a conversa, mas não substitui a escuta.',
    },
    {
      id: 'interpretacao',
      prompt:
        'Durante a conversa, a outra pessoa muda de postura e fica em silêncio. Qual é a atitude mais cuidadosa?',
      options: [
        'Concluir que ela rejeitou a ideia.',
        'Tratar o gesto como prova de desinteresse.',
        'Acelerar a fala para terminar antes de ouvir uma objeção.',
        'Perceber a mudança e fazer uma pergunta aberta, sem presumir o motivo.',
      ],
      answer: 3,
      explanation:
        'Gestos, voz e contexto participam da comunicação, mas um sinal isolado não revela com certeza o pensamento de alguém. Verifique sua interpretação pela conversa.',
    },
    {
      id: 'pedido',
      prompt: 'Qual pedido permite combinar um próximo passo com mais clareza e respeito?',
      options: [
        '“Se você se importasse, saberia o que fazer.”',
        '“Você pode revisar este parágrafo até amanhã às 15h? Se não couber, podemos combinar outro prazo?”',
        '“Resolva isso de algum jeito.”',
        '“Concorde comigo para a conversa acabar.”',
      ],
      answer: 1,
      explanation:
        'Um pedido identifica ação e prazo e permite conversar sobre a possibilidade de atendê-lo. Clareza não exige controlar a resposta ou desconsiderar os limites da outra pessoa.',
    },
  ],
};
