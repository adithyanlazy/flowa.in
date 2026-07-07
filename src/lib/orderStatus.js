// Forward-progress order lifecycle, in order. 'cancelled' is a terminal
// side-branch, not part of the forward timeline, so it's kept separate.
export const ORDER_STATUSES = ['pending', 'confirmed', 'packed', 'shipped', 'delivered']
export const CANCELLED_STATUS = 'cancelled'
export const ALL_STATUSES = [...ORDER_STATUSES, CANCELLED_STATUS]

export const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const STATUS_BADGE_CLASSES = {
  pending: 'bg-blush-50 text-blush-700',
  confirmed: 'bg-lav-100 text-lav-600',
  packed: 'bg-amber-50 text-amber-700',
  shipped: 'bg-sky-50 text-sky-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-600',
}
