import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatDate = (date : string) =>{
  const dateObj =  new Date(date)

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2,"0")
  const year = dateObj.getFullYear()

  const customFormat = `${day}-${month}-${year}`

  return customFormat
}