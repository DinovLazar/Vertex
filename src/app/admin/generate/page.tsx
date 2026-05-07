import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sanityWriteClient } from '@/lib/sanity/client'
import { getTokenHealth } from '@/lib/meta'
import GenerateClient from './GenerateClient'

export const dynamic = 'force-dynamic'

export interface TopicPreview {
  _id: string
  title: string
  division: string
  priority: number
  status: string
  failureReason?: string
}

const BACKLOG_QUERY = `
  *[_type == "topicBacklog"] | order(status asc, priority asc) [0...30] {
    _id,
    "title": title.en,
    division,
    priority,
    status,
    failureReason,
  }
`

export default async function GenerateDashboardPage() {
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get('vertex-admin')?.value
  if (!process.env.VERTEX_ADMIN_PASSWORD || adminCookie !== process.env.VERTEX_ADMIN_PASSWORD) {
    redirect('/admin/login')
  }

  const topics: TopicPreview[] = await sanityWriteClient.fetch(BACKLOG_QUERY)
  const tokenHealth = getTokenHealth()

  return <GenerateClient topics={topics} tokenHealth={tokenHealth} />
}
