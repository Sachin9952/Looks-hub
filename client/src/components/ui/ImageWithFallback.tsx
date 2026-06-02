import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  fallbackSrc?: string
  alt: string
}

export function ImageWithFallback({ src, fallbackSrc, alt, className, ...props }: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Use state sync in case src changes dynamically (e.g. during an admin edit)
  useEffect(() => {
    setImgSrc(src)
    setIsLoading(true)
    setHasError(false)
  }, [src])

  const defaultFallback = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300" // default premium fallback avatar

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallbackSrc || defaultFallback)
    }
    setIsLoading(false)
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-muted">
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      )}
      <img
        src={imgSrc || defaultFallback}
        alt={alt}
        className={`${className} ${isLoading ? "opacity-0" : "opacity-100 transition-opacity duration-300"}`}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </div>
  )
}
