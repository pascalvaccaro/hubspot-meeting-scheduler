import { z } from "zod"
import type { HubspotMeeting } from "../../../../types"

export default defineEventHandler(async (event) => {
  const {
    hubspotMeetingSchedulerToken,
    public: {
      hubspotApiDomain,
      meetingSchedulerName,
      meetingSchedulerOrganizerId,
      meetingSchedulerType,
    }
  } = useRuntimeConfig(event)

  const querySchema = z.object({
    name: z.string().default(meetingSchedulerName),
    organizerId: z.string().default(meetingSchedulerOrganizerId),
    type: z.string().default(meetingSchedulerType)
  })
  const { success, error, data: query } =
    await getValidatedQuery(event, querySchema.safeParse)
  if (!success) throw error.issues

  const response = await $fetch<{
    total: number
    results: HubspotMeeting[]
  }>(new URL(
    '/scheduler/v3/meetings/meeting-links',
    hubspotApiDomain
  ).toString(), {
    query,
    headers: {
      Authorization: `Bearer ${hubspotMeetingSchedulerToken}`,
    },
  })

  return response.results
})
