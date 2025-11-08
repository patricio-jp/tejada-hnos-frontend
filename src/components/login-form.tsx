import { useMemo, useState } from 'react'
import type { ChangeEvent, ComponentProps, FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { GalleryVerticalEnd } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'

export function LoginForm({
  className,
  ...props
}: ComponentProps<'div'>) {
  const navigate = useNavigate()
  const { login, loading, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const displayError = useMemo(() => localError ?? error, [localError, error])

  const handleChange = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value)
    if (localError) setLocalError(null)
    if (error) clearError()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError(null)

    if (!email.trim() || !password.trim()) {
      setLocalError('Completá el correo y la contraseña para continuar.')
      return
    }

    try {
      await login({ email: email.trim(), password })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo iniciar sesión.'
      setLocalError(message)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <h1 className="text-xl font-bold">Iniciá sesión</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Accedé con tu usuario para continuar.
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="maria@example.com"
              value={email}
              onChange={handleChange(setEmail)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={handleChange(setPassword)}
              required
            />
          </Field>
          <Field className="pt-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Ingresando…' : 'Iniciar sesión'}
            </Button>
          </Field>
          <FieldError>{displayError}</FieldError>
        </FieldGroup>
      </form>
    </div>
  )
}
