import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager"
import { AwsRegion, AwsStage, newAwsConfig } from "../utils"

export class SMClientWrapper extends SecretsManagerClient {
	constructor(region: AwsRegion, stage: AwsStage) {
		const config = newAwsConfig(region, stage)
		super(config)
	}

	async getSecretValue(secretId: string): Promise<string> {
		const command = new GetSecretValueCommand({
			SecretId: secretId,
		})

		const response = await this.send(command)

		if (!response.SecretString) {
			throw new Error(`Secret ${secretId} has no SecretString`)
		}

		return response.SecretString
	}
}