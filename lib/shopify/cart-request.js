import { supabaseAdmin } from '@/lib/supabase/admin';

const ALLOWED_ATTRIBUTION_KEYS = new Set([
  'cd_ft_gclid', 'cd_ft_gbraid', 'cd_ft_wbraid',
  'cd_ft_utm_source', 'cd_ft_utm_medium', 'cd_ft_utm_campaign', 'cd_ft_utm_content', 'cd_ft_utm_term',
  'cd_ft_campaignid', 'cd_ft_adgroupid', 'cd_ft_keyword', 'cd_ft_matchtype', 'cd_ft_device', 'cd_ft_creative', 'cd_ft_placement',
  'cd_ft_landing_page', 'cd_ft_referrer', 'cd_ft_captured_at',
  'cd_lt_gclid', 'cd_lt_gbraid', 'cd_lt_wbraid',
  'cd_lt_utm_source', 'cd_lt_utm_medium', 'cd_lt_utm_campaign', 'cd_lt_utm_content', 'cd_lt_utm_term',
  'cd_lt_campaignid', 'cd_lt_adgroupid', 'cd_lt_keyword', 'cd_lt_matchtype', 'cd_lt_device', 'cd_lt_creative', 'cd_lt_placement',
  'cd_lt_landing_page', 'cd_lt_referrer', 'cd_lt_captured_at',
]);

export function sanitizeAttributionAttributes(attribution) {
  if (!Array.isArray(attribution)) return [];
  const sanitized = [];
  for (const attr of attribution) {
    if (!attr || typeof attr.key !== 'string' || typeof attr.value !== 'string') continue;
    const key = attr.key.trim();
    if (!ALLOWED_ATTRIBUTION_KEYS.has(key)) continue;
    const value = attr.value.trim().substring(0, 255);
    if (!value) continue;
    sanitized.push({ key, value });
  }
  return sanitized;
}

export async function hasActiveSanctuaryMembership(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return false;

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return false;

  try {
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user) return false;

    const { data: membership, error: membershipError } = await supabaseAdmin
      .from('memberships')
      .select('status, expires_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (membershipError || !membership) return false;
    if (membership.expires_at && !(new Date(membership.expires_at).getTime() > Date.now())) return false;

    return true;
  } catch (err) {
    console.error('Membership verification failed:', err.message);
    return false;
  }
}

