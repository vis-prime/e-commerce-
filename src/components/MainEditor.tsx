"use client"

import ViewingArea from "./viewingArea/ViewingArea"
import EditingArea from "./EditingArea"

export default function MainEditor() {
  return (
    <div className="h-[calc(100vh-4rem)] w-screen flex flex-col md:flex-row">
      <ViewingArea />

      <EditingArea />
    </div>
  )
}
