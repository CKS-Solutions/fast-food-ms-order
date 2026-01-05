import { UpdateOrderStatusContainerFactory } from "@di/update_order_status"
import { OrderStatus } from "@entities/order"
import { getRegion, getStage } from "@utils/env"
import { HTTPBadRequest, HTTPError, HTTPInternalServerError, HTTPSuccessResponse } from "@utils/http"
import { getRDSCredentials } from "@utils/rds"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const orderId = event.pathParameters?.orderId
    if (!orderId) {
      throw new HTTPBadRequest("orderId path parameter is required")
    }

    const stage = getStage()
    const region = getRegion()

    const rdsCredentials = await getRDSCredentials(region, stage)
    const container = new UpdateOrderStatusContainerFactory(rdsCredentials)

    const res = await container.usecase.execute(orderId, OrderStatus.Cancelled)

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