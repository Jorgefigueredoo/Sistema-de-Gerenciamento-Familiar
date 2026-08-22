# 🗓️ Agenda da Família

Sistema **privado** de organização de rotina para uma família: tarefas do dia, da semana e delegadas, divididas por área da vida (trabalho, casa, alimentação, família, treino, espiritual e compromissos).

Só quem for cadastrado por um administrador entra. Cada pessoa tem um **papel** (Admin, Membro, Ajudante…) e cada papel carrega um conjunto de **permissões** — tudo aplicado no banco via Row Level Security do Postgres, não só na interface.

- **Stack:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase (Auth + Postgres + RLS)
- **Deploy:** Vercel (plano gratuito) — sem dependências pesadas ou incompatíveis com serverless

---

## 📁 Estrutura de pastas

```
.
├── app/
│   ├── (app)/                  # área logada (header + navegação inferior)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Agenda — a semana dia a dia
│   │   ├── delegado/
│   │   ├── nova-tarefa/
│   │   └── admin/
│   │       ├── usuarios/
│   │       └── papeis/
│   ├── actions/                # Server Actions (tasks, admin, auth)
│   ├── auth/callback/          # troca o link do e-mail por uma sessão
│   ├── login/
│   ├── recuperar-senha/
│   ├── nova-senha/
│   ├── globals.css
│   └── layout.tsx
├── components/                 # UI reutilizável
│   ├── admin/
│   │   ├── UsersManager.tsx
│   │   └── RolesManager.tsx
│   ├── AppHeader.tsx · BottomNav.tsx · BottomSheet.tsx
│   ├── TaskCard.tsx · TaskForm.tsx · TaskSection.tsx
│   └── Button.tsx · ErrorBanner.tsx · EmptyState.tsx · ProgressSummary.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # cliente do navegador
│   │   ├── server.ts           # cliente de Server Component / Server Action
│   │   └── admin.ts            # cliente service_role (só no servidor)
│   ├── auth.ts                 # sessão + guardas de permissão
│   ├── tasks.ts                # consultas das telas
│   ├── categories.ts           # cores e ícones por categoria
│   ├── dates.ts                # datas, períodos e recorrência
│   ├── env.ts · permissions.ts · action-result.ts
├── types/
│   ├── database.ts
│   └── index.ts
├── supabase/migrations/        # SQL pronto para rodar
│   ├── 20260822090000_init_schema.sql
│   ├── 20260822090100_rls_policies.sql
│   ├── 20260822090200_seed.sql
│   └── 20260822090300_task_completions.sql
├── middleware.ts               # renova a sessão e barra rota privada
├── .env.example
└── README.md
```

---

## 🚀 Como rodar localmente

### 1. Instalar as dependências

Requer **Node.js 18.17 ou superior**.

```bash
npm install
```

### 2. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto (o plano gratuito basta).
2. Guarde a senha do banco que aparece na criação.
3. Vá em **Project Settings → API Keys** e copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** (ou **publishable key**, `sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (ou **secret key**, `sb_secret_...`) → `SUPABASE_SERVICE_ROLE_KEY`

   O Supabase renomeou as chaves em 2025; as duas gerações funcionam e o projeto aceita
   os dois nomes de variável (`..._ANON_KEY` ou `..._PUBLISHABLE_KEY`, `..._SERVICE_ROLE_KEY`
   ou `..._SECRET_KEY`).

   > Se o painel te oferecer o assistente **"Conecte-se ao seu projeto"**, use dele apenas
   > os valores do `.env.local`. Os passos de instalar pacotes e criar `utils/supabase/*`
   > são para um projeto vazio e iriam duplicar o que já existe em `lib/supabase/`.

### 3. Configurar as variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha o `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> ⚠️ A `SUPABASE_SERVICE_ROLE_KEY` ignora todas as regras de segurança do banco. Ela **nunca** pode ganhar o prefixo `NEXT_PUBLIC_` nem ser commitada. O `.gitignore` já bloqueia o `.env.local`.

### 4. Rodar as migrations

Existem dois caminhos — escolha **um**.

#### Opção A — SQL Editor (mais simples, sem instalar nada)

No painel do Supabase, abra **SQL Editor → New query** e rode os três arquivos **nesta ordem**, um de cada vez:

1. `supabase/migrations/20260822090000_init_schema.sql`
2. `supabase/migrations/20260822090100_rls_policies.sql`
3. `supabase/migrations/20260822090200_seed.sql`
4. `supabase/migrations/20260822090300_task_completions.sql`

Basta copiar o conteúdo de cada arquivo, colar e clicar em **Run**. Os scripts são idempotentes: rodar de novo não duplica nada.

#### Opção B — Supabase CLI

```bash
npm install -g supabase          # ou: npx supabase
supabase login
supabase link --project-ref <o-ref-do-seu-projeto>
supabase db push
```

O `<project-ref>` é o pedaço do meio da URL do projeto (`https://<project-ref>.supabase.co`).

### 5. Criar a primeira pessoa (a administradora)

No painel: **Authentication → Users → Add user**

- E-mail e senha da dona da agenda
- Marque **Auto Confirm User** (assim ela já entra sem precisar confirmar e-mail)

O gatilho `handle_new_user` cria o perfil automaticamente e — por ser **o primeiro usuário do sistema** — já o promove a **Admin** com todas as permissões. As pessoas cadastradas depois entram como **Membro** por padrão, e o papel pode ser trocado na tela `/admin/usuarios`.

### 6. Ajustar as URLs de autenticação

Em **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000` (troque pela URL da Vercel quando publicar)
- **Redirect URLs:** adicione `http://localhost:3000/**` e, depois, `https://seu-app.vercel.app/**`

Isso é o que faz o link de "esqueci minha senha" funcionar.

### 7. Subir o projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Outros comandos úteis:

```bash
npm run typecheck   # checagem de tipos
npm run lint        # ESLint
npm run build       # build de produção
```

---

## 🔐 Papéis e permissões

O seed já cria três papéis:

| Papel        | Permissões                                                   |
| ------------ | ------------------------------------------------------------ |
| **Admin**    | todas                                                        |
| **Membro**   | `create_task`, `view_all_tasks`, `receive_delegated_task`     |
| **Ajudante** | `receive_delegated_task`                                      |

Permissões disponíveis:

| Key                      | O que libera                                              |
| ------------------------ | --------------------------------------------------------- |
| `manage_users`           | tela `/admin/usuarios`: cadastrar, editar e remover pessoas |
| `manage_roles`           | tela `/admin/papeis`: criar papéis e marcar permissões      |
| `create_task`            | criar tarefas                                               |
| `view_all_tasks`         | ver as tarefas de todo mundo, não só as próprias            |
| `edit_others_tasks`      | editar e excluir tarefas criadas por outra pessoa           |
| `receive_delegated_task` | pode aparecer na lista de quem recebe delegação             |

Papéis novos e a marcação de permissões são feitos pela tela `/admin/papeis` — não é preciso mexer em SQL.

### Cadastrando as pessoas da família

Em `/admin/usuarios`, o botão **Cadastrar pessoa** pede nome, e-mail, **senha provisória** e papel.

A senha provisória existe porque o plano gratuito do Supabase manda pouquíssimos e-mails: um fluxo de convite por e-mail seria frágil. Então a administradora define uma senha, passa para a pessoa, e essa pessoa troca depois em **Esqueci minha senha** (ou a própria administradora troca em `/admin/usuarios`). Se você configurar um SMTP próprio no Supabase, dá para migrar para convite por e-mail sem mexer no banco.

O cadastro usa a `service_role` no servidor, e sempre **depois** de conferir a permissão `manage_users` de quem está chamando.

---

## 🛡️ Como a segurança funciona

Todas as tabelas estão com **RLS habilitado** e o papel `anon` não tem acesso a nada. As regras são resolvidas por funções `SECURITY DEFINER` (`public.has_permission('...')`), o que evita recursão infinita nas policies.

**tasks**

- **Ver:** a tarefa é minha (`created_by`), foi delegada para mim (`delegated_to`), ou eu tenho `view_all_tasks`.
- **Criar:** preciso de `create_task`, e o `created_by` tem que ser eu mesma. Só posso delegar para quem tem `receive_delegated_task`.
- **Editar:** a tarefa é minha, foi delegada para mim, ou eu tenho `edit_others_tasks`. Quem só recebeu a delegação consegue **marcar como concluída**, mas um gatilho impede que reescreva título, categoria, data ou destinatário.
- **Excluir:** só quem criou, ou quem tem `edit_others_tasks`.

**profiles**

- **Ver:** sempre a mim mesma; as outras pessoas apenas com `view_all_tasks` ou `manage_users`.
- **Editar:** meu próprio nome sim, meu próprio papel não — trocar papel exige `manage_users`.

**roles / permissions / role_permissions**

- Leitura liberada para quem está logado (a interface precisa mostrar nomes de papéis).
- Qualquer escrita exige `manage_roles`. O papel `Admin` não pode ser excluído, para o sistema nunca ficar sem administrador.

As telas `/admin/*` são bloqueadas no servidor antes de renderizar (`requirePermission`), e o banco recusa a operação de novo caso alguém tente pela API. Duas camadas, de propósito.

---

## 📱 Telas

| Rota               | O que faz                                                                |
| ------------------ | ------------------------------------------------------------------------ |
| `/login`           | e-mail + senha, com "esqueci minha senha"                                |
| `/`                | **Agenda** — a semana dia a dia: régua dos 7 dias, troca de semana, atrasadas |
| `/delegado`        | **Delegado** — o que foi passado para outra pessoa e o status de cada uma |
| `/nova-tarefa`     | criação rápida: título, categoria, dia da semana, período, horário, recorrência |
| `/admin/usuarios`  | pessoas da família e seus papéis — exige `manage_users`                   |
| `/admin/papeis`    | papéis e checkboxes de permissão — exige `manage_roles`                   |

---

## ☁️ Deploy na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com](https://vercel.com) → **Add New → Project** → importe o repositório.
3. O framework é detectado como Next.js; não precisa mudar build command nem output.
4. Em **Environment Variables**, cadastre as quatro variáveis (Production e Preview):

   | Nome                            | Valor                                |
   | ------------------------------- | ------------------------------------ |
   | `NEXT_PUBLIC_SUPABASE_URL`      | URL do projeto Supabase              |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave anon                           |
   | `SUPABASE_SERVICE_ROLE_KEY`     | chave service_role                   |
   | `NEXT_PUBLIC_SITE_URL`          | `https://seu-app.vercel.app`         |

5. Clique em **Deploy**.
6. Volte ao Supabase em **Authentication → URL Configuration** e coloque a URL da Vercel em **Site URL** e em **Redirect URLs** (`https://seu-app.vercel.app/**`).

Depois disso, todo push na branch principal republica sozinho.

### Dica: instalar no celular

Aberto o site no Chrome (Android) ou Safari (iOS), use **"Adicionar à tela de início"**. O app abre em tela cheia, como um aplicativo.

---

## 🧱 Modelo de dados

```
roles ──< role_permissions >── permissions
  │
  └──< profiles ──< tasks
                     │
                     └── delegated_to → profiles
```

| Tabela             | Para que serve                                                   |
| ------------------ | ---------------------------------------------------------------- |
| `profiles`         | perfil da pessoa, espelha `auth.users` (id, nome, e-mail, papel)  |
| `roles`            | papéis de acesso                                                  |
| `permissions`      | catálogo de permissões, identificadas por `key`                   |
| `role_permissions` | ligação N:N entre papel e permissão                               |
| `tasks`            | as tarefas: categoria, destino, data, período, horário, delegação |
| `task_completions` | uma linha por dia concluído de uma tarefa recorrente               |

Campos de `tasks` que valem explicação:

- `scope`: `today` (tem dia marcado — o nome é histórico, o dia mora em `date`) · `delegated` (é de outra pessoa) · `this_week` (legado: sem dia, ver abaixo)
- `period`: `manha` · `tarde` · `noite` — usado para ordenar dentro do dia
- `date`: o dia em que a tarefa acontece. O formulário pergunta o **dia da semana** e resolve para a próxima data em que ele cai — é isso que a Agenda usa para encaixar a tarefa na coluna certa
- `recurrence_rule`: `"weekly:mon,wed,fri"` — dias da semana em que a tarefa se repete

**Sobre o `this_week`:** a tela "Essa semana" foi removida quando a Agenda virou a tela única — toda tarefa nova nasce com um dia ou delegada. As linhas que já existiam com esse `scope` aparecem num bloco "Sem dia marcado" no fim da Agenda, para receberem um dia pelo menu ⋯. Quando o bloco esvaziar, ele some sozinho e o `scope` pode ser aposentado do schema.

**Sobre as recorrentes:** uma tarefa que se repete não é copiada para cada dia. Ela é uma linha só, e as telas Hoje e Agenda calculam na hora se a regra cai naquele dia. Por isso o `is_done` não serve para ela — se marcasse na segunda, apareceria já concluída na quarta. A conclusão de cada dia vira uma linha em `task_completions`, o que ainda dá um histórico de "quantas vezes treinei esse mês" de graça.

---

## ❓ Problemas comuns

**"Variável de ambiente ausente"** — falta preencher o `.env.local`. Depois de editar, reinicie o `npm run dev`.

**Entrei mas não vejo nada e não consigo criar tarefa** — o perfil ficou sem papel. Isso acontece se o usuário foi criado no Auth *antes* das migrations rodarem. Rode o `20260822090200_seed.sql` de novo: ele promove a primeira pessoa a Admin.

**`infinite recursion detected in policy`** — o arquivo de policies foi rodado sem o de schema (as funções `has_permission` etc. vivem lá). Rode as migrations na ordem.

**O link de recuperar senha leva para `localhost` em produção** — falta ajustar **Site URL** no Supabase e `NEXT_PUBLIC_SITE_URL` na Vercel.
# Sistema-de-Gerenciamento-Familiar
