import Image from 'next/image'

export function BrandMark() {
  return <span className="brand-logo" aria-hidden="true"><Image src="/cycletrace-logo.png" alt="" width={630} height={430} priority /></span>
}
