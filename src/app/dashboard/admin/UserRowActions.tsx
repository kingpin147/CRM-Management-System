'use client'

import { useState } from 'react'
import { MoreHorizontal, Lock, Trash2, Ban, CheckCircle2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteUser, resetUserPassword, toggleUserStatus } from './actions'

type UserProps = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export function UserRowActions({ user }: { user: UserProps }) {
  const [loading, setLoading] = useState(false)
  
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  
  const [newPassword, setNewPassword] = useState<string | null>(null)
  
  const handleToggleStatus = async () => {
    setLoading(true)
    try {
      const res = await toggleUserStatus(user.id, !user.isActive)
      if (res.error) alert(res.error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await deleteUser(user.id)
      if (res.error) alert(res.error)
      else setDeleteOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setLoading(true)
    try {
      const res = await resetUserPassword(user.id)
      if (res.error) {
        alert(res.error)
        setResetOpen(false)
      } else {
        setNewPassword(res.newPassword || null)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex items-center justify-center rounded-md h-8 w-8 p-0 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          disabled={loading}
        >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="px-2 py-1.5 text-sm font-semibold">Actions</div>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setResetOpen(true)}>
            <Lock className="mr-2 h-4 w-4" />
            Reset Password
          </DropdownMenuItem>
          
          {user.role !== 'SUPER_ADMIN' && (
            <>
              <DropdownMenuItem onClick={handleToggleStatus}>
                {user.isActive ? (
                  <><Ban className="mr-2 h-4 w-4 text-amber-500" /> Disable User</>
                ) : (
                  <><CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Enable User</>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:bg-destructive/10"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete <strong>{user.fullName}</strong>'s account
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              {!newPassword ? (
                 <>Are you sure you want to reset the password for <strong>{user.fullName}</strong>?</>
              ) : (
                 <>
                  <p className="mb-4">The password has been reset successfully.</p>
                  <p className="font-semibold text-[var(--color-ink)] mb-2">New Password:</p>
                  <div className="bg-muted p-3 rounded text-center text-lg font-mono font-bold tracking-wider select-all">
                    {newPassword}
                  </div>
                  <p className="mt-4 text-amber-600 text-sm">Please copy this password and securely share it with the user. You will not be able to see it again.</p>
                 </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {!newPassword ? (
              <>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetPassword} disabled={loading}>
                  {loading ? 'Resetting...' : 'Yes, Reset Password'}
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction onClick={() => { setResetOpen(false); setNewPassword(null); }}>
                Done
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
