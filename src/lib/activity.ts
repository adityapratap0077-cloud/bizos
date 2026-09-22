import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Append a row to activity_logs. Fire-and-forget safe: logging must never
 * break the main flow, so all failures are swallowed.
 */
export async function logActivity(
  supabase: SupabaseClient,
  businessId: string,
  action: string,
  entityType: string,
  entityId?: string | null,
  details?: Record<string, unknown>,
): Promise<void> {
  try {
    await supabase.from('activity_logs').insert({
      business_id: businessId,
      actor: 'You',
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      details: details ?? {},
    });
  } catch {
    // Activity logging is best-effort.
  }
}
