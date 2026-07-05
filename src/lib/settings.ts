export function isOrderingClosed(settings: any) {
  if (settings?.ordering_enabled === false) {
    return true;
  }

  const today = new Date();
  const openDate = settings?.order_open_date ? new Date(settings.order_open_date) : null;
  const closeDate = settings?.order_close_date ? new Date(settings.order_close_date) : null;

  if (openDate && today < openDate) {
    return true;
  }

  if (closeDate && today > closeDate) {
    return true;
  }

  return false;
}
