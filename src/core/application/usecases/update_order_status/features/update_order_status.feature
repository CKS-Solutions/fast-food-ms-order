Feature: Atualização de Status de Pedido
  Como um sistema de gestão de pedidos
  Eu quero atualizar o status de um pedido
  Para rastrear o progresso do pedido através do fluxo de produção

  Scenario: Atualizar status de pedido seguindo o fluxo correto
    Given que existe um pedido com id "order-1" com status "received"
    When eu atualizo o status do pedido "order-1" para "in_preparation"
    Then o status do pedido deve ser atualizado para "in_preparation"
    And um log de status deve ser criado
    And uma mensagem de sucesso deve ser retornada

  Scenario: Tentar atualizar status de pedido inexistente
    Given que não existe um pedido com id "order-999"
    When eu atualizo o status do pedido "order-999" para "in_preparation"
    Then deve ser lançado um erro HTTPNotFound
    And a mensagem de erro deve ser "Order not found"

  Scenario: Tentar atualizar status de pedido finalizado
    Given que existe um pedido com id "order-2" com status "finished"
    When eu atualizo o status do pedido "order-2" para "ready"
    Then deve ser lançado um erro HTTPBadRequest
    And a mensagem de erro deve ser "Cannot change status of a finished or cancelled order"

  Scenario: Tentar atualizar status de pedido cancelado
    Given que existe um pedido com id "order-3" com status "cancelled"
    When eu atualizo o status do pedido "order-3" para "ready"
    Then deve ser lançado um erro HTTPBadRequest
    And a mensagem de erro deve ser "Cannot change status of a finished or cancelled order"

  Scenario: Tentar pular etapas do fluxo de status
    Given que existe um pedido com id "order-4" com status "received"
    When eu atualizo o status do pedido "order-4" para "ready"
    Then deve ser lançado um erro HTTPBadRequest
    And a mensagem de erro deve indicar que não é possível mudar de "received" para "ready"

  Scenario: Cancelar pedido em andamento
    Given que existe um pedido com id "order-5" com status "in_preparation"
    When eu atualizo o status do pedido "order-5" para "cancelled"
    Then o status do pedido deve ser atualizado para "cancelled"
    And um log de status deve ser criado
    And uma mensagem de cancelamento deve ser retornada

  Scenario: Tentar atualizar para o mesmo status
    Given que existe um pedido com id "order-6" com status "received"
    When eu atualizo o status do pedido "order-6" para "received"
    Then deve ser lançado um erro HTTPBadRequest
    And a mensagem de erro deve ser "Order is already in the specified status"

