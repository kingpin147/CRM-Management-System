'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteInventoryItem } from './actions'
import { Trash2 } from 'lucide-react'

export function DeleteInventoryItemDialog({ item }: { item: any }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await deleteInventoryItem(item.id)
    setLoading(false)
    if (res?.success) {
      setOpen(false)
      router.refresh()
    } else {
      alert(res?.error || 'Failed to delete item')
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md" />}>
        <Trash2 className="h-3.5 w-3.5" />
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white border-slate-200 shadow-xl max-w-[450px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-slate-900 font-bold text-base">
            Delete Inventory Product?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600 text-xs">
            Are you sure you want to remove <strong>{item.name}</strong> ({item.sku})? This will permanently delete this product and its associated stock movement history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 pt-2">
          <AlertDialogCancel className="border-slate-300 text-slate-600 hover:bg-slate-100 text-xs">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
          >
            {loading ? 'Deleting...' : 'Delete Product'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
