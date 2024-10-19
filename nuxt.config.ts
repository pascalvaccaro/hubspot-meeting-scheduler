// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  typescript: {
    typeCheck: true,
  },
  runtimeConfig: {
    hubspotMeetingSchedulerToken:
      process.env.HUBSPOT_MEETING_SCHEDULER_TOKEN || '',
  }
})
