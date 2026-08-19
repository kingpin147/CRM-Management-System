'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction, type LoginActionState } from './actions'
import { CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

const initialState: LoginActionState = {
  error: null,
  success: false,
}

interface LoginFormProps {
  initialError?: string
  initialSuccess?: string
}

export function LoginForm({ initialError, initialSuccess }: LoginFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(loginAction, initialState)

  useEffect(() => {
    if (state?.success) {
      router.push('/dashboard/customers')
      router.refresh()
    }
  }, [state?.success, router])

  const errorMessage = state?.error || initialError
  const successMessage = state?.success ? 'Signing in...' : initialSuccess

  return (
    <form action={formAction}>
      <CardContent className="space-y-4">
        {successMessage && (
          <div className="p-3 text-sm bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 rounded-lg flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-sky-600" />
            <span>{successMessage}</span>
          </div>
        )}
        
        {errorMessage && (
          <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2 font-medium animate-in fade-in-50">
            <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[var(--color-ink)] font-medium">Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="admin@energygurus.pk" 
            required 
            disabled={isPending}
            className="bg-white/50 text-[var(--color-ink)] placeholder:text-[var(--color-slate-custom)] focus-visible:ring-[var(--color-amber)] border-[var(--color-line)]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[var(--color-ink)] font-medium">Password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="••••••••"
            required 
            disabled={isPending}
            className="bg-white/50 text-[var(--color-ink)] placeholder:text-[var(--color-slate-custom)] focus-visible:ring-[var(--color-amber)] border-[var(--color-line)]"
          />
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-6">
        <Button 
          type="submit" 
          disabled={isPending || state?.success} 
          className="w-full h-11 text-base font-semibold shadow-md transition-all cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </CardFooter>
    </form>
  )
}
