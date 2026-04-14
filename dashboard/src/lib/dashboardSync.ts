// Dashboard sync — re-exports shared sync with origin 'dashboard'
import { createSync } from '../lib/sync';
export const dashboardSync = createSync('dashboard');
