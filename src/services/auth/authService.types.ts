export type SignUpArgs = {
  email: string
  password: string
  userName: string
}

export type ErrorResponse = {
  error: string
  messages: ErrorMessage[]
  statusCode: number
}

export type ErrorMessage = {
  field: string
  message: string
}