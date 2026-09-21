import { CartItem } from '../types';

export const RESTAURANT_WHATSAPP = '0306-7451542';
export const RESTAURANT_WHATSAPP_NUM = '923067451542';

/**
 * Builds a direct wa.me link with customer details & items formatted
 */
export function generateWhatsAppOrderUrl(params: {
  customerName?: string;
  phone?: string;
  address?: string;
  items: CartItem[];
  total: number;
  orderType?: string;
}): string {
  const { customerName, phone, address, items, total, orderType = 'Delivery' } = params;

  let msg = `*🍕 NEW ORDER - BONFIRE PIZZERIA MULTAN*\n`;
  msg += `----------------------------------------\n`;
  if (customerName) msg += `*Customer:* ${customerName}\n`;
  if (phone) msg += `*Phone:* ${phone}\n`;
  msg += `*Order Type:* ${orderType}\n`;
  if (address) msg += `*Address:* ${address}\n`;
  msg += `----------------------------------------\n`;
  msg += `*ITEMS:*\n`;

  items.forEach((item, index) => {
    msg += `${index + 1}. *${item.name}* (x${item.quantity})\n`;
    if (item.selectedSize) {
      msg += `   • Size: ${item.selectedSize}\n`;
    }
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      msg += `   • Add-ons: ${item.selectedAddons.map(a => a.name).join(', ')}\n`;
    }
    msg += `   • Price: PKR ${(item.itemPrice * item.quantity).toLocaleString()}\n`;
  });

  msg += `----------------------------------------\n`;
  msg += `*TOTAL AMOUNT:* PKR ${total.toLocaleString()}\n`;
  msg += `*Payment:* Cash On Delivery / Pickup\n`;
  msg += `\nPlease confirm my order!`;

  return `https://api.whatsapp.com/send?phone=${RESTAURANT_WHATSAPP_NUM}&text=${encodeURIComponent(msg)}`;
}

export function openWhatsAppChat(customMessageOrPhone?: string, optionalMessage?: string): void {
  let targetPhone = RESTAURANT_WHATSAPP_NUM;
  let text = 'Hi Bonfire Pizzeria! I would like to inquire about your menu and deals in Multan.';

  if (optionalMessage !== undefined) {
    targetPhone = (customMessageOrPhone || '').replace(/\D/g, '');
    if (targetPhone.startsWith('0')) {
      targetPhone = '92' + targetPhone.slice(1);
    }
    text = optionalMessage;
  } else if (customMessageOrPhone) {
    text = customMessageOrPhone;
  }

  const url = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(text)}`;
  
  // Safe cross-browser navigation that works reliably inside iframes and new tabs
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
