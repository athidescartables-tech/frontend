"use client"

import { forwardRef } from "react"
import clsx from "clsx"

const LoadingButton = forwardRef(
  (
    {
      children,
      loading = false,
      loadingText,
      disabled = false,
      className = "",
      variant = "primary",
      size = "md",
      type = "button",
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"

    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white disabled:bg-blue-300",
      secondary: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 text-white disabled:bg-gray-300",
      outline:
        "border border-gray-300 bg-white hover:bg-gray-50 focus:ring-blue-500 text-gray-700 disabled:bg-gray-50 disabled:text-gray-400",
      danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white disabled:bg-red-300",
    }

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    }

    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={clsx(
          baseClasses,
          variants[variant],
          sizes[size],
          isDisabled && "cursor-not-allowed opacity-60",
          className,
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {loading ? loadingText || "Cargando..." : children}
      </button>
    )
  },
)

LoadingButton.displayName = "LoadingButton"

export default LoadingButton
