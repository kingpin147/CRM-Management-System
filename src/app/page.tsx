import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[var(--color-amber)]/10 rounded-full blur-[120px] pointer-events-none animate-soft-float" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-teal)]/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-3xl text-center space-y-8 z-10 animate-reveal">
        <div className="mx-auto bg-white p-4 rounded-3xl w-24 h-24 flex items-center justify-center shadow-glass border border-white/20 mb-6">
          <Image src="/logo-icon.svg" alt="EnergyGurus Logo" width={64} height={64} />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-[var(--color-graphite)]">
          EnergyGurus<span className="text-[var(--color-amber)]">CRM</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-[var(--color-slate-custom)] font-mono max-w-2xl mx-auto leading-relaxed">
          The all-in-one Solar CRM platform.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full text-lg h-14 px-8 shadow-premium rounded-xl">
              Sign In to Portal
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
