type CheckoutProcessingSpinnerProps = {
  title: string
  subtitle?: string
}

const CheckoutProcessingSpinner = ({
  title,
  subtitle = 'Please wait a moment.',
}: CheckoutProcessingSpinnerProps) => {
  return (
    <div className="py-6 text-center">
      <div
        className="mx-auto h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"
        aria-hidden
      />
      <p className="mt-6 text-lg font-semibold text-gray-900">{title}</p>
      <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}

export default CheckoutProcessingSpinner
