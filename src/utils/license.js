// Whether a Gumroad purchase currently grants Pro access.
// One-time purchases stay valid unless refunded/charged back. Subscriptions keep
// access until the subscription actually ends — a *pending* cancellation still has
// access until the paid period elapses (Gumroad only sets subscription_ended_at then).
export function isActive(purchase, recurring = false) {
  if (!purchase) return false;
  if (purchase.refunded || purchase.chargebacked || purchase.disputed) return false;
  if (recurring && (purchase.subscription_failed_at || purchase.subscription_ended_at)) return false;
  return true;
}
