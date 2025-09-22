import React from 'react'

export default function Loader({height, width, color}: {height: number, width: number, color: string}) {
  return (
    <div className={`animate-spin h-${height} w-${width} border-2 border-t-transparent border-${color} rounded-full`}>
    </div>
  )
}
