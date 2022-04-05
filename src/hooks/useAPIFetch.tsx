import { User } from 'firebase/auth'
import { useEffect, useReducer, useRef } from 'react'

interface State<T> {
  data?: T
  error?: Error
}

type Cache<T> = { [method: string]: T }

// discriminated union type
type Action<T> =
  | { type: 'loading' }
  | { type: 'fetched'; payload: T }
  | { type: 'error'; payload: Error }

function useAPIFetch<T = unknown>(method?: string, options?: RequestInit, user?: User): State<T> {
  const cache = useRef<Cache<T>>({})

  // Used to prevent state update if the component is unmounted
  const cancelRequest = useRef<boolean>(false)

  const initialState: State<T> = {
    error: undefined,
    data: undefined,
  }

  // Keep state logic separated
  const fetchReducer = (state: State<T>, action: Action<T>): State<T> => {
    switch (action.type) {
      case 'loading':
        return { ...initialState }
      case 'fetched':
        return { ...initialState, data: action.payload }
      case 'error':
        return { ...initialState, error: action.payload }
      default:
        return state
    }
  }

  const [state, dispatch] = useReducer(fetchReducer, initialState)

  useEffect(() => {
    // Do nothing if the method is not given
    if (!method) return

    const fetchData = async () => {
      dispatch({ type: 'loading' })

      // If a cache exists for this method, return it
      if (cache.current[method]) {
        dispatch({ type: 'fetched', payload: cache.current[method] })
        return
      }

      try {
        const response = await fetch(`/api/${method}`, {
          ...options,
          headers: {
            authorization: `Bearer ${await user.getIdToken()}`,
            ...options?.headers
          },
        })
        if (!response.ok) {
          throw new Error(response.statusText)
        }

        const data = (await response.json()) as T
        cache.current[method] = data
        if (cancelRequest.current) return

        dispatch({ type: 'fetched', payload: data })
      } catch (error) {
        if (cancelRequest.current) return

        dispatch({ type: 'error', payload: error as Error })
      }
    }

    void fetchData()

    // Use the cleanup function for avoiding a possibly...
    // ...state update after the component was unmounted
    return () => {
      cancelRequest.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method])

  return state
}

export default useAPIFetch
