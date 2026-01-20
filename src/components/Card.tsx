import { HTMLMotionProps, motion } from "framer-motion";
import { cn } from "../lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "neon";
}

export function Card({ children, className, variant = "default", ...props }: CardProps) {
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - left}px`);
        e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - top}px`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onMouseMove={handleMouseMove}
            className={cn(
                "relative overflow-hidden rounded-xl border border-white/5 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 group",
                "hover:border-white/10 hover:shadow-lg",
                variant === "neon" && "border-accent-cyan/30 hover:shadow-[0_0_20px_rgba(0,242,255,0.1)]",
                className
            )}
            {...props}
        >
            {/* Liquid Glass Refraction Layer */}
            <div
                className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.1), transparent 40%)`
                }}
            />
            {/* Glossy reflection effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

            <div className="relative z-10">{children}</div>
        </motion.div>
    );
}
