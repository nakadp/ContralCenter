import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    glow?: boolean;
}

// Combine HTML button props with Framer Motion props logic manually if needed, 
// or just wrap button with motion.
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", glow = false, children, ...props }, ref) => {

        const variants = {
            primary: "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/50 hover:bg-accent-cyan/20",
            secondary: "bg-accent-magenta/10 text-accent-magenta border border-accent-magenta/50 hover:bg-accent-magenta/20",
            ghost: "bg-transparent border-transparent hover:bg-white/5 text-gray-300 hover:text-white",
            danger: "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-12 px-6 text-lg",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-cyan/50 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    glow && variant === 'primary' && "shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:shadow-[0_0_25px_rgba(0,242,255,0.5)] transition-shadow duration-300",
                    glow && variant === 'secondary' && "shadow-[0_0_15px_rgba(255,0,229,0.3)] hover:shadow-[0_0_25px_rgba(255,0,229,0.5)] transition-shadow duration-300",
                    className
                )}
                {...(props as any)}
            >
                {children}
            </motion.button>
        );
    }
);
Button.displayName = "Button";

export { Button };
