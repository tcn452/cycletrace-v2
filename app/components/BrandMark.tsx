import Image from 'next/image'

export function BrandMark() {
  return <span className="brand-logo" aria-hidden="true"><Image src="/logo.png" alt="" width={226} height={226} priority /></span>
}
