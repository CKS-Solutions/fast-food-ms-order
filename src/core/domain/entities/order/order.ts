import { randomUUID } from "node:crypto"
import { OrderStatus } from "./order.types"
import { OrderOutputDTO } from "@dto/order"

export class Order {
	id: string
	customer_id?: string
	status: OrderStatus
	total: number
	created_at: number
	updated_at: number

	constructor({
		id,
		customerId,
		status,
		total,
		createdAt,
		updatedAt,
	}: {
		id: string,
		customerId?: string,
		status: OrderStatus,
		total: number,
		createdAt: number,
		updatedAt: number,
	}) {
		this.id = id
		this.customer_id = customerId
		this.status = status
		this.total = total
		this.created_at = createdAt
		this.updated_at = updatedAt
	}

	static create(total: number, customerId?: string): Order {
		return new Order({
			id: randomUUID(),
			customerId,
			status: OrderStatus.WaitingPayment,
			total,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		})
	}

	updateStatus(status: OrderStatus): void {
		this.status = status
		this.updated_at = Date.now()
	}

	toOutputDTO(): OrderOutputDTO {
		return {
			id: this.id,
			customer_id: this.customer_id || null,
			status: this.status,
			total: this.total,
			created_at: this.created_at,
			create_at_date: new Date(Number(this.created_at)).toISOString(),
			updated_at: this.updated_at,
			updated_at_date: new Date(Number(this.updated_at)).toISOString(),
			items: [],
			logs: [],
		}
	}
}
