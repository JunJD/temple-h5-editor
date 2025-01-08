export const devices = {
  iphone14pro: {
    id: 'iphone14pro',
    name: 'iPhone 14 Pro',
    width: 430,
    height: 932
  },
  iphone14: {
    id: 'iphone14',
    name: 'iPhone 14',
    width: 390,
    height: 844
  },
  iphoneSE: {
    id: 'iphoneSE',
    name: 'iPhone SE',
    width: 375,
    height: 667
  }
} as const

export type DeviceType = keyof typeof devices 