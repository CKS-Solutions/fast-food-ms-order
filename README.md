# MS-Order

Serviço designado a criar e atualizar os pedidos gerados pelo sistema

### Estrutura

<img width="660" height="323" alt="image" src="https://github.com/user-attachments/assets/6ec0cc1b-de42-4238-8d4b-275480045175" />

### Serviços oferecidos/consumidos

<img width="629" height="430" alt="image" src="https://github.com/user-attachments/assets/c433e2f7-5fce-448d-9cee-de70eb1fe5eb" />

### Evidencia de testes Sonar

<img width="1919" height="916" alt="image" src="https://github.com/user-attachments/assets/5c9fd134-69d9-4aff-9240-ba81bd8a6f00" />

### Estrutura de arquivos

```
.
├── serverless.yml # Definição da infraestrutura do projeto utilizando Serverless Framework
├── docker-compose.yml # Configuração de contâineres para rodar o projeto local
└── src
    ├── adapters/
        ├── driven # Serviços consumidos (Ex: RDS, SNS)
        └── driver # Serviços oferecidos (Ex: API HTTP usando Lambda + API Gateway)
    ├── core/
        ├── application/usecases # Regras de negócio
        └── domain
            ├── entities # Entidades do serviço
            └── ports # Definição de contratos para consumo/oferecimento de serviços
    ├── infra/
        ├── aws # Wrappers de clientes da AWS para consumo posterior
        └── di # Classes de preparação do usecase para execução
    └── utils
```

### Pré-requisitos

* Node 20
* Docker
* AWS Cli

### Rodando local

Para rodar localmente siga o passo-a-passo abaixo:

#### 1. Instalando dependências

```bash
npm install
```

#### 2. Subindo contâiner Docker

Será criado um contâiner de um banco Postgres para testes locais

```bash
docker compose up -d
```

#### 3. Configurar credenciais AWS

Procure em sua máquina onde fica armazenado o arquivo de credentials da AWS (No Linux geralmente fica em ~/.aws/credentials)

Garanta que haja um registro assim no seu arquivo:
```bash
[default]
aws_access_key_id = key
aws_secret_access_key = secret
```

#### 4. Requisito

Para que o deploy e a função `sendForFollowUp` funcione é necessário deployar primeiro o `ms-payment`, pois essa função se inscreve em um tópico criado pelo microsserviço de pagamentos

#### 5. Deploy

Ao finalizar o deploy irá ser mostrado no console os endpoint criados que pode ser copiado para um Postman ou Insomnia para testes

```bash
npx sls deploy --stage local
```

Obs: se for preciso alterar algo no projeto, é necessário remover o serviço do localstack e deployar novamente. Para remover use:
```bash
npx sls remove --stage local
```
