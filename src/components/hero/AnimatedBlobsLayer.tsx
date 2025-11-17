import React from 'react'
import { motion } from 'framer-motion'

type Props = { className?: string }
export default function AnimatedBlobsLayer({ className }: Props){
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className||''}`}>
      <motion.div className="absolute -top-24 -left-16 h-[36rem] w-[36rem] rounded-full bg-cyan-500/20 blur-3xl mix-blend-screen"
        animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0], scale: [1, 1.1, .95, 1] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute top-1/3 -right-10 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl mix-blend-screen"
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -25, 0], scale: [1, .9, 1.05, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-0 left-1/4 h-[24rem] w-[24rem] rounded-full bg-sky-400/20 blur-3xl mix-blend-screen"
        animate={{ x: [0, 25, -20, 0], y: [0, -20, 15, 0], scale: [1, 1.08, .92, 1] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} />
      <div className="absolute inset-0 hero-vignette" />
    </div>
  )
}