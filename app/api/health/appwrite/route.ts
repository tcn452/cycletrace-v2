import { NextResponse } from 'next/server'
import { createAdminServices } from '../../../lib/appwrite/server'

export async function GET() {
  try {
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BIKE_PHOTOS_BUCKET_ID
    if (!bucketId) throw new Error('Bike photo bucket is not configured.')
    const { storage, tables, databaseId } = createAdminServices()
    const [bucket, bikes] = await Promise.all([storage.getBucket({ bucketId }), tables.getTable({ databaseId, tableId: 'bikes' })])
    return NextResponse.json({ storage: { enabled: bucket.enabled, maximumFileSize: bucket.maximumFileSize, allowedFileExtensions: bucket.allowedFileExtensions, permissions: bucket.$permissions }, bikes: { enabled: bikes.enabled, rowSecurity: bikes.rowSecurity, columns: bikes.columns.map(column => column.key) } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Appwrite health check failed.' }, { status: 500 })
  }
}
