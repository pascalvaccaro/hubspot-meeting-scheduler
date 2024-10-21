export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: ['..'],
  modules: ['@nuxt/eslint'],
  runtimeConfig: {
    hubspotMeetingSchedulerToken: process.env.HUBSPOT_MEETING_SCHEDULER_TOKEN || '',
    public: {
      hubspotApiDomain: process.env.HUBSPOT_API_DOMAIN || 'https://api.hubspot.com',
      meetingSchedulerName: process.env.HUBSPOT_MEETING_SCHEDULER_NAME || '',
      meetingSchedulerOrganizerId: process.env.HUBSPOT_MEETING_SCHEDULER_ORGANIZER_ID || '',
      meetingSchedulerType: process.env.HUBSPOT_MEETING_SCHEDULER_TYPE || 'ROUND_ROBIN_CALENDAR',
    },
  },
  compatibilityDate: '2024-10-19',
})
