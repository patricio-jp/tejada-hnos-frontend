export function SystemInfo({ ...props }: React.ComponentProps<'div'>) {
  return (
      <div
        {...props}
        className="mt-auto px-4 py-3 text-xs text-muted-foreground"
      >
        <div>App Version 1.0.0</div>
        <div className="mt-1">© 2025 Tejada Hnos</div>
      </div>
  )
}
