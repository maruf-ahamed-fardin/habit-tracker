'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedNumberProps {
  value: number
  className?: string
  style?: React.CSSProperties
  formatter?: (val: number) => string
}

export function AnimatedNumber({
  value,
  className = '',
  style,
  formatter = (v) => Math.round(v).toString(),
}: AnimatedNumberProps) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 85, damping: 15 })
  const [displayValue, setDisplayValue] = useState(formatter(value))

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    return spring.on('change', (latest) => {
      setDisplayValue(formatter(latest))
    })
  }, [spring, formatter])

  return (
    <span className={`inline-block tabular-nums font-mono ${className}`} style={style}>
      {displayValue}
    </span>
  )
}
