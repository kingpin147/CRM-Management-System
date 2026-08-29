import { Card, CardDescription, CardHeader } from '@/components/ui/card'
import { LoginForm } from './LoginForm'
import { Logo } from '@/components/ui/logo'

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
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center">
            <Logo href="/" iconSize={48} className="text-2xl gap-3" />
          </div>
          <CardDescription className="text-[var(--color-slate-custom)] font-mono text-sm">
            Solar CRM Platform
          </CardDescription>
        </CardHeader>
        
        <LoginForm 
          initialError={resolvedParams?.error} 
          initialSuccess={resolvedParams?.success} 
        />
      </Card>
    </div>
  )
}
