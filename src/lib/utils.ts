import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from 'date-fns'

export function formatDate(date: Date): string {
  return format(date, 'dd MMMM yyyy')
}

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const isDef = (value: any) => typeof value !== 'undefined';