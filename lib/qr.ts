import QRCode from "qrcode";
import { config } from "./config";

// Uppercase URLs fit QR "alphanumeric" mode, which makes a smaller code
// (bigger dots at the same tag size = more reliable scans of engraved steel).
export function tagUrl(code: string) {
  return `${config.siteUrl}/D/${code}`.toUpperCase();
}

export function qrSvg(code: string, margin = 1) {
  return QRCode.toString(tagUrl(code), {
    type: "svg",
    errorCorrectionLevel: "Q", // survives ~25% damage
    margin,
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export function qrModules(code: string) {
  return QRCode.create(tagUrl(code), { errorCorrectionLevel: "Q" }).modules.size;
}
