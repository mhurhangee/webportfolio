import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'relative bg-primary text-primary-foreground before:absolute before:inset-0 before:bg-black/0 hover:before:bg-black/10 hover:-translate-y-0.5',
        destructive:
          'relative bg-destructive text-destructive-foreground before:absolute before:inset-0 before:bg-black/0 hover:before:bg-black/10 hover:-translate-y-0.5',
        outline:
          'relative border border-input bg-background before:absolute before:inset-0 before:bg-accent/0 hover:before:bg-accent/10 hover:border-accent hover:text-accent-foreground hover:-translate-y-0.5',
        secondary:
          'relative bg-secondary text-secondary-foreground before:absolute before:inset-0 before:bg-black/0 hover:before:bg-black/10 hover:-translate-y-0.5',
        ghost: 'hover:bg-accent hover:text-accent-foreground hover:-translate-y-0.5',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 hover:shadow-sm',
        sm: 'h-9 rounded-md px-3 hover:shadow-sm hover:-translate-y-[1px]',
        lg: 'h-11 rounded-md px-8 hover:shadow-md hover:-translate-y-1',
        icon: 'h-10 w-10 hover:shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
