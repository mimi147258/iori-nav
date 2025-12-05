// functions/api/public-config.js
import { jsonResponse } from '../_middleware';

/**
 * @summary Get public configuration settings
 * @route GET /api/public-config
 * @returns {Response} JSON response with public settings
 */
export async function onRequestGet({ env }) {
  // Check the environment variable. Convert to string to handle both boolean `true` from toml and string 'true' from secrets
  const submissionEnabled = String(env.ENABLE_PUBLIC_SUBMISSION) === 'true';

  // Get AI request delay, default to 1500ms if not set or invalid
  const aiRequestDelay = parseInt(env.AI_REQUEST_DELAY, 10);
  const validAiRequestDelay = !isNaN(aiRequestDelay) && aiRequestDelay > 0 ? aiRequestDelay : 1500;

  return jsonResponse({
    submissionEnabled: submissionEnabled,
    aiRequestDelay: validAiRequestDelay
  });
}