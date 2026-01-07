#!/bin/bash

set -e

REGION="us-east-1"

RDS_HOSTNAME=${1}
RDS_USERNAME=${2}
RDS_PASSWORD=${3}

if [ -z "$RDS_HOSTNAME" ] || [ -z "$RDS_USERNAME" ] || [ -z "$RDS_PASSWORD" ]; then
  echo "Uso: $0 <RDS_HOSTNAME> <RDS_USERNAME> <RDS_PASSWORD>"
  exit 1
fi

echo "🔐 Criando secrets no LocalStack Secrets Manager..."

EXISTING_SECRETS=$(aws secretsmanager list-secrets --region $REGION --query 'SecretList[].Name' --output text)

if echo "$EXISTING_SECRETS" | grep -q "rds/fast-food-database-credentials"; then
  echo "⚠ Secret 'rds/fast-food-database-credentials' já existe. Abortando."
  exit 1
fi

aws secretsmanager create-secret \
  --name rds/fast-food-database-credentials \
  --region $REGION \
  --secret-string '{"host":"'"$RDS_HOSTNAME"'","username":"'"$RDS_USERNAME"'","password":"'"$RDS_PASSWORD"'"}'

echo "✔ Secret 1 criado: rds/fast-food-database-credentials"
