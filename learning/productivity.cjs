module.exports = {
  id: 'rotina-possivel',
  title: 'Tempo para o que importa',
  apiBase: '/api/aprende/rotina-possivel',
  pagesDirectory: 'produtividade',
  revision: 1,
  passScore: 80,
  noteFields: ['compromissos', 'prioridade', 'proximaAcao', 'janela', 'planoB', 'revisao'],
  steps: [
    {
      id: 'realidade',
      title: 'Uma rotina que cabe',
      kind: 'video',
      videoId: 'nwCtVnHAEqQ',
      start: 0,
      sourceTitle: 'Cara, esse tipinho de rotina só funciona para influencer…',
    },
    { id: 'material', title: 'Sua semana, no papel', kind: 'reading' },
    {
      id: 'semana',
      title: 'Planeje os próximos sete dias',
      kind: 'video',
      videoId: 'NZNuJonVK2k',
      start: 0,
      sourceTitle: 'Como planejar a semana?',
    },
    { id: 'avaliacao', title: 'Seu plano faz sentido?', kind: 'quiz' },
  ],
  questions: [
    {
      id: 'contexto',
      prompt:
        'Você se inspira em alguém que estuda às cinco da manhã, mas chega tarde do trabalho. Qual é a adaptação mais coerente?',
      options: [
        'Copiar o horário mesmo que outras necessidades fiquem sem espaço.',
        'Abandonar o estudo porque não pode seguir o mesmo horário.',
        'Entender a finalidade do hábito e encontrar uma oportunidade compatível com sua realidade.',
        'Considerar que qualquer dificuldade comprova falta de disciplina.',
      ],
      answer: 2,
      explanation:
        'A primeira aula propõe entender a lógica do hábito, em vez de copiar sua aparência. Compromissos, recursos e responsabilidades mudam de pessoa para pessoa.',
    },
    {
      id: 'capacidade',
      prompt:
        'Sua agenda tem reunião, deslocamento e um compromisso familiar. Antes de acrescentar tarefas, o que fazer?',
      options: [
        'Registrar esses compromissos para enxergar o tempo que realmente sobra.',
        'Apagar os compromissos recorrentes porque você já se lembra deles.',
        'Preencher todos os espaços livres para garantir produtividade.',
        'Planejar como se a semana não tivesse interrupções.',
      ],
      answer: 0,
      explanation:
        'Compromissos ocupam tempo mesmo quando não exigem lembretes. Torná-los visíveis evita planejar com uma capacidade que você não tem.',
    },
    {
      id: 'acao',
      prompt: 'Qual alternativa transforma “organizar meus estudos” em uma próxima ação clara?',
      options: [
        'Ser mais organizado.',
        'Pensar em estudar mais.',
        'Comprar mais um aplicativo antes de começar.',
        'Separar o material da próxima aula e listar os dois tópicos que preciso revisar.',
      ],
      answer: 3,
      explanation:
        'Uma próxima ação descreve algo executável. Ela ajuda a sair de uma intenção ampla para uma tarefa com começo e resultado identificável.',
    },
    {
      id: 'preparo',
      prompt:
        'Você tem uma apresentação na quinta-feira. O que a revisão da agenda deve ajudar a perceber?',
      options: [
        'Que basta lembrar da apresentação na própria quinta-feira.',
        'Que pode haver preparação antes dela, como revisar o material e ensaiar.',
        'Que todos os dias da semana devem ter exatamente as mesmas tarefas.',
        'Que preparar antes é inútil, porque imprevistos podem acontecer.',
      ],
      answer: 1,
      explanation:
        'A segunda aula orienta olhar para os compromissos e identificar providências necessárias. A preparação pode precisar de espaço antes da data do evento.',
    },
    {
      id: 'ajuste',
      prompt:
        'Um imprevisto ocupou a janela de estudo. Qual resposta faz mais sentido no plano de aplicação?',
      options: [
        'Revisar o que mudou e escolher reduzir, reagendar ou renegociar a ação.',
        'Compensar automaticamente sobrecarregando o dia seguinte.',
        'Apagar a tarefa e concluir que você nunca terá constância.',
        'Manter o plano intacto para que ele continue parecendo organizado.',
      ],
      answer: 0,
      explanation:
        'O material propõe usar o plano como ferramenta de decisão, não como prova de valor pessoal. Ajustar com clareza preserva o objetivo sem fingir que a capacidade disponível não mudou.',
    },
  ],
};
