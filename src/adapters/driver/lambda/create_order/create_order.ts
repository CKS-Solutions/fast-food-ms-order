import { APIGatewayProxyResult, SQSEvent } from "aws-lambda"

import { HTTPError, HTTPNotFound, HTTPSuccessResponse } from "@utils/http"
import { CreateOrderContainerFactory } from "@di/create_order"
import { CreateOrderInputDTO } from "@dto/create_order"
import { getRegion, getStage } from "@utils/env"
import { getRDSCredentials } from "@utils/rds"

export async function handler(event: SQSEvent): Promise<APIGatewayProxyResult> {
	try {
		if (event.Records.length === 0) {
			console.log("No SQS records received")
			throw new HTTPNotFound("No records found")
		}

		const stage = getStage()
		const region = getRegion()

		const rdsCredentials = await getRDSCredentials(region, stage)
		const container = new CreateOrderContainerFactory(rdsCredentials, stage, region)

		const record = JSON.parse(event.Records[0].body) as CreateOrderInputDTO
		const res = await container.usecase.execute(record)

		return new HTTPSuccessResponse(res).toLambdaResponse()
	} catch (error) {
		if (error instanceof HTTPError) {
			return error.toLambdaResponse()
		}

		console.error("Unexpected error:", error)

		const genericError = new HTTPError("Internal Server Error", 500)
		return genericError.toLambdaResponse()
	}
}