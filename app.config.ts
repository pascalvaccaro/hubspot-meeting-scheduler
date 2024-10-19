export default defineAppConfig({
  hubspot: {
    apiDomain: process.env.HUBSPOT_API_DOMAIN || 'https://api.hubspot.com',
    meetingScheduler: {
      name: process.env.HUBSPOT_MEETING_SCHEDULER_NAME || '',
      organizerId: process.env.HUBSPOT_MEETING_SCHEDULER_ORGANIZER_ID || '',
      type: process.env.HUBSPOT_MEETING_SCHEDULER_TYPE || 'ROUND_ROBIN_CALENDAR'
    }
  }
})

declare module '@nuxt/schema' {
  interface AppConfigOutput {
    hubspot: {
      apiDomain: string
      meetingScheduler: {
        name: string
        organizerId: string
        type: string
      }
    }
  }
}
