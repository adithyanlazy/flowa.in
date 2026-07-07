import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext.jsx'

// Bounces to /login?redirect=<path> once auth has resolved and the visitor
// turns out not to be signed in. Waits on authLoading so a real session
// isn't kicked out mid-resolve on refresh.
export function useRequireAuth(redirectPath) {
  const { isLoggedIn, authLoading } = useAdmin()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`, { replace: true })
    }
  }, [authLoading, isLoggedIn, redirectPath, navigate])

  return { isLoggedIn, authLoading }
}
