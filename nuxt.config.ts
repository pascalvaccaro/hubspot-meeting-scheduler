import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const currentDir = dirname(fileURLToPath(import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  typescript: {
    typeCheck: true,
  },
  css: [join(currentDir, './assets/css/main.css')],
  runtimeConfig: {
    hubspotMeetingSchedulerToken: process.env.HUBSPOT_MEETING_SCHEDULER_TOKEN || '',
    public: {
      hubspotApiDomain: process.env.HUBSPOT_API_DOMAIN || 'https://api.hubspot.com',
      meetingSchedulerName: process.env.HUBSPOT_MEETING_SCHEDULER_NAME || '',
      meetingSchedulerOrganizerId: process.env.HUBSPOT_MEETING_SCHEDULER_ORGANIZER_ID || '',
      meetingSchedulerType: process.env.HUBSPOT_MEETING_SCHEDULER_TYPE || 'ROUND_ROBIN_CALENDAR',
    },
  },
})
