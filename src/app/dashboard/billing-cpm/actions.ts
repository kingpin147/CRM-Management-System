'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { CustomerStatus } from '@prisma/client'

// 1. Search Customer by ID, Code, Name, Phone, CNIC, or CRF
export async function searchCustomerForBilling(query: string) {
  try {
    if (!query || !query.trim()) {
      return { error: 'Please provide a Customer ID or Name.' }
    }

    const trimmed = query.trim()
    const digitsOnly = trimmed.replace(/\D/g, '')

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { id: trimmed },
          { customerCode: trimmed },
          ...(digitsOnly ? [
            { customerCode: digitsOnly },
            { contactNumber: { contains: digitsOnly } },
          ] : []),
          { crfNumber: trimmed },
          { cnic: trimmed },
          { fullName: { contains: trimmed, mode: 'insensitive' } },
          { contactNumber: { contains: trimmed, mode: 'insensitive' } },
        ]
      },
      include: {
        packagePlan: true,
        solarSystem: true,
        invoices: {
          orderBy: { createdAt: 'desc' }
        },
        transactions: {
          orderBy: { createdAt: 'desc' }
        },
        ledgerEntries: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!customer) {
      return { error: `Customer '${trimmed}' not found.` }
    }

    // Get financial statistics
    const totalInvoiced = (customer.invoices || []).reduce((acc: number, inv: any) => acc + (Number(inv.totalAmount) || 0), 0)
    const totalPaid = (customer.transactions || []).reduce((acc: number, tx: any) => acc + (Number(tx.amount) || 0), 0)
    const currentBalance = customer.ledgerEntries[0]?.balance 
      ? Number(customer.ledgerEntries[0].balance) 
      : (totalInvoiced - totalPaid)

    return {
      success: true,
      customer: {
        id: customer.id,
        customerCode: customer.customerCode,
        crfNumber: customer.crfNumber,
        fullName: customer.fullName,
        contactNumber: customer.contactNumber,
        email: customer.email,
        cnic: customer.cnic,
        customerType: customer.customerType,
        address: customer.address,
        subArea: customer.subArea,
        area: customer.area,
        city: customer.city,
        status: customer.status,
        currentBalance,
        totalInvoiced,
        totalPaid,
        packagePlan: customer.packagePlan ? {
          systemSizeKw: customer.packagePlan.systemSizeKw,
          packageTier: customer.packagePlan.packageTier,
          billingType: customer.packagePlan.billingType,
          monitoringTime: customer.packagePlan.monitoringTime,
          monthlyBasePrice: Number(customer.packagePlan.monthlyBasePrice),
          appliedDiscount: Number(customer.packagePlan.appliedDiscount),
          salesTaxAmount: Number(customer.packagePlan.salesTaxAmount),
          totalAmount: Number(customer.packagePlan.totalAmount),
        } : null,
        recentLedger: (customer.ledgerEntries || []).map((le: any) => ({
          id: le.id,
          date: le.createdAt || le.date,
          refNumber: le.refNumber || le.id.slice(0, 8),
          narration: le.narration,
          debit: Number(le.debit) || 0,
          credit: Number(le.credit) || 0,
          balance: Number(le.balance) || 0,
        }))
      }
    }
  } catch (error: any) {
    console.error('Error searching customer:', error)
    return { error: error?.message || 'Failed to search customer.' }
  }
}

// 1b. Real-time Customer Auto-Suggest Search
export async function searchCustomersAutoSuggest(query: string) {
  try {
    const trimmed = (query || '').trim()
    if (!trimmed || trimmed.length < 1) return { customers: [] }

    const digitsOnly = trimmed.replace(/\D/g, '')

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { fullName: { contains: trimmed, mode: 'insensitive' } },
          { customerCode: { contains: trimmed, mode: 'insensitive' } },
          { crfNumber: { contains: trimmed, mode: 'insensitive' } },
          { contactNumber: { contains: trimmed, mode: 'insensitive' } },
          { cnic: { contains: trimmed, mode: 'insensitive' } },
          ...(digitsOnly ? [
            { customerCode: { contains: digitsOnly } },
            { contactNumber: { contains: digitsOnly } },
          ] : []),
        ]
      },
      select: {
        id: true,
        customerCode: true,
        fullName: true,
        contactNumber: true,
        cnic: true,
        crfNumber: true,
        status: true,
        city: true,
        address: true,
      },
      take: 12,
      orderBy: { fullName: 'asc' }
    })

    return { customers }
  } catch (error: any) {
    console.error('Error in customer auto-suggest:', error)
    return { customers: [] }
  }
}

// 2. Update Customer Package & Status (with auto debit/credit adjustment)
export async function updateCustomerPackageAndStatus(formData: FormData) {
  try {
    const customerId = formData.get('customerId') as string
    const status = formData.get('status') as CustomerStatus
    const systemSizeKw = formData.get('systemSizeKw') as string
    const packageTier = formData.get('packageTier') as string
    const billingType = formData.get('billingType') as string
    const monitoringTime = formData.get('monitoringTime') as string
    const newTotalAmountStr = formData.get('totalAmount') as string
    const adjustmentNotes = formData.get('notes') as string || ''

    if (!customerId) return { error: 'Customer ID is required.' }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        packagePlan: true,
        ledgerEntries: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!customer) return { error: 'Customer record not found.' }

    const oldTotal = customer.packagePlan?.totalAmount ? Number(customer.packagePlan.totalAmount) : 0
    const newTotal = newTotalAmountStr ? parseFloat(newTotalAmountStr) : oldTotal
    const diff = newTotal - oldTotal

    // 1. Update Customer status
    await prisma.customer.update({
      where: { id: customerId },
      data: { status }
    })

    // 2. Record CustomerHistory entry
    await prisma.customerHistory.create({
      data: {
        customerId: customer.id,
        customerCode: customer.customerCode,
        customerName: customer.fullName,
        actionType: status !== customer.status ? 'STATUS_CHANGE' : 'PACKAGE_CHANGE',
        oldStatus: customer.status,
        newStatus: status,
        oldPackage: customer.packagePlan ? `${customer.packagePlan.packageTier} (${customer.packagePlan.systemSizeKw})` : undefined,
        newPackage: packageTier && systemSizeKw ? `${packageTier} (${systemSizeKw})` : undefined,
        notes: adjustmentNotes || `Status updated from ${customer.status?.replace(/_/g, ' ')} to ${status.replace(/_/g, ' ')}`,
        performedBy: 'Billing & Operations',
      }
    })

    // 2. Upsert Package Plan
    const basePrice = newTotal * 0.84 // approx before 16% sales tax
    const tax = newTotal * 0.16

    await prisma.packagePlan.upsert({
      where: { customerId },
      create: {
        customerId,
        systemSizeKw: systemSizeKw || '10-20 kW',
        packageTier: packageTier || 'Basic',
        billingType: billingType || 'Monthly',
        monitoringTime: monitoringTime || '12 Hours',
        monthlyBasePrice: basePrice,
        appliedDiscount: 0,
        salesTaxAmount: tax,
        totalAmount: newTotal,
      },
      update: {
        systemSizeKw: systemSizeKw || undefined,
        packageTier: packageTier || undefined,
        billingType: billingType || undefined,
        monitoringTime: monitoringTime || undefined,
        monthlyBasePrice: basePrice,
        salesTaxAmount: tax,
        totalAmount: newTotal,
      }
    })

    // 3. If price changed, create automatic Ledger adjustment entry
    if (diff !== 0) {
      const currentBal = customer.ledgerEntries[0]?.balance ? Number(customer.ledgerEntries[0].balance) : 0
      const isDebit = diff > 0
      const adjAmount = Math.abs(diff)
      const newBal = isDebit ? currentBal + adjAmount : currentBal - adjAmount

      await prisma.ledgerEntry.create({
        data: {
          customerId,
          date: new Date(),
          refNumber: `CPM-ADJ-${Date.now().toString().slice(-6)}`,
          narration: `Plan Change Adjustment (${packageTier} - ${billingType})${adjustmentNotes ? `: ${adjustmentNotes}` : ''}`,
          debit: isDebit ? adjAmount : 0,
          credit: !isDebit ? adjAmount : 0,
          balance: newBal,
        }
      })
    }

    revalidatePath('/dashboard/billing-cpm')
    revalidatePath('/dashboard/customers')
    revalidatePath(`/dashboard/customers/${customerId}`)
    revalidatePath('/dashboard/ledger')

    return { 
      success: true, 
      message: `Package & Status updated successfully!${diff !== 0 ? ` Automatic ${diff > 0 ? 'Debit' : 'Credit'} adjustment of Rs. ${Math.abs(diff).toLocaleString()} applied.` : ''}` 
    }
  } catch (error: any) {
    console.error('Error updating package & status:', error)
    return { error: error?.message || 'Failed to update package and status.' }
  }
}

// 3. Create Debit / Credit Note (Saved as Unposted)
export async function createDebitCreditNote(formData: FormData) {
  try {
    const customerId = formData.get('customerId') as string
    const noteType = formData.get('noteType') as 'DEBIT' | 'CREDIT'
    const amountStr = formData.get('amount') as string
    const description = formData.get('description') as string
    const accountExecutive = formData.get('accountExecutive') as string || 'Operations'
    const dateStr = formData.get('date') as string
    const entryDate = dateStr ? new Date(dateStr) : new Date()

    if (!customerId) return { error: 'Customer is required.' }
    if (!amountStr || parseFloat(amountStr) <= 0) return { error: 'Please enter a valid positive amount.' }
    if (!description?.trim()) return { error: 'Description is required.' }

    const amount = parseFloat(amountStr)

    // Save as UNPOSTED transaction
    const transaction = await prisma.transaction.create({
      data: {
        customerId,
        amount,
        paymentMethod: `${noteType}_NOTE|${accountExecutive}|${description.trim()}`,
        status: noteType === 'DEBIT' ? 'UNPOSTED_DEBIT' : 'UNPOSTED_CREDIT',
        createdAt: entryDate,
      }
    })

    revalidatePath('/dashboard/billing-cpm')
    return { 
      success: true, 
      message: `${noteType === 'DEBIT' ? 'Debit' : 'Credit'} note of Rs. ${amount.toLocaleString()} created as Unposted. Awaiting approval.` 
    }
  } catch (error: any) {
    console.error('Error creating debit/credit note:', error)
    return { error: error?.message || 'Failed to create note.' }
  }
}

// 4. Create Payment Entry (Saved as Unposted)
export async function createPaymentEntry(formData: FormData) {
  try {
    const customerId = formData.get('customerId') as string
    const amountStr = formData.get('amount') as string
    const description = formData.get('description') as string
    const accountExecutive = formData.get('accountExecutive') as string || 'Sales & Billing'
    const paymentMode = formData.get('paymentMode') as string || 'Bank Transfer'
    const dateStr = formData.get('date') as string
    const entryDate = dateStr ? new Date(dateStr) : new Date()

    if (!customerId) return { error: 'Customer is required.' }
    if (!amountStr || parseFloat(amountStr) <= 0) return { error: 'Please enter a valid positive amount.' }

    const amount = parseFloat(amountStr)

    // Save as UNPOSTED_PAYMENT
    await prisma.transaction.create({
      data: {
        customerId,
        amount,
        paymentMethod: `PAYMENT|${paymentMode}|${accountExecutive}|${(description || 'Customer Payment').trim()}`,
        status: 'UNPOSTED_PAYMENT',
        createdAt: entryDate,
      }
    })

    revalidatePath('/dashboard/billing-cpm')
    return { 
      success: true, 
      message: `Payment entry of Rs. ${amount.toLocaleString()} created as Unposted. Awaiting approval.` 
    }
  } catch (error: any) {
    console.error('Error creating payment entry:', error)
    return { error: error?.message || 'Failed to create payment entry.' }
  }
}

// 5. Post Unposted Transaction / Note to Customer Ledger
export async function postTransaction(transactionId: string) {
  try {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        customer: {
          include: {
            ledgerEntries: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    if (!tx) return { error: 'Transaction not found.' }
    if (tx.status === 'POSTED') return { error: 'Transaction is already posted.' }

    const [typeOrHeader, param2, param3, param4] = (tx.paymentMethod || '').split('|')
    const isDebit = tx.status === 'UNPOSTED_DEBIT' || typeOrHeader === 'DEBIT_NOTE'
    const isCredit = tx.status === 'UNPOSTED_CREDIT' || typeOrHeader === 'CREDIT_NOTE'
    const isPayment = tx.status === 'UNPOSTED_PAYMENT' || typeOrHeader === 'PAYMENT'

    const amount = Number(tx.amount)
    const currentBalance = tx.customer.ledgerEntries[0]?.balance 
      ? Number(tx.customer.ledgerEntries[0].balance) 
      : 0

    let newBalance = currentBalance
    let debitAmount = 0
    let creditAmount = 0
    let narration = ''

    if (isDebit) {
      debitAmount = amount
      newBalance = currentBalance + amount
      narration = `Debit Note: ${param3 || param2 || 'Manual Adjustment'}`
    } else if (isCredit) {
      creditAmount = amount
      newBalance = currentBalance - amount
      narration = `Credit Note: ${param3 || param2 || 'Manual Adjustment'}`
    } else if (isPayment) {
      creditAmount = amount
      newBalance = currentBalance - amount
      narration = `Payment Received (${param2 || 'Cash/Bank'}): ${param4 || param3 || 'Account Settlement'}`
    }

    // 1. Create Ledger entry
    await prisma.ledgerEntry.create({
      data: {
        customerId: tx.customerId,
        date: tx.createdAt || new Date(),
        refNumber: `TX-${tx.id.slice(0, 8).toUpperCase()}`,
        narration,
        debit: debitAmount,
        credit: creditAmount,
        balance: newBalance,
      }
    })

    // 2. Mark Transaction as POSTED
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'POSTED' }
    })

    revalidatePath('/dashboard/billing-cpm')
    revalidatePath('/dashboard/customers')
    revalidatePath(`/dashboard/customers/${tx.customerId}`)
    revalidatePath('/dashboard/ledger')

    return { success: true, message: 'Transaction posted to customer ledger successfully.' }
  } catch (error: any) {
    console.error('Error posting transaction:', error)
    return { error: error?.message || 'Failed to post transaction.' }
  }
}

// 6. Delete / Reject Unposted Transaction
export async function deleteTransaction(transactionId: string) {
  try {
    await prisma.transaction.delete({
      where: { id: transactionId }
    })

    revalidatePath('/dashboard/billing-cpm')
    return { success: true, message: 'Unposted transaction deleted successfully.' }
  } catch (error: any) {
    console.error('Error deleting transaction:', error)
    return { error: error?.message || 'Failed to delete transaction.' }
  }
}

// 7. Search Bulk Customer IDs (up to 100)
export async function searchBulkCustomers(pastedText: string) {
  try {
    if (!pastedText || !pastedText.trim()) {
      return { error: 'Please enter or paste at least one Customer ID.' }
    }

    // Extract raw tokens by newline, comma, semicolon, tab, or spaces
    const rawTokens = pastedText
      .split(/[\r\n,;\t\s]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0)

    // Limit to 100 customer IDs
    const uniqueTokens = Array.from(new Set(rawTokens)).slice(0, 100)

    if (uniqueTokens.length === 0) {
      return { error: 'No valid Customer IDs detected.' }
    }

    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { customerCode: { in: uniqueTokens } },
          { id: { in: uniqueTokens } },
          { crfNumber: { in: uniqueTokens } },
          // Also match digits-stripped tokens
          ...uniqueTokens.map(token => ({ customerCode: token.replace(/\D/g, '') })).filter(q => q.customerCode.length > 0)
        ]
      },
      include: {
        packagePlan: true
      },
      orderBy: { fullName: 'asc' }
    })

    const formatted = customers.map(c => ({
      id: c.id,
      customerCode: c.customerCode,
      crfNumber: c.crfNumber,
      fullName: c.fullName,
      contactNumber: c.contactNumber,
      subArea: c.subArea || '—',
      area: c.area || '—',
      city: c.city,
      status: c.status,
      packageTier: c.packagePlan?.packageTier || 'Basic',
      totalAmount: c.packagePlan?.totalAmount ? Number(c.packagePlan.totalAmount) : 0,
    }))

    return {
      success: true,
      count: formatted.length,
      searchedCount: uniqueTokens.length,
      customers: formatted
    }
  } catch (error: any) {
    console.error('Error searching bulk customers:', error)
    return { error: error?.message || 'Failed to search bulk customers.' }
  }
}

// 8. Process Bulk Status Change
export async function processBulkStatusChange(customerIds: string[], newStatus: CustomerStatus) {
  try {
    if (!customerIds || customerIds.length === 0) {
      return { error: 'Please select at least one customer to update.' }
    }
    if (!newStatus) {
      return { error: 'Please select a valid target status.' }
    }

    const targetCustomers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, customerCode: true, fullName: true, status: true }
    })

    const result = await prisma.customer.updateMany({
      where: {
        id: { in: customerIds }
      },
      data: {
        status: newStatus
      }
    })

    // Record CustomerHistory entries for all affected customers
    for (const c of targetCustomers) {
      await prisma.customerHistory.create({
        data: {
          customerId: c.id,
          customerCode: c.customerCode,
          customerName: c.fullName,
          actionType: 'BULK_STATUS_CHANGE',
          oldStatus: c.status,
          newStatus: newStatus,
          notes: `Bulk status update to '${newStatus.replace(/_/g, ' ')}'`,
          performedBy: 'Billing & Sales Team',
        }
      })
    }

    revalidatePath('/dashboard/billing-cpm')
    revalidatePath('/dashboard/customers')
    revalidatePath('/dashboard/reports')

    return { 
      success: true, 
      message: `Successfully updated ${result.count} customer(s) to status '${newStatus.replace(/_/g, ' ')}'.` 
    }
  } catch (error: any) {
    console.error('Error in bulk status update:', error)
    return { error: error?.message || 'Failed to update customer statuses.' }
  }
}
