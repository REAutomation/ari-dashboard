/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Utility functions for className merging
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
