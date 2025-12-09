# Desafio técnico Front-End Pleno

## 📝 Desafio:

Você foi contratado para atuar no desenvolvimento do sistema de agendamento de uma rede de academias. Este aplicativo consome as APIs e precisa ser altamente performático, especialmente na tela de a**genda de aulas**, que é o recurso mais acessado da plataforma, com alta concorrência e grande volume de dados. A empresa realizou um levantamento e identificou que **85% dos acessos serão realizados por dispositivos móveis**, enquanto **15% dos usuários utilizarão computadores;**

## 💻 Funcionalidades esperadas:

- **Cadastro de alunos**
    - Listagem dos alunos cadastrados;
    - Formulário para cadastrar/editar alunos:
        - Nome (obrigatório);
        - Data de nascimento (obrigatório);
        - CPF;
        - Cidade;
        - Bairro;
        - Endereço;
        - Tipo de plano: `Mensal`, `Trimestral`, `Anual`;  (obrigatório)
- **Cadastro de aulas**
    - Formulário para cadastrar/editar aulas:
        - Descrição (obrigatório);
        - Tipo da aula (ex: Cross, Funcional, Pilates)(obrigatório);
        - Data e hora (obrigatório);
        - Capacidade máxima de participantes (obrigatório);
        - Status: (aberta, conclúida) (obrigatório);
        - Se permite agendamento após o inicio da aula (obrigatório);
    - Listagem das aulas cadastradas por dia, apresentando:
        - Horário;
        - Descrição da aula
        - Quantidade de alunos agendados;
        - Capacidade máxima da aula;
        - Status
    - Modal ou tela de detalhes da aulas , para ser possível:
        - Visualizar informações da agenda;
        - Visualizar os participantes da agenda;
        - Adicionar/remover um participante da agenda;
        - Finalizar a aula;

## ⚙️ Regras de Negócio para aplicar no front-end:

- Uma aula **não pode ultrapassar** a capacidade máxima de participantes;
- Uma aula não pode receber novos participantes pós finalizada;
- Novos participantes só podem ser adicionados após o início da aula, caso o agendamento pós-início esteja habilitado para a aula.

## 🎯 Objetivo do desafio

Você deverá desenvolver focando em:

- **Validação segura para os formulários de cadastro;**
- **Performance** no carregamento e renderização;
- **Escalabilidade** para suportar altos volumes de dados (paginação, carregamento sob demanda, etc.).
- **Experiência do usuário fluida**, mesmo em situações de conexão lenta ou dados massivos.

## 🧪 Requisitos técnicos:

- Projeto em **React.js (Next.JS, Vite, etc..);**

## ℹ️ Informações adicionais:

- Pode ser Single Page Application (SPA) simples;
- Não é necessário backend: Você pode simular uma API e salvar os dados localmente;
- Fique à vontade para utilizar bibliotecas de gerenciamento de estado (Redux, Zustand, Context API, etc.), caso julgue necessário;
- Apesar de não ser necessário integrar com uma API real, fique à vontade para simular requisições utilizando **Axios**, **Fetch API**, ou outras ferramentas, caso considere importante para a organização ou estrutura do projeto.
- Este é um teste técnico. Apesar de ser simples, use todo o seu conhecimento e criatividade. Queremos ver **qualidade de código, organização, escalabilidade e boas práticas;**
- Evite o uso excessivo de IA;
- Este teste foi pensado para ser concluído em poucas horas, mas você terá um prazo de até 3 dias para entregar com tranquilidade;

## 📬 Forma de envio:

- Subir o projeto no GitHub e enviar o link para avaliação;