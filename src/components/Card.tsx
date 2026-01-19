import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "../lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "neon";
}

export function Card({ children, className, variant = "default", ...props }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
                "relative overflow-hidden rounded-xl border border-white/5 bg-white/5 p-6 backdrop-blur-md transition-all duration-300",
                "hover:border-white/10 hover:shadow-lg",
                variant === "neon" && "border-accent-cyan/30 hover:shadow-[0_0_20px_rgba(0,242,255,0.1)]",
                className
            )}
            {...props}
        >
            {/* Glossy reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
            {children}
        </motion.div>
    );
}
