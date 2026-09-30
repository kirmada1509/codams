# FastFeet API

Neste projeto você irá desenvolver uma API para a transportadora fictícia FastFeet. Essa aplicação deve gerenciar o ciclo completo das encomendas, implementando regras de negócio como permissões para administradores e entregadores, e a exigência de foto para confirmar a entrega.

## Checklist de Tarefas

Use este checklist para ajudar a organizar a sua entrega:

- [x] Criar os dois tipos de usuário: 'admin' e 'entregador'
- [x] Implementar um sistema de login com CPF e Senha
- [x] Desenvolver o CRUD (Criar, Ler, Atualizar, Deletar) dos entregadores, com acesso restrito a usuários 'admin'
- [x] Desenvolver o CRUD dos destinatários, com acesso restrito a usuários 'admin'
- [x] Desenvolver o CRUD das encomendas, com acesso restrito a usuários 'admin'
- [x] Implementar a funcionalidade para alterar a senha de qualquer usuário, com acesso restrito a usuários 'admin'
- [x] Implementar a funcionalidade para marcar uma encomenda como "aguardando" (disponível para retirada)
- [x] Implementar a funcionalidade para um entregador registrar a "retirada" de uma encomenda
- [x] Implementar a funcionalidade para marcar uma encomenda como "entregue", exigindo o envio de uma foto e garantindo que apenas o entregador que a retirou possa fazer a marcação
- [x] Implementar a funcionalidade para marcar uma encomenda como "devolvida"
- [x] Desenvolver a listagem de encomendas com endereços próximos à localização do entregador
- [x] Desenvolver a listagem das entregas de um entregador, garantindo que ele só possa ver as suas próprias
- [x] Implementar o envio de notificação ao destinatário a cada alteração no status da sua encomenda

## Instruções

### Estrutura, Regras e Requisitos do Projeto

Você será responsável por desenvolver a API (backend) da FastFeet (transportadora fictícia). Esta API gerenciará o cadastro de usuários (administradores e entregadores), o fluxo de encomendas e o registro de destinatários.

A API deve seguir um conjunto de funcionalidades e regras de negócio.

### Funcionalidades da Aplicação

[x] A aplicação deve ter dois tipos de usuário, entregador e/ou admin
[x] Deve ser possível realizar login com CPF e Senha
[x] Deve ser possível realizar o CRUD dos entregadores
[x] Deve ser possível realizar o CRUD das encomendas
[x] Deve ser possível realizar o CRUD dos destinatários
[x] Deve ser possível marcar uma encomenda como aguardando (Disponível para retirada)
[x] Deve ser possível retirar uma encomenda
[x] Deve ser possível marcar uma encomenda como entregue
[x] Deve ser possível marcar uma encomenda como devolvida
[x] Deve ser possível listar as encomendas com endereços de entrega próximo ao local do entregador
[x] Deve ser possível alterar a senha de um usuário
[x] Deve ser possível listar as entregas de um usuário
[ ] Deve ser possível notificar o destinatário a cada alteração no status da encomenda

### Regras de Negócio

[x] Somente usuário do tipo admin pode realizar operações de CRUD nas encomendas
[x] Somente usuário do tipo admin pode realizar operações de CRUD dos entregadores
[x] Somente usuário do tipo admin pode realizar operações de CRUD dos destinatários
[x] Para marcar uma encomenda como entregue é obrigatório o envio de uma foto
[x] Somente o entregador que retirou a encomenda pode marcar ela como entregue
[x] Somente o admin pode alterar a senha de um usuário
[x] Não deve ser possível um entregador listar as encomendas de outro entregador

## Conceitos que Pode Praticar

Este desafio foi desenhado para que você possa exercitar e aprofundar seus conhecimentos em:

- **Arquitetura**: Clean Architecture para criar um sistema robusto e escalável
- **Segurança**: Autenticação e Autorização baseada em papéis (Role-Based Access Control - RBAC) para proteger suas rotas
- **Qualidade de Código**: Implementação de testes unitários e de ponta a ponta (E2E) para garantir a confiabilidade da API
- **Integrações**: Simulação de integração com serviços externos (ex: serviço de notificação)
