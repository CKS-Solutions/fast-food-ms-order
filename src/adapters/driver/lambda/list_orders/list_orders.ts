import { ListOrdersContainerFactory } from "@di/list_orders"
import { getRegion, getStage } from "@utils/env"
import { HTTPError, HTTPInternalServerError, HTTPSuccessResponse } from "@utils/http"
import { getRDSCredentials } from "@utils/rds"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const limit = event.queryStringParameters?.limit ? parseInt(event.queryStringParameters.limit, 10) : 10
    const page = event.queryStringParameters?.page ? parseInt(event.queryStringParameters.page, 10) : 1

    const stage = getStage()
    const region = getRegion()

    const rdsCredentials = await getRDSCredentials(region, stage)
    const container = new ListOrdersContainerFactory(rdsCredentials)

    const res = await container.usecase.execute({
      page,
      limit
    })

    return new HTTPSuccessResponse(res).toLambdaResponse()
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