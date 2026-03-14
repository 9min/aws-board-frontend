import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]',
        secondary:
          'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
        outline:
          'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]',
        destructive:
          'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]',
      },
    },
    defaultVariants: {
      variant: 'secondary',
    },
  },
)

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
