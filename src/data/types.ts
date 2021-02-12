import { CSSProperties } from 'react'

export interface ProductLine {
  no: string
  description: string
  quantity: string
  rate: string
}

// export interface Notes {
//   no: string
//   description: string
// }

export interface Invoice {
  title: string
  companyName: string
  companySubtitle: string
  companyContact: string
  name: string
  companyAddress: string
  companyAddress2: string
  companyCountry: string

  billTo: string
  clientName: string
  clientAddress: string
  clientAddress2: string
  clientPhone: string
  clientCountry: string

  invoiceTitleLabel: string
  invoiceTitle: string
  invoiceDateLabel: string
  invoiceDate: string
  invoiceDueDateLabel: string
  invoiceDueDate: string

  productLineNo: string
  productLineDescription: string
  productLineQuantity: string
  productLineQuantityRate: string
  productLineQuantityAmount: string

  productLines: ProductLine[]

  subTotalLabel: string
  taxLabel: string
  paidLabel: string

  totalLabel: string
  currency: string

  notesLabel: string
  termLabel: string
  term: string
}

export interface CSSClasses {
  [key: string]: CSSProperties
}
