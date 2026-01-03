import { OrderStatus } from "@entities/order"

export type CreateOrderInputDTO = {
	customer_id?: string
	total: number
	products: CreateOrderProductInputDTO[]
}

export type CreateOrderProductInputDTO = {
	product_id: string
	quantity: number
	price: number
}

export type CreateOrderOutputDTO = {
	id: string
	customer_id: string | null
	status: OrderStatus
	total: number
	created_at: number
	updated_at: number
	products: CreateOrderProductOutputDTO[]
}

export type CreateOrderProductOutputDTO = {
	product_id: string
	quantity: number
	price: number
}