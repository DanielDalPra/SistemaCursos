# Sistema de cursos — laboratório local

## Instalar em outra máquina Windows

Requisitos: Node.js 20 ou superior, PowerShell e tar.exe do Windows.
Após clonar este repositório, execute:

```powershell
.\preparar.ps1
.\iniciar.ps1
```

O script baixa a distribuição oficial Windows 2.5.317, verifica o SHA-256
e configura SQLite com acesso apenas pelo computador local. Uma instalação
existente é preservada. A configuração inicial cria uma nova conta administrativa.

O Git versiona a home, as imagens, a documentação e os scripts. A pasta `runtime/`
(incluindo o banco, usuários, configuração e arquivos enviados), dependências,
capturas geradas e clones do upstream não são enviados. Faça backup separado
dos dados locais quando houver conteúdo real.

O Wiki.js mantém sua licença AGPL-3.0; este repositório contém a personalização
e os scripts de integração. Licenças e créditos de terceiros estão preservados.

Wiki.js 2.5.317 disponível em http://127.0.0.1:3000.
No primeiro acesso, complete o assistente e crie sua conta administrativa.
Use http://127.0.0.1:3000 como endereço do site neste teste.

Para iniciar novamente, execute no PowerShell:

```powershell
.\iniciar.ps1
```

O processo fica no terminal. Ctrl+C encerra o servidor.
O banco persistente fica em runtime/data/cursos.sqlite.
A pasta runtime contém dados locais e não é versionada.

## Código-fonte

- wikijs/: repositório requisitado, atualmente versão 3 beta.
- wikijs-v2/: código da linha estável 2, base para as adaptações.
- runtime/: distribuição oficial Windows 2.5.317 pronta para executar.

Alterações no código-fonte não são aplicadas automaticamente ao runtime.
Será necessário configurar o build de desenvolvimento para alterar a aplicação.

## Escopo inicial combinado

- Pagamento realizado diretamente à responsável pelos cursos.
- Liberação manual de acesso após confirmação de pagamento.
- Login obrigatório para acessar aulas.
- Progresso individual persistido no servidor.
- Automação de pagamentos em uma etapa posterior.

Somente a instalação local está preparada. Os recursos de cursos e progresso
individual ainda precisam ser implementados e validados.

## Home personalizada

A raiz do site agora mostra a home Aprende (nome provisório), com layout
responsivo, catálogo demonstrativo, busca, filtros e detalhes dos cursos.
Os links da área do aluno usam o login original do Wiki.js.
Os cursos são exemplos; matrículas e progresso ainda não estão integrados.

Edite `home/index.html`, `home/style.css` e `home/app.js` para ajustar a home.
Esses arquivos são servidos diretamente: atualize a página para ver alterações.
A home é uma interface própria na raiz, não uma página editável pelo editor da wiki.
O painel administrativo continua disponível em `/a`.

`integrar-home.cjs` adiciona as rotas ao controller do runtime, de forma
reaplicável. `iniciar.ps1` executa essa integração antes de iniciar o servidor.
Ao atualizar o Wiki.js, mantenha a pasta `home` e reaplique o script.

## Comparação de design

- Nova versão: http://127.0.0.1:3000/
- Primeira versão preservada: http://127.0.0.1:3000/cursos-home/v1/index.html

A segunda versão aplica orientações de Emil Design Engineering, Impeccable
e Taste: fonte Epilogue hospedada localmente, catálogo editorial, detalhes
expansíveis, feedback nos controles e suporte a movimento reduzido.
As fotografias são ilustrativas, com créditos no rodapé e em
`.impeccable/credits.md`. A licença da fonte está em `home/media/epilogue-OFL.txt`.

As skills foram instaladas em `C:/Users/danie/.codex/skills/`. Os clones de
consulta e o motor de design local estão excluídos do Git.

Verificação local: `node verificar-home.cjs` (usa o Playwright e Chromium
disponíveis nesta máquina). Capturas ficam em `.impeccable/review/`.
O inspetor visual próprio do Taste não conseguiu completar a conexão CDP;
a verificação substituta mede transbordamento, imagens, fontes, títulos e
interações com Playwright. O lint do Taste passou sem findings.
