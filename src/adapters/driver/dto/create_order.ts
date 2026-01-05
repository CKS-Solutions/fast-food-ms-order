export type CreateOrderInputDTO = {
	customer_id?: string
	products: CreateOrderProductInputDTO[]
}

export type CreateOrderProductInputDTO = {
	product_id: string
	quantity: number
	price: number
}