import { login, seedDatabaseAction } from './actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const resolvedParams = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-amber)]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-teal)]/10 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-md shadow-premium border-line/50 glass animate-reveal relative z-10">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-32 h-32 flex items-center justify-center mb-2 overflow-hidden rounded-full border border-line shadow-sm">
            <Image 
              src="/logo-icon.svg" 
              alt="EnergyGurus Logo" 
              width={128} 
              height={128} 
              className="object-cover w-full h-full p-2"
            />
          </div>
          <CardTitle className="text-3xl font-display font-bold text-[var(--color-graphite)] tracking-tight">
            EnergyGurus
          </CardTitle>
          <CardDescription className="text-[var(--color-slate-custom)] font-mono text-sm">
            Solar CRM Platform
          </CardDescription>
        </CardHeader>
        
        <form action={login}>
          <CardContent className="space-y-4">
            {resolvedParams?.success && (
              <div className="p-3 text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-center font-medium">
                {resolvedParams.success}
              </div>
            )}
            {resolvedParams?.error && (
              <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-center font-medium">
                {resolvedParams.error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--color-ink)] font-medium">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="m.manager@energygurus.online" 
                required 
                className="bg-white/50 text-[var(--color-ink)] placeholder:text-[var(--color-slate-custom)] focus-visible:ring-[var(--color-amber)] border-[var(--color-line)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--color-ink)] font-medium">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="bg-white/50 text-[var(--color-ink)] placeholder:text-[var(--color-slate-custom)] focus-visible:ring-[var(--color-amber)] border-[var(--color-line)]"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2 pb-6">
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md transition-all">
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
