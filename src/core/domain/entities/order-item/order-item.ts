import { OrderItemsOutputDTO } from "@dto/order"
import { randomUUID } from "node:crypto"

export class OrderItem {
  id: string
  product_id: string
  order_id: string
  quantity: number
  price: number

  constructor({
    id,
    productId,
    orderId,
    quantity,
    price,
  }: {
    id: string,
    productId: string,
    orderId: string,
    quantity: number,
    price: number,
  }) {
    this.id = id
    this.product_id = productId
    this.order_id = orderId
    this.quantity = quantity
    this.price = price
  }

  static create(
    orderId: string,
    productId: string,
    quantity: number,
    price: number,
  ): OrderItem {
    return new OrderItem({
      id: randomUUID(),
      productId,
      orderId,
      quantity,
      price,
    })
  }

  toOutputDTO(): OrderItemsOutputDTO {
    return {
      product_id: this.product_id,
      quantity: this.quantity,
      price: this.price,
    }
  }
}