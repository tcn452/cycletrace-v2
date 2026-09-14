import Image from 'next/image'

export function BrandMark({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  return <span className={`brand-logo logo-${variant}`} aria-hidden="true"><Image src="/logo.svg" alt="" width={508} height={498} priority /></span>
}
