"use client"
import { create } from "zustand"

interface DeviceState {
  isMobile: boolean
  setIsMobile: (value: boolean) => void
}

export const useDeviceStore = create<DeviceState>((set) => ({
  isMobile: false, // default
  setIsMobile: (value) => set({ isMobile: value }),
}))
