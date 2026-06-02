export default function LoadingSpinner({ message = 'جاري التحميل...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-14 h-14 border-4 border-gray-100 rounded-full" />
        <div className="w-14 h-14 border-4 border-transparent border-t-primary rounded-full animate-spin absolute inset-0" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
      <p className="mt-5 text-gray-400 text-sm font-medium tracking-wide">{message}</p>
    </div>
  )
}
