const SIZES = {
  sm: "p-2 text-sm xs:px-4",
  md: "p-3 text-base xs:px-8",
  lg: "p-3 text-lg xs:px-8"
}

export default function Button({
  children, 
  className,
  size = "md",
  hoverable = true,
  variant = "purple",
  ...rest
}) {

  const VARIANTS = {
    purple: `text-white bg-indigo-600 ${hoverable && "hover:bg-indigo-700"}`,
    red: `text-white bg-red-600 ${hoverable && "hover:bg-red-700"}`,
    lightPurple: `text-indigo-700 bg-indigo-100 ${hoverable && "hover:bg-indigo-200"}`,
    white: `text-black bg-white`,
    green: `text-green-700 bg-green-100 ${hoverable && "hover:bg-green-200"}`,
  }

  return (
    <button 
      {...rest}
      className={`disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow ${SIZES[size]} font-medium ${className} ${VARIANTS[variant]}`}>
      {children}
    </button>
  )
}