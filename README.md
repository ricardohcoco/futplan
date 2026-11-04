# ⚽ FutPlan

O **FutPlan** é um sistema web desenvolvido para auxiliar na gestão de escolinhas de futebol infantil.

A aplicação centraliza o gerenciamento de alunos, responsáveis, turmas, matrículas e mensalidades, permitindo que as principais atividades administrativas da escolinha sejam realizadas em um único sistema.

Este projeto foi desenvolvido como Trabalho de Conclusão de Curso (TCC) do curso de Análise e Desenvolvimento de Sistemas.

## 🌐 Acesso ao sistema

O FutPlan está disponível em:

**Link:** [será adicionado após o deploy]

Para acessar o sistema, utilize as credenciais disponibilizadas para avaliação do projeto.

> O acesso é restrito a usuários autorizados. Não há cadastro público de usuários pela aplicação.

---

## 📖 Como utilizar o FutPlan

Após realizar o login, o usuário será direcionado ao **Dashboard**, que apresenta uma visão geral da situação atual da escolinha.

O menu superior permite acessar as principais áreas do sistema:

- **Início**
- **Alunos**
- **Turmas**
- **Matrículas**
- **Mensalidades**

### 1. Dashboard

Na página inicial são apresentados indicadores gerais do sistema:

- quantidade de alunos ativos;
- quantidade de turmas ativas;
- quantidade de matrículas ativas;
- mensalidades pagas e pendentes no mês atual;
- quantidade de mensalidades em atraso.

Caso existam mensalidades atrasadas, os detalhes podem ser consultados na página **Mensalidades**, utilizando o filtro **Atrasadas**.

---

### 2. Alunos e responsáveis

Na página **Alunos** é possível cadastrar e consultar os alunos da escolinha.

Antes de cadastrar um aluno, é necessário possuir um responsável cadastrado.

O cadastro do responsável solicita:

- nome;
- telefone;
- consentimento para tratamento dos dados pessoais.

Após o cadastro, o responsável pode ser localizado pelo campo de busca no formulário do aluno.

Para cadastrar um aluno, informe:

- nome;
- data de nascimento;
- endereço;
- escola;
- turno escolar;
- responsável;
- parentesco.

O sistema aceita alunos com idade entre **5 e 15 anos**.

A página também permite:

- pesquisar alunos pelo nome;
- visualizar alunos ativos e inativos;
- editar dados;
- inativar alunos;
- acessar os detalhes de cada aluno.

Na página de detalhes é possível consultar também a matrícula atual e o histórico de mensalidades do aluno.

---

### 3. Turmas

Na página **Turmas** é possível cadastrar e administrar as turmas disponíveis na escolinha.

Para cada turma são definidos dados como:

- nome;
- faixa etária;
- turno;
- horário;
- dias de treinamento;
- capacidade máxima.

Os treinamentos são organizados de segunda a sexta-feira nos períodos da manhã e da tarde.

Cada turma possui capacidade máxima de **20 alunos**.

Também é possível pesquisar, editar, consultar e inativar turmas.

---

### 4. Matrículas

Na página **Matrículas** é realizada a associação entre um aluno e uma turma.

Para criar uma matrícula:

1. pesquise o aluno pelo nome;
2. selecione o aluno desejado;
3. selecione uma turma disponível;
4. clique em **Cadastrar matrícula**.

O sistema aplica automaticamente as regras necessárias para a matrícula, incluindo:

- compatibilidade entre a idade do aluno e a faixa etária da turma;
- compatibilidade entre o turno escolar e o turno de treinamento;
- disponibilidade de vagas;
- existência de apenas uma matrícula ativa por aluno.

O aluno que estuda pela manhã deve treinar no período da tarde, enquanto o aluno que estuda à tarde deve treinar pela manhã.

As matrículas também podem ser encerradas sem apagar seu histórico.

---

### 5. Mensalidades

Na página **Mensalidades** é realizado o controle financeiro dos alunos.

O usuário com perfil **Gestor** pode:

- definir o valor padrão da mensalidade;
- gerar as mensalidades de um determinado mês.

O valor utilizado no momento da geração fica registrado na mensalidade.

As mensalidades podem ser consultadas utilizando filtros como:

- pendentes;
- atrasadas;
- pagas;
- todas.

Também é possível pesquisar pelo nome do aluno e filtrar pelo mês de referência.

O pagamento pode ser registrado diretamente na mensalidade. Ao realizar essa operação, a data do pagamento é registrada automaticamente pelo sistema.

> O registro de pagamento é definitivo no escopo atual do sistema.

---

## 👥 Perfis de acesso

O FutPlan possui dois perfis de usuário:

### Gestor

Possui acesso às funcionalidades administrativas do sistema, incluindo definição do valor da mensalidade e geração mensal das cobranças.

### Administrativo

Pode utilizar as funcionalidades operacionais do sistema e registrar pagamentos, mas não pode alterar o valor da mensalidade nem gerar novas mensalidades.

---

## 🔒 Segurança e privacidade

O acesso ao sistema exige autenticação.

O FutPlan utiliza controle de acesso aos dados e diferencia as permissões de acordo com o perfil do usuário.

O cadastro de responsáveis também registra o consentimento para tratamento dos dados pessoais utilizados pelo sistema.

Alunos, turmas e matrículas utilizam inativação ou encerramento quando necessário, permitindo preservar os registros históricos relacionados à operação da escolinha.

---

## 🛠️ Tecnologias utilizadas

O FutPlan foi desenvolvido utilizando:

- **React**
- **TypeScript**
- **Vite**
- **Supabase**
- **PostgreSQL**
- **CSS Modules**

O Supabase é utilizado para autenticação, persistência dos dados e execução das regras de acesso e operações do sistema.

---

## 📱 Compatibilidade

A interface do FutPlan foi desenvolvida de forma responsiva, permitindo sua utilização em diferentes tamanhos de tela.

Para a avaliação, recomenda-se utilizar uma versão atualizada de navegadores como Google Chrome, Microsoft Edge ou Mozilla Firefox.

---

## 🎓 Sobre o projeto

O FutPlan foi desenvolvido como projeto acadêmico com o objetivo de aplicar, em uma aplicação web completa, conhecimentos adquiridos durante a graduação em **Análise e Desenvolvimento de Sistemas**.

O sistema foi projetado para atender às necessidades essenciais de gestão de uma escolinha de futebol, priorizando simplicidade de utilização, organização das informações e aplicação das regras de negócio definidas para o projeto.