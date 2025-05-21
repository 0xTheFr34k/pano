"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface CustomButtonProps {
  children: ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
  className?: string
  onClick?: () => void
  href?: string
  disabled?: boolean
  type?: "button" | "submit" | "reset"
}

/**
 * CustomButton component that ensures proper text contrast for all button variants
 */
export function CustomButton({
  children,
  variant = "default",
  size = "default",
  asChild = false,
  className,
  ...props
}: CustomButtonProps) {
  // Define text color classes based on variant to ensure proper contrast
  const textColorClasses = {
    default: "text-white font-bold",
    destructive: "text-white font-bold",
    outline: "text-white font-bold", // Changed to always be white for outline buttons
    secondary: "text-blue-900 dark:text-white font-bold",
    ghost: "text-blue-900 dark:text-white font-bold",
    link: "text-blue-900 dark:text-white font-bold",
  }

  // Define hover text color classes
  const hoverTextColorClasses = {
    default: "hover:text-white",
    destructive: "hover:text-white",
    outline: "hover:text-white", // Changed to always be white for outline buttons
    secondary: "hover:text-blue-900 dark:hover:text-white",
    ghost: "hover:text-blue-900 dark:hover:text-white",
    link: "hover:text-blue-900 dark:hover:text-white",
  }

  // Combine the base button classes with our custom text color classes
  const combinedClassName = cn(
    textColorClasses[variant],
    hoverTextColorClasses[variant],
    className
  )

  return (
    <Button
      variant={variant}
      size={size}
      asChild={asChild}
      className={combinedClassName}
      {...props}
    >
      {children}
    </Button>
  )
}
