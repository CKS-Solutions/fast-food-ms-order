import { SendForFollowUpContainerFactory } from "@di/send_for_follow_up"
import { getRegion, getStage } from "@utils/env"
import { HTTPError, HTTPInternalServerError, HTTPNotFound, HTTPSuccessResponse } from "@utils/http"
import { getRDSCredentials } from "@utils/rds"
import { APIGatewayProxyResult, SNSEvent } from "aws-lambda"

export async function handler(event: SNSEvent): Promise<APIGatewayProxyResult> {
  try {
    if (event.Records.length === 0) {
      console.log("No SNS records received")
      throw new HTTPNotFound("No records found")
    }

    const message = event.Records[0].Sns.Message

    const stage = getStage()
    const region = getRegion()

    const rdsCredentials = await getRDSCredentials(region, stage)
    const container = new SendForFollowUpContainerFactory(rdsCredentials)

    await container.usecase.execute(message)

    return new HTTPSuccessResponse(null).toLambdaResponse()
  } catch (error) {
    if (error instanceof HTTPError) {
      console.error("HTTP error occurred:", error.message)
      return error.toLambdaResponse()
    }

    console.error("Unexpected error:", error)

    const genericError = new HTTPInternalServerError("Internal Server Error")
    return genericError.toLambdaResponse()
  }
}