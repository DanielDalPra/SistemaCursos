// Conteúdo e correção ficam no servidor, fora de qualquer diretório estático.
module.exports = {
  id: 'do-plano-a-acao',
  title: 'Do plano à ação',
  revision: 1,
  passScore: 80,
  steps: [
    { id: 'confianca', title: 'Começar antes de se sentir pronto', kind: 'video', videoId: '0CpNy1Ph7e8', start: 303, sourceTitle: 'O segredo das pessoas confiantes...' },
    { id: 'material', title: 'Identidade que vira prática', kind: 'reading' },
    { id: 'clareza', title: 'Organizar para comunicar', kind: 'video', videoId: '73wo6vFD99s', start: 0, sourceTitle: 'Como articular suas ideias com mais clareza' },
    { id: 'avaliacao', title: 'Uma pausa para consolidar', kind: 'quiz' }
  ],
  questions: [
    { id: 'comecar', prompt: 'Você quer falar melhor em reuniões, mas ainda se sente desajeitado. Qual próximo passo combina com o curso?', options: ['Esperar a insegurança desaparecer para só então participar.', 'Preparar uma ideia, praticar em voz alta e observar o que pode melhorar.', 'Fingir que domina assuntos que ainda não estudou.', 'Evitar qualquer situação em que alguém perceba que você está aprendendo.'], answer: 1, explanation: 'A prática pode começar antes da sensação de confiança. Preparação, tentativa e feedback geram evidências de aprendizado; fingir competência não substitui esse processo.' },
    { id: 'larp', prompt: 'No uso figurado discutido no material, o que diferencia “só parecer” de desenvolver uma habilidade?', options: ['Comprar os acessórios mais reconhecidos por quem pratica.', 'Receber elogios antes de iniciar.', 'Associar a identidade desejada a uma prática real, mesmo ainda sendo iniciante.', 'Nunca contar a ninguém que ainda está aprendendo.'], answer: 2, explanation: 'A diferença está na prática e no compromisso com aprender. A aparência de iniciante não revela, sozinha, a intenção de alguém. LARP, em seu sentido original, é uma atividade de interpretação, não um defeito pessoal.' },
    { id: 'acao', prompt: 'Qual plano oferece uma evidência observável de desenvolvimento?', options: ['“Vou ser mais disciplinado algum dia.”', '“Vou parecer mais produtivo nas redes.”', '“Vou esperar ter todos os materiais.”', '“Amanhã, depois do café, vou ler duas páginas e anotar uma ideia.”'], answer: 3, explanation: 'Ação específica, contexto e registro tornam o plano verificável. Se não funcionar, você terá informação concreta para ajustar a próxima tentativa.' },
    { id: 'repertorio', prompt: 'Antes de procurar um truque para falar bem, qual base a segunda aula propõe fortalecer?', options: ['Repertório, exploração de ideias e organização dos pensamentos.', 'Palavras difíceis em qualquer conversa.', 'Um roteiro decorado que nunca possa mudar.', 'A quantidade de tempo que você consegue falar sem parar.'], answer: 0, explanation: 'A aula enfatiza o conteúdo do pensamento: construir repertório, explorar relações e externalizar ideias por escrita ou fala para perceber lacunas.' },
    { id: 'intencao', prompt: 'Você vai explicar uma ideia a alguém que não conhece o tema. O que ajuda mais?', options: ['Usar termos técnicos sem explicar para demonstrar autoridade.', 'Definir o que a pessoa precisa compreender, dar um exemplo e checar o entendimento.', 'Falar mais rápido para mostrar domínio.', 'Repetir a mesma frase mais alto.'], answer: 1, explanation: 'A intenção orienta a forma de comunicar. Uma explicação fica mais útil quando considera o público, organiza a mensagem e usa exemplos que façam sentido para ele.' }
  ]
};
