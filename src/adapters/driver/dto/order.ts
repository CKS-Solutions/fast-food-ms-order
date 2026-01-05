export type OrderOutputDTO = {
  id: string
  customer_id: string | null
  status: string
  total: number
  created_at: number
  create_at_date: string
  updated_at: number
  updated_at_date: string
  items: OrderItemsOutputDTO[]
  logs: OrderLogOutputDTO[]
}

export type OrderItemsOutputDTO = {
  product_id: string
  quantity: number
  price: number
}

export type OrderLogOutputDTO = {
  status: string
  changed_at: number
  changed_at_date: string
}