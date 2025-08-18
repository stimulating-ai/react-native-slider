import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useEvent<T extends (...args: any[]) => any>(onEvent: T) {
  const onEventRef = React.useRef<T>(onEvent)

  onEventRef.current = onEvent

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const staticOnEvent = React.useCallback((...args: any[]) => {
    const currentOnEvent = onEventRef.current
    return currentOnEvent(...args)
  }, [])

  return staticOnEvent as T
}
