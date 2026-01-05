export enum PaymentTopicType {
	StatusUpdate    = "payment_status_update",
	CreationSuccess = "payment_creation_success",
	CreationFailure = "payment_creation_failure",
}

export type PaymentStatusUpdateMessage = {
	type: PaymentTopicType.StatusUpdate
	external_id: string
	status: string
}

export type PaymentCreationSuccessMessage = {
	type: PaymentTopicType.CreationSuccess
	external_id: string
	code: string
}

export type PaymentCreationFailureMessage = {
	type: PaymentTopicType.CreationFailure
	external_id: string
	reason: string
}

export type PaymentTopicMessage =
	| PaymentStatusUpdateMessage
	| PaymentCreationSuccessMessage
	| PaymentCreationFailureMessage