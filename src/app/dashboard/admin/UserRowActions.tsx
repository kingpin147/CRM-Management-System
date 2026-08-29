'use client'

import { useState } from 'react'
import { MoreHorizontal, Lock, Trash2, Ban, CheckCircle2, ShieldCheck, Briefcase } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { deleteUser, resetUserPassword, toggleUserStatus, updateUserRole, updateUserDesignation } from './actions'
import { Role } from '@prisma/client'

type UserProps = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  designation?: string;
  isActive: boolean;
}

export function UserRowActions({ user }: { user: UserProps }) {
  const [loading, setLoading] = useState(false)
  
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [designationOpen, setDesignationOpen] = useState(false)
  
  const [selectedRole, setSelectedRole] = useState<Role>(user.role as Role)
  const [designationInput, setDesignationInput] = useState<string>(user.designation || '')
  const [newPassword, setNewPassword] = useState<string | null>(null)
  const [typedPassword, setTypedPassword] = useState('')
  
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
    if (typedPassword.trim().length < 6) {
      alert('Password must be at least 6 characters long.')
      return
    }
    setLoading(true)
    try {
      const res = await resetUserPassword(user.id, typedPassword.trim())
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

  const handleUpdateRole = async () => {
    setLoading(true)
    try {
      const res = await updateUserRole(user.id, selectedRole)
      if (res.error) alert(res.error)
      else setRoleOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDesignation = async () => {
    setLoading(true)
    try {
      const res = await updateUserDesignation(user.id, designationInput)
      if (res.error) alert(res.error)
      else setDesignationOpen(false)
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
          
          <DropdownMenuItem onClick={() => setDesignationOpen(true)}>
            <Briefcase className="mr-2 h-4 w-4 text-emerald-600" />
            Change Designation
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setRoleOpen(true)}>
            <ShieldCheck className="mr-2 h-4 w-4 text-[var(--color-amber)]" />
            Change Role
          </DropdownMenuItem>

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
                  <><CheckCircle2 className="mr-2 h-4 w-4 text-sky-600" /> Enable User</>
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

      {/* Change Designation Dialog */}
      <Dialog open={designationOpen} onOpenChange={setDesignationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Designation for {user.fullName}</DialogTitle>
            <DialogDescription>
              Update the official company title/designation displayed on documents and the user profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="designation">Company Designation / Job Title</Label>
              <Input
                id="designation"
                value={designationInput}
                onChange={(e) => setDesignationInput(e.target.value)}
                placeholder="e.g. CEO, Senior Sales Executive, Website Developer"
                className="h-10 text-sm bg-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDesignationOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateDesignation} disabled={loading} className="bg-[#002868] text-white">
              {loading ? 'Saving...' : 'Save Designation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Role for {user.fullName}</DialogTitle>
            <DialogDescription>
              Assign a new role and permission set to this user.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as Role)}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin (Full Access)</SelectItem>
                  <SelectItem value="SALES_MANAGER">Account Sales Manager (Sales & Billing Operations)</SelectItem>
                  <SelectItem value="SALES">Executive Manager (Sales)</SelectItem>
                  <SelectItem value="OM_MANAGER">O & M Manager</SelectItem>
                  <SelectItem value="INSTALLATION">Installer (O&M Team)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateRole} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
      <AlertDialog open={resetOpen} onOpenChange={(open) => {
        setResetOpen(open);
        if (!open) {
          setTypedPassword('');
          setNewPassword(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Password</AlertDialogTitle>
            <AlertDialogDescription render={<div />}>
              <div>
                {!newPassword ? (
                   <div className="space-y-4 text-left">
                     <p>Type a new password for <strong>{user.fullName}</strong>:</p>
                     <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-slate-700">New Password *</label>
                       <input
                         type="text"
                         value={typedPassword}
                         onChange={(e) => setTypedPassword(e.target.value)}
                         className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]"
                         placeholder="Enter new password (min. 6 characters)"
                       />
                     </div>
                   </div>
                ) : (
                   <>
                    <p className="mb-4">The password has been updated successfully.</p>
                    <p className="font-semibold text-[var(--color-ink)] mb-2">New Password:</p>
                    <div className="bg-muted p-3 rounded text-center text-lg font-mono font-bold tracking-wider select-all">
                      {newPassword}
                    </div>
                    <p className="mt-4 text-amber-600 text-sm">Please share this password securely with the user.</p>
                   </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {!newPassword ? (
              <>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleResetPassword} 
                  disabled={loading || typedPassword.trim().length < 6}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction onClick={() => { setResetOpen(false); setNewPassword(null); setTypedPassword(''); }}>
                Done
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
