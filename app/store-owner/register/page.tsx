import { redirect } from 'next/navigation'

export default function StoreOwnerRegisterPage() {
  redirect('/register?role=store-owner')
}
