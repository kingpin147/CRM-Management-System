import { describe, expect, it } from 'vitest'
import { getActiveHouseCount, isActiveCustomerStatus } from './ManagementDashboardView'

describe('management dashboard active customer filtering', () => {
  it('treats only active customer statuses as active houses', () => {
    expect(isActiveCustomerStatus('CONNECTION_ACTIVE')).toBe(true)
    expect(isActiveCustomerStatus('FOC_CONNECTION')).toBe(true)
    expect(isActiveCustomerStatus('IN_HOUSE_CONNECTION')).toBe(true)
    expect(isActiveCustomerStatus('PENDING_ACTIVATION')).toBe(false)
    expect(isActiveCustomerStatus('NON_PAYMENT_BLOCKED')).toBe(false)
  })

  it('counts only active status customers for active houses', () => {
    const customers = [
      { id: '1', status: 'CONNECTION_ACTIVE' },
      { id: '2', status: 'FOC_CONNECTION' },
      { id: '3', status: 'PENDING_ACTIVATION' },
      { id: '4', status: 'NON_PAYMENT_BLOCKED' },
      { id: '5', status: 'TEMPORARY_BLOCKED' },
    ]

    expect(getActiveHouseCount(customers)).toBe(2)
  })
})
