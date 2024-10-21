import { z } from 'zod'
import type { HubspotMeetingLink } from '../../../../types'

const querySchema = z.object({
  timezone: z.string().default('Europe/Paris'),
})
const paramSchema = z.object({
  slug: z.string(),
})

export default defineEventHandler(async (event) => {
  const {
    hubspotMeetingSchedulerToken,
    public: { hubspotApiDomain },
  } = useRuntimeConfig(event)

  const params = await getValidatedRouterParams(event, paramSchema.safeParse)
  const query = await getValidatedQuery(event, querySchema.safeParse)
  if (!params.success) throw params.error.issues
  if (!query.success) throw query.error.issues

  const { slug } = params.data
  const { timezone } = query.data

  const response = await $fetch<HubspotMeetingLink>(
    new URL(`/scheduler/v3/meetings/meeting-links/book/${encodeURIComponent(slug)}`, hubspotApiDomain).toString(),
    {
      query: { timezone: decodeURIComponent(timezone) },
      headers: {
        Authorization: `Bearer ${hubspotMeetingSchedulerToken}`,
      },
    }
  )

  return response
})
