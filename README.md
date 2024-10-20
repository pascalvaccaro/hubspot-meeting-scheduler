# Nuxt Layer - Hubspot Meeting Scheduler

Nuxt Layer for the [Hubspot Meeting Scheduler API](https://developers.hubspot.com/docs/api/library/meetings)

> ⚠️ This API in in BETA, it may change in the future ⚠️

## Usage

### Environment

```bash
# Your Hubspot Meeting Scheduler API token (private)
HUBSPOT_MEETING_SCHEDULER_TOKEN=

# The following variables can be overriden from the component properties
# The name of your meeting workspace (public)
HUBSPOT_MEETING_SCHEDULER_NAME=
# The ID of your meeting organizer (public)
HUBSPOT_MEETING_SCHEDULER_ORGANIZER_ID=
```

### Configuration

Fill in your `nuxt.config.ts` file

```typescript
export default defineNuxtConfig({
  extends: ["github:pascalvaccaro/hubspot-meeting-scheduler"],
  runtimeConfig: {
    hubspotMeetingSchedulerToken:
      process.env.HUBSPOT_MEETING_SCHEDULER_TOKEN || "",
    public: {
      hubspotApiDomain:
        process.env.HUBSPOT_API_DOMAIN || "https://api.hubspot.com",
      meetingSchedulerName: process.env.HUBSPOT_MEETING_SCHEDULER_NAME || "",
      meetingSchedulerOrganizerId:
        process.env.HUBSPOT_MEETING_SCHEDULER_ORGANIZER_ID || "",
      meetingSchedulerType:
        process.env.HUBSPOT_MEETING_SCHEDULER_TYPE || "ROUND_ROBIN_CALENDAR",
    },
  },
});
```

## [HubspotMeetingScheduler](./components/HubspotMeetingScheduler.vue)

TODO

## Contribute

### Setup

Fork this repository and make sure to install the dependencies:

```bash
pnpm install
```

### Development Server

Start the development server on http://localhost:3000

```bash
pnpm dev
```

### Production

Build the application for production:

```bash
pnpm build
```

Or statically generate it with:

```bash
pnpm generate
```

Locally preview production build:

```bash
pnpm preview
```

Checkout the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
