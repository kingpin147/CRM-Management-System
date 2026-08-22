'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createUser } from './actions'
import { UserPlus, User, Mail, Lock, Shield, AlertCircle, Loader2 } from 'lucide-react'

export function UserFormDialog() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createUser(formData)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="shadow-md flex items-center gap-2" />}>
        <UserPlus className="h-4 w-4" />
        <span>Create User</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] border-line">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[var(--color-amber)] shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display font-bold text-[var(--color-graphite)]">
                Create New User
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-xs">
                Add a new team member and assign their CRM role and permissions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center gap-2 font-medium animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="name"
                name="name"
                placeholder="e.g. Hamza Tariq"
                className="pl-9 h-10 text-sm bg-slate-50/50 focus:bg-white border-line transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="staff@energygurus.pk"
                className="pl-9 h-10 text-sm bg-slate-50/50 focus:bg-white border-line transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Initial Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="pl-9 h-10 text-sm bg-slate-50/50 focus:bg-white border-line transition-all"
                required
                minLength={6}
              />
            </div>
            <p className="text-[11px] text-slate-400">Must be at least 6 characters long.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              System Role & Access <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Select name="role" defaultValue="SALES_MANAGER">
                <SelectTrigger className="h-10 text-sm bg-slate-50/50 focus:bg-white border-line transition-all">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-400" />
                    <SelectValue placeholder="Select a role" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border-line">
                  <SelectItem value="SUPER_ADMIN" className="text-xs font-medium py-2">Super Admin (Full Access)</SelectItem>
                  <SelectItem value="SALES_MANAGER" className="text-xs font-medium py-2">Account Sales Manager (Sales & Billing Operations)</SelectItem>
                  <SelectItem value="SALES" className="text-xs font-medium py-2">Executive Manager (Sales)</SelectItem>
                  <SelectItem value="OM_MANAGER" className="text-xs font-medium py-2">O & M Manager</SelectItem>
                  <SelectItem value="INSTALLATION" className="text-xs font-medium py-2">Installer (O&M Team)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="text-xs font-semibold h-9 px-5 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                'Save User'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
