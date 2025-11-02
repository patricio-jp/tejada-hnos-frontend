import { useState } from "react"
import { GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import useAuth from "@/modules/Auth/hooks/useAuth"
import { useNavigate } from "react-router"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Manejar diferentes formatos de error del servidor
        let errorMessage = "Error al iniciar sesión"
        
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          // Formato: {"errors":[{"message":"...","name":"..."}]}
          errorMessage = errorData.errors.map((e: { message: string }) => e.message).join(", ")
        } else if (errorData.message) {
          // Formato: {"message":"..."}
          errorMessage = errorData.message
        } else if (typeof errorData === 'string') {
          // Formato: string directo
          errorMessage = errorData
        }
        
        throw new Error(errorMessage)
      }

      const { data } = await response.json()
      
      // Guardar tokens usando el hook useAuth
      login(data.accessToken, data.refreshToken)
      
      // Redirigir al dashboard o página principal
      navigate("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Tejada Hnos.</span>
            </a>
            <h1 className="text-xl font-bold">Bienvenido a Tejada Hnos.</h1>
          </div>
          
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-800 dark:text-white border border-red-200 dark:border-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
