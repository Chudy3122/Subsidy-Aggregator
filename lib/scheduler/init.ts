import { startScheduler } from './cron'

let initialized = false

export function initializeScheduler() {
  if (initialized) {
    return
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode - Scheduler initialized')
    startScheduler()
    initialized = true
  } else {
    console.log('🚀 Production mode - Scheduler initialized')
    startScheduler()
    initialized = true
  }
}