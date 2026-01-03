import { SQSClient } from "@aws-sdk/client-sqs"
import { AwsRegion, AwsStage, newAwsConfig } from "../utils"

export class SQSClientWrapper extends SQSClient {
	constructor(region: AwsRegion, stage: AwsStage) {
		const config = newAwsConfig(region, stage)
		super(config)
	}
}