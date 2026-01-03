import { SMClientWrapper } from "@aws/sm_client";
import { AwsRegion, AwsStage } from "@aws/utils";
import { HTTPPreconditionFailed } from "@utils/http";

const SECRET_ID = process.env.DB_SECRET_ARN || '';

export type RDSCredentials = {
  host: string;
  user: string;
  password: string;
  pool?: {
    min: number;
    max: number;
  },
  useSsl?: boolean;
};

export async function getCredentialsFromRDSSecretManager(
  smClient: SMClientWrapper,
): Promise<RDSCredentials> {
  const secretString = await smClient.getSecretValue(SECRET_ID);

  const credentials = JSON.parse(secretString);

  return {
    host: process.env.DB_HOST!,
    user: credentials.username,
    password: credentials.password,
    pool: {
      min: 2,
      max: 10,
    },
    useSsl: true,
  };
}

export async function getRDSCredentials(
  region: AwsRegion,
  stage: AwsStage,
): Promise<RDSCredentials> {
  if (stage === AwsStage.Local) {
    return {
      host: 'host.docker.internal',
      user: 'root',
      password: 'root',
    }
  }

  const smClient = new SMClientWrapper(region, stage);

  if (!process.env.DB_SECRET_ARN) {
    throw new HTTPPreconditionFailed('DB_SECRET_ARN environment variable is not set');
  }

  if (!process.env.DB_HOST) {
    throw new HTTPPreconditionFailed('DB_HOST environment variable is not set');
  }

  return getCredentialsFromRDSSecretManager(smClient);
}