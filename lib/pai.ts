export const PAI = { lat: 19.3588, lng: 98.4405 };

// Maps of Pai's dogs skip anything far away, like a location marked while travelling.
export function isNearPai(lat: number, lng: number) {
  return Math.abs(lat - PAI.lat) < 0.4 && Math.abs(lng - PAI.lng) < 0.4;
}

export const MAX_DOG_PHOTOS = 6;
