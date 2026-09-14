import Image from 'next/image'

export function BrandMark() {
  return <span className="brand-logo" aria-hidden="true"><Image src="/logo.svg" alt="" width={508} height={498} priority /></span>
}
