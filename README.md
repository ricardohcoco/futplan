# ⚽ FutPlan

O **FutPlan** é um sistema web desenvolvido para auxiliar na gestão de escolinhas de futebol infantil.

A aplicação centraliza o gerenciamento de alunos, responsáveis, turmas, matrículas e mensalidades, permitindo que as principais atividades administrativas da escolinha sejam realizadas em um único sistema.

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) do curso de **Análise e Desenvolvimento de Sistemas da Universidade Luterana do Brasil (ULBRA)**.

## 🌐 Acesso ao sistema

O FutPlan está publicado e pode ser acessado pelo endereço:

**Aplicação:** https://futplan.vercel.app/

**Repositório:** https://github.com/ricardohcoco/futplan

Para avaliação acadêmica, foram criadas contas específicas com os perfis Gestor e Administrativo. As credenciais de demonstração são disponibilizadas no documento de entrega da disciplina.

> O acesso é restrito a usuários autorizados. A aplicação não disponibiliza cadastro público de usuários.

---

## 📖 Como utilizar o FutPlan

Após realizar o login, o usuário será direcionado ao **Dashboard**, que apresenta uma visão geral da situação atual da escolinha.

O menu superior permite acessar as principais áreas do sistema:

- Início
- Alunos
- Turmas
- Matrículas
- Mensalidades

### 1. Dashboard

Na página inicial são apresentados indicadores gerais do sistema:

- Quantidade de alunos ativos.
- Quantidade de turmas ativas.
- Quantidade de matrículas ativas.
- Mensalidades pagas e pendentes no mês atual.
- Quantidade de mensalidades em atraso.

Caso existam mensalidades atrasadas, os detalhes podem ser consultados na página **Mensalidades**, utilizando o filtro **Atrasadas**.

### 2. Alunos e responsáveis

Na página **Alunos**, é possível cadastrar e consultar os alunos da escolinha.

Antes de cadastrar um aluno, é necessário possuir um responsável cadastrado.

O cadastro do responsável solicita nome, telefone e consentimento para tratamento dos dados pessoais.

Após o cadastro, o responsável pode ser localizado pelo campo de busca no formulário do aluno.

O cadastro do aluno inclui:

- Nome.
- Data de nascimento.
- Endereço.
- Escola.
- Turno escolar.
- Responsável.
- Parentesco.

O sistema aceita alunos com idade entre **5 e 15 anos**.

Também permite pesquisar alunos, visualizar registros ativos e inativos, editar informações, inativar cadastros e consultar os detalhes de cada aluno.

Na página de detalhes é possível visualizar a matrícula atual e o histórico de mensalidades.

### 3. Turmas

Na página **Turmas**, é possível cadastrar e administrar as turmas disponíveis.

Cada turma possui:

- Nome.
- Faixa etária.
- Turno.
- Horário de treinamento.
- Dias de treinamento.
- Capacidade máxima.

Os treinamentos são organizados de segunda a sexta-feira nos períodos da manhã e da tarde.

Cada turma pode possuir até **20 alunos**.

O sistema permite pesquisar, consultar, editar e inativar turmas.

### 4. Matrículas

A página **Matrículas** permite associar alunos às turmas disponíveis.

Para realizar uma matrícula:

1. Pesquise o aluno pelo nome.
2. Selecione o aluno desejado.
3. Escolha uma turma disponível.
4. Confirme o cadastro da matrícula.

O sistema valida automaticamente:

- Compatibilidade entre a idade do aluno e a faixa etária da turma.
- Compatibilidade entre o turno escolar e o turno de treinamento.
- Disponibilidade de vagas.
- Existência de apenas uma matrícula ativa por aluno.

O aluno que estuda pela manhã deve treinar à tarde, enquanto o aluno que estuda à tarde deve treinar pela manhã.

As matrículas podem ser encerradas, preservando o histórico dos registros.

### 5. Mensalidades

A página **Mensalidades** permite controlar as cobranças associadas às matrículas.

O usuário com perfil Gestor pode definir o valor padrão e gerar as mensalidades de um determinado mês.

O valor aplicado no momento da geração permanece registrado na cobrança, mesmo após alterações posteriores no valor padrão.

As mensalidades podem ser consultadas por mês, nome do aluno e situação:

- Pendentes.
- Atrasadas.
- Pagas.
- Todas.

O pagamento pode ser registrado diretamente na mensalidade. Nessa operação, o sistema registra automaticamente a data e identifica o usuário responsável.

O registro de pagamento é definitivo no escopo atual da aplicação.

---

## 👥 Perfis de acesso

O FutPlan possui dois perfis:

**Gestor:** possui acesso às funcionalidades administrativas do sistema, incluindo configuração do valor da mensalidade e geração mensal das cobranças.

**Administrativo:** pode executar as operações administrativas permitidas e registrar pagamentos, mas não pode alterar o valor padrão nem gerar novas mensalidades.

Os perfis são controlados pela autenticação e pelas regras de autorização do sistema.

---

## 🔒 Segurança e privacidade

O FutPlan utiliza o **Supabase Auth** para autenticação de usuários e o **Row Level Security (RLS)** do PostgreSQL para controle de acesso aos dados.

As operações também possuem validações no banco de dados por meio de funções, restrições e triggers.

O cadastro de responsáveis registra o consentimento para tratamento dos dados pessoais.

Alunos, responsáveis, turmas e matrículas possuem mecanismos de inativação ou encerramento, conforme as regras implementadas, preservando informações históricas quando necessário.

Os registros disponibilizados para a demonstração acadêmica são fictícios.

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Versão principal | Finalidade |
|---|---|---|
| React | 19 | Interface do sistema |
| TypeScript | 6 | Tipagem estática |
| Vite | 8 | Ambiente de desenvolvimento e build |
| React Router DOM | 7 | Navegação entre páginas |
| Supabase JS | 2 | Integração com os serviços Supabase |
| PostgreSQL | Gerenciado pelo Supabase | Banco de dados relacional |
| CSS Modules | — | Estilização dos componentes |
| Vercel | — | Hospedagem da aplicação web |

As versões específicas das dependências estão documentadas no arquivo `package.json` e resolvidas pelo `package-lock.json`.

### Arquitetura

O FutPlan utiliza uma arquitetura web com:

- **Frontend:** React, TypeScript e CSS Modules.
- **Autenticação:** Supabase Auth.
- **Banco de dados:** PostgreSQL hospedado no Supabase.
- **Regras de negócio:** validações, funções SQL, triggers, constraints e políticas RLS.
- **Hospedagem:** Vercel.

A aplicação não utiliza uma API própria em Node.js ou Express. A comunicação com os serviços do Supabase é realizada por meio da biblioteca oficial `@supabase/supabase-js`.

---

## 💻 Instalação e execução local

### Pré-requisitos

Para executar o FutPlan localmente, recomenda-se utilizar:

- Node.js 24.x — versão utilizada no desenvolvimento: 24.12.0.

- npm 11.x — versão utilizada no desenvolvimento: 11.6.2.

- Git — para clonar o repositório.

- Projeto Supabase configurado — para autenticação e acesso ao banco PostgreSQL.

Outras versões compatíveis podem funcionar, mas o ambiente acima foi utilizado durante o desenvolvimento e os testes do projeto.

### 1. Clonar o repositório

```bash
git clone https://github.com/ricardohcoco/futplan.git
cd futplan
```

### 2. Instalar as dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Na raiz do projeto, crie um arquivo `.env.local` com base no `.env.example`.

Informe as variáveis:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publica
```

Os valores devem corresponder a um projeto Supabase configurado para utilizar o FutPlan.

A chave utilizada pelo frontend deve ser uma chave pública do Supabase. Não utilize senhas de banco de dados ou chaves administrativas nesse arquivo.

### 4. Iniciar a aplicação

```bash
npm run dev
```

O Vite exibirá no terminal o endereço de acesso local, normalmente:

http://localhost:5173

### 5. Outros comandos disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o ambiente de desenvolvimento |
| `npm run lint` | Executa a verificação estática com ESLint |
| `npm run build` | Executa a compilação TypeScript e gera o build de produção |
| `npm run preview` | Permite visualizar localmente o build |

---

## 🗄️ Banco de dados

O projeto utiliza PostgreSQL por meio do Supabase.

O arquivo [`database/schema.sql`](database/schema.sql) contém a estrutura do schema `public` utilizada pela aplicação, incluindo tabelas, relacionamentos, funções, triggers, restrições e políticas de segurança.

O script documenta a estrutura do banco e suas regras de negócio.

**Observação:** a aplicação também depende dos serviços gerenciados do Supabase, especialmente o Supabase Auth. Para reproduzir o sistema em outro projeto, é necessário configurar esses serviços e criar usuários autorizados com os perfis correspondentes na tabela `public.usuarios`.

O script de estrutura não contém as senhas dos usuários nem os registros de demonstração do banco hospedado.

---

## 🔎 Orientações para avaliação do projeto

Para avaliar o FutPlan, recomenda-se:

1. Acessar a versão publicada na Vercel.
2. Entrar utilizando uma das credenciais disponibilizadas no documento de entrega da AS.
3. Consultar os registros fictícios já cadastrados.
4. Navegar pelos módulos de alunos, turmas, matrículas e mensalidades.
5. Verificar as regras de matrícula, os filtros e as operações permitidas para cada perfil.
6. Consultar o código-fonte e o script SQL disponíveis neste repositório.

O ambiente de demonstração possui responsáveis, alunos, turmas, matrículas e mensalidades fictícios, incluindo exemplos de pagamentos realizados e pendentes.

Recomenda-se utilizar versões atualizadas dos navegadores Google Chrome, Microsoft Edge ou Mozilla Firefox.

---

## 📱 Responsividade e compatibilidade

A interface do FutPlan foi desenvolvida para se adaptar a diferentes tamanhos de tela.

A aplicação foi projetada para utilização em navegadores modernos, com foco em usabilidade, organização das informações e simplicidade de navegação.

---

## 🎓 Sobre o projeto

O FutPlan foi desenvolvido como projeto acadêmico com o objetivo de aplicar conhecimentos adquiridos durante a graduação em **Análise e Desenvolvimento de Sistemas**.

O sistema busca atender às necessidades essenciais de gestão de uma escolinha de futebol infantil, priorizando organização das informações, simplicidade de utilização, integridade dos dados e aplicação das regras de negócio definidas durante o projeto.