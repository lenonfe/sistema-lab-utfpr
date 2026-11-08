# Manual do Usuário — Sistema Lab UTFPR

Este manual apresenta as funcionalidades disponíveis na versão atual do Sistema Lab UTFPR e orienta os usuários nas operações mais comuns.

## 1. Acesso ao sistema

1. Abra o endereço do sistema fornecido pela equipe responsável.
2. Informe seu e-mail e sua senha.
3. Clique em **Entrar**.
4. Para encerrar, selecione **Sair** no menu lateral.

Na primeira inicialização, se o banco de dados estiver vazio, o sistema cria contas de demonstração:

| Perfil | E-mail | Senha |
|---|---|---|
| Aluno | `lenon@alunos.utfpr.edu.br` | `123` |
| Estagiário | `suporte@utfpr.edu.br` | `123` |
| Chefe | `chefe@utfpr.edu.br` | `123` |
| Professor | `prof@utfpr.edu.br` | `123` |

As contas acima são destinadas à demonstração. Em uso institucional, utilize as credenciais fornecidas pela equipe responsável.

## 2. Navegação e perfis

Depois do login, o menu lateral permite acessar o **Dashboard**, **Abrir Chamado**, **Solicitar Software**, **Reservar Equip.**, **Realizar Vistoria**, **Histórico** e **Sair**. As opções visíveis dependem do perfil:

- **Aluno:** pode abrir chamados e solicitar reservas; consulta os próprios registros.
- **Professor:** pode abrir chamados, solicitar reservas e solicitar software; consulta os próprios registros.
- **Estagiário:** atende chamados e solicitações de software e pode acessar a área de vistoria.
- **Chefe:** acompanha indicadores, analisa reservas e consulta solicitações pendentes.

O Dashboard apresenta informações e ações diferentes conforme o perfil conectado.

## 3. Abrir um chamado técnico

1. Selecione **Abrir Chamado**.
2. Escolha o laboratório ou a sala onde está o problema.
3. Descreva a ocorrência com clareza, incluindo o equipamento envolvido e o que aconteceu.
4. Clique em **Abrir Chamado**.
5. Acompanhe o status no Dashboard ou em **Histórico**.

A equipe pode assumir um chamado pendente, alterando-o para **Em Andamento**, e marcá-lo como **Concluído** após o atendimento.

## 4. Reservar um equipamento

1. Selecione **Reservar Equip.**.
2. Escolha o equipamento na lista. O patrimônio é exibido junto ao nome.
3. Informe a data e o horário de retirada.
4. Informe a data e o horário de devolução.
5. Clique em **Reservar**.
6. Acompanhe a solicitação no Dashboard ou em **Histórico**.

A solicitação começa com o status **Pendente**. O Chefe pode aprová-la ou recusá-la. Se for recusada, o motivo informado pode aparecer junto ao registro.

## 5. Solicitar a instalação de um software

Esta funcionalidade está disponível para os perfis **Chefe** e **Professor**.

1. Selecione **Solicitar Software**.
2. Informe o nome do software.
3. Escolha o laboratório de destino.
4. Se o campo estiver disponível, informe um computador específico.
5. Informe o prazo desejado.
6. Clique em **Solicitar**.
7. Acompanhe o andamento no Dashboard ou em **Histórico**.

A solicitação é registrada como **Pendente**. A equipe pode marcá-la como **Instalado** após concluir a instalação.

## 6. Atender chamados e solicitações

### Chamados técnicos

1. No Dashboard da equipe, localize a lista de chamados.
2. Clique em **Ver** para consultar os detalhes.
3. Se o chamado estiver pendente, clique em **Assumir** para iniciar o atendimento.
4. Ao concluir o serviço, clique em **Concluir**.

### Solicitações de software

Na lista de instalações pendentes do Dashboard, a equipe pode selecionar **Instalado** depois de realizar a instalação.

## 7. Analisar reservas

O perfil **Chefe** pode analisar reservas pendentes pelo Dashboard:

- Use a ação de aprovação para aprovar a reserva.
- Use a ação de recusa e informe o motivo quando solicitado.

O resultado da análise fica visível no registro da reserva.

## 8. Vistorias de retirada e devolução

A área **Realizar Vistoria** é apresentada aos perfis de equipe. A tela permite escolher o tipo de vistoria, informar o patrimônio do equipamento, buscar a reserva correspondente e selecionar uma imagem ou vídeo como evidência.

> **Importante:** na versão atual, o envio da vistoria pela interface está implementado como simulação. Não considere o registro ou o arquivo enviado como persistido; confirme com a equipe responsável se a funcionalidade já foi ativada.

## 9. Consultar o histórico

1. Selecione **Histórico** no menu lateral.
2. Consulte os registros de chamados, reservas e solicitações de software, incluindo data, descrição e status.

Alunos e Professores visualizam os próprios registros. Perfis de equipe podem consultar registros de outros usuários para fins de atendimento.

## 10. Gerar relatório PDF

No cabeçalho do painel, clique em **Relatório Completo** para gerar e baixar um PDF com os registros disponíveis. Para Alunos e Professores, o relatório apresenta somente os registros próprios.

## 11. Significado dos status

- **Pendente:** aguardando análise ou atendimento.
- **Aprovado:** reserva autorizada.
- **Em Uso:** equipamento registrado como retirado.
- **Em Andamento:** chamado em atendimento.
- **Concluído / Concluída:** chamado ou reserva finalizado(a).
- **Recusado:** solicitação não aprovada.
- **Instalado:** software marcado como instalado.

## 12. Problemas comuns

- **Login inválido:** confira o e-mail e a senha com a equipe responsável.
- **Erro de conexão:** verifique se o sistema está disponível e tente novamente; se persistir, contate o suporte.
- **Equipamento ou reserva não aparece:** confirme os dados informados e solicite ajuda à equipe.
- **Status não atualiza:** atualize a página ou consulte novamente mais tarde.

Ao reportar um problema, informe seu perfil, a tela em que ocorreu e o que aconteceu. Evite enviar senhas em mensagens de suporte.
