# Minicurso Do plano à ação

## Usar localmente

Inicie com `./iniciar.ps1` e abra `http://127.0.0.1:3000/cursos`.
Entre com sua conta do Wiki.js. Administradores podem revisar o curso sem
matrícula; as demais contas precisam de liberação.

As páginas são `/cursos/do-plano-a-acao/` seguido de:

1. `confianca`: primeiro vídeo, a partir de 5min03s.
2. `material`: material original com LARP e plano de aplicação imprimível.
3. `clareza`: segundo vídeo e exercício de comunicação.
4. `avaliacao`: cinco questões, aprovação com 80%, correção e novas tentativas.

`/cursos` retoma a primeira etapa não concluída; após concluir, abre a avaliação.
Os vídeos carregam sob demanda e têm alternativa de abrir no YouTube.
Conclusão de vídeo é declarada pelo aluno, sem alegação de monitoramento.

## Liberação manual

1. Cadastre/confira a conta ativa no painel de usuários do Wiki.js.
2. Entre como administrador e abra `/cursos/administracao`.
3. Digite o e-mail da conta e escolha liberar ou revogar.

A revogação bloqueia solicitações futuras e preserva registros existentes.
Não recolhe conteúdo que o navegador já carregou. A liberação não altera
permissões gerais da wiki. Pagamento é feito fora da plataforma.

## Dados e integração

`server.cjs` é montado pelo `integrar-home.cjs` depois da autenticação do Wiki.js.
As páginas HTML e `course.cjs` (com o gabarito) ficam fora da raiz estática.
Apenas `public/` é servido por `/cursos-assets`.

As tabelas `aprendeEnrollments`, `aprendeProgress` e `aprendeAttempts` são
criadas de forma aditiva no primeiro acesso autenticado, sem alterar tabelas
do upstream. O laboratório usa SQLite e uma instância. Faça backup do banco
e dos uploads antes de atualizar. Múltiplas instâncias exigem uma estratégia
de migrações e concorrência própria.

O usuário vem da sessão; IDs e notas enviados pelo navegador não substituem
a identidade autenticada. Mutações exigem CSRF e JSON. Anotações aceitam até
2.000 caracteres por campo. O quiz é corrigido no servidor, exige etapas
anteriores e aceita até 20 envios por usuário por hora. Tentativas registram
revisão do conteúdo, respostas, nota e data.

## Conteúdo e fontes

- Luana Carolina, [O segredo das pessoas confiantes...](https://www.youtube.com/watch?v=0CpNy1Ph7e8&t=303s).
- Luana Carolina, [Como articular suas ideias com mais clareza](https://www.youtube.com/watch?v=73wo6vFD99s).
- [Cambridge Dictionary — LARP](https://dictionary.cambridge.org/dictionary/english/larp).

Títulos/autoria conferidos no oEmbed oficial e legendas públicas consultadas
em 24/10/2026. As legendas não são armazenadas neste repositório. O material
editorial e os exercícios são originais. LARP é complemento editorial, não
citação atribuída à autora. Os vídeos são prévia externa sem vínculo com
Luana Carolina; o acervo definitivo da cliente continua pendente. Não há
emissão de certificado profissional.

## Validação

```powershell
node --test tests/course-api.test.cjs
node tests/course-browser.cjs
```

Os testes usam usuários fictícios e SQLite em memória. Não leem nem alteram
as contas ou o banco real. O teste de navegador usa Playwright e Chromium
desta máquina; `PLAYWRIGHT_MODULE` e `CHROME_PATH` aceitam outros caminhos.
Verifica liberação, sequência, anotações, retomada em outro contexto,
impressão, falha/repetição/aprovação e resultado persistido. Capturas ficam em
`.impeccable/course-review/` e não são versionadas.

O player é substituído por uma fixture nos testes: confirmam URL e tempo
inicial, não reprodução real. Reprodução/legendas/disponibilidade dependem
do YouTube e devem ser conferidas na implantação. No Wiki.js local foram
verificados API 401 e redirecionamento ao login para visitantes. A revisão
autenticada real usa a conta administrativa já criada pelo usuário.
