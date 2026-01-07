import { SMClientWrapper } from "@aws/sm_client";
import { AwsRegion, AwsStage } from "@aws/utils";

const SECRET_ID = 'rds/fast-food-database-credentials';

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
    host: credentials.host,
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

  return getCredentialsFromRDSSecretManager(smClient);
}