export function formatWhatsApp(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 8) digits = "509" + digits;      // numéro haïtien sans indicatif
  if (!digits.startsWith("509") && digits.length === 10) digits = "509" + digits;
  return digits.length >= 11 ? digits : null;
}

export function lienWhatsApp(phone: string | null | undefined, message: string): string | null {
  const p = formatWhatsApp(phone);
  return p ? `https://wa.me/${p}?text=${encodeURIComponent(message)}` : null;
}
