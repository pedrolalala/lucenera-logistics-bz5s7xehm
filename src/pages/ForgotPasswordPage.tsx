import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Loader2, ArrowLeft } from 'lucide-react'
import luceneraVertical from '@/assets/logos/lucenera-vertical.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'

const forgotSchema = z.object({
  email: z.string().email('Email inválido'),
})

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState(false)
  const [shake, setShake] = useState(false)
  const { toast } = useToast()

  const validateForm = () => {
    const result = forgotSchema.safeParse({ email })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return false
    }
    setError(undefined)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    setIsLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setShake(true)
        setTimeout(() => setShake(false), 400)
        toast({
          title: 'Erro ao enviar email',
          description: resetError.message,
          variant: 'destructive',
        })
        return
      }

      setSuccess(true)
      toast({
        title: 'Email enviado!',
        description: 'Verifique sua caixa de entrada e spam.',
        className: 'bg-success text-success-foreground border-none',
      })
    } catch (err) {
      toast({
        title: 'Erro inesperado',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-primary-light px-4">
      <div
        className={cn(
          'w-full max-w-[420px] bg-card rounded-2xl shadow-lg p-8 sm:p-12 transition-all',
          shake && 'animate-shake',
        )}
      >
        <div className="text-center mb-10">
          <img
            src={luceneraVertical}
            alt="Lucenera"
            className="w-[140px] sm:w-[180px] h-auto mx-auto mb-3"
          />
          <p className="text-muted-foreground text-sm">Sistema de Entregas</p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Email enviado</h2>
              <p className="text-sm text-muted-foreground">
                Se uma conta com este email existir, enviamos um link para redefinir a senha.
              </p>
            </div>
            <Button asChild variant="outline" className="w-full h-12 rounded-xl">
              <Link to="/login">Voltar para o login</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-center">Recuperar Senha</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Digite seu email para receber um link de recuperação
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs uppercase font-semibold text-muted-foreground tracking-wide"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@lucenera.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={validateForm}
                  disabled={isLoading}
                  className={cn(
                    'h-14 pl-12 text-base border-2 rounded-xl',
                    error ? 'border-destructive' : 'border-border',
                  )}
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-base font-bold rounded-xl bg-primary hover:bg-primary-dark shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar link'
                )}
              </Button>
              <Button
                asChild
                variant="ghost"
                className="w-full h-12 text-muted-foreground hover:text-foreground"
              >
                <Link to="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
