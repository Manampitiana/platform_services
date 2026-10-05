import api from './axios'

export const paymentsApi = {
  methods: () => api.get('/payment-methods').then((res) => res.data.data),

  create(orderUuid, { method, transaction_reference, proof }) {
    const formData = new FormData()
    formData.append('method', method)
    if (transaction_reference) formData.append('transaction_reference', transaction_reference)
    if (proof) formData.append('proof', proof)

    return api
      .post(`/orders/${orderUuid}/payments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data.data)
  },

  downloadProof: async (payment) => {
    const res = await api.get(`/payments/${payment.id}/proof`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  },
}