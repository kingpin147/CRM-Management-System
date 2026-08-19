import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from './LoginForm'
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
        
        <LoginForm 
          initialError={resolvedParams?.error} 
          initialSuccess={resolvedParams?.success} 
        />
      </Card>
    </div>
  )
}
