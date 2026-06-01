import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(url: string) {
  if (!url) return "";
  if (
    url.startsWith("http://") || 
    url.startsWith("https://") || 
    url.startsWith("data:") || 
    url.startsWith("/src/") || 
    url.startsWith("/assets/")
  ) {
    return url;
  }
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  return `${baseUrl}${url}`;
}
