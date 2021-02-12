import { ProductLine, Invoice } from './types'

export const initialProductLine: ProductLine = {
  no: '1',
  description: '',
  quantity: '1',
  rate: '0.00',
}




export const initialInvoice: Invoice = {
  title: 'INVOICE',
  companyName: 'Pineapple Exclusive',
  companySubtitle: '(Keep trust on ourselves, glorify yourself)',
  companyContact: 'Contact:     01884519601, 01913374682',
  name: '',
  companyAddress: 'Address:     217,   MPL ,   Hatirpool ,   Dhaka',
  companyAddress2: '',
  companyCountry: 'Bangladesh',
  billTo: 'Bill To:',
  clientName: '',
  clientAddress: '',
  clientAddress2: '',
  clientPhone: '',
  clientCountry: 'Bangladesh',
  invoiceTitleLabel: 'Invoice#',
  invoiceTitle: '',
  invoiceDateLabel: 'Invoice Date',
  invoiceDate: '',
  invoiceDueDateLabel: 'Due Date',
  invoiceDueDate: '',
  productLineNo: 'No',
  productLineDescription: 'Product Name',
  productLineQuantity: 'Qty',
  productLineQuantityRate: 'Rate',
  productLineQuantityAmount: 'Amount',
  productLines: [
    // {
    //   description: 'Brochure Design',
    //   quantity: '2',
    //   rate: '100.00',
    // },
    { ...initialProductLine },
    // { ...initialProductLine },
  ],
  subTotalLabel: 'Sub Total',
  taxLabel: 'Sale Tax (10%)',
  paidLabel: 'Paid',
  totalLabel: 'TOTAL DUE',
  currency: '৳',
  notesLabel: 'Payment and Delivery procedures',
  termLabel: 'Terms & Conditions',
  term: 'Please make the payment by the due date.',
}
