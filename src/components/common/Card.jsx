"use client"

const Card = ({
  children,
  className = "",
  padding = "p-6",
  shadow = "shadow-sm",
  border = "border border-gray-200",
  rounded = "rounded-lg",
  background = "bg-white",
  ...props
}) => {
  const CardComponent = (
    <div className={`${background} ${border} ${rounded} ${shadow} ${padding} ${className}`} {...props}>
      {children}
    </div>
  )

  return CardComponent
}

// Subcomponentes
Card.Header = ({ children, className = "" }) => (
  <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>{children}</div>
)

Card.Body = ({ children, className = "" }) => <div className={className}>{children}</div>

Card.Footer = ({ children, className = "" }) => (
  <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`}>{children}</div>
)

export default Card
