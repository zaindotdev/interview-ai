'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PLANS, PlanType } from '@/lib/subscription-plans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import SubscriptionSection from '@/components/shared/subscription'

function SubscriptionPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status: authStatus } = useSession()
  
  const plan = searchParams.get('plan')?.toUpperCase() as PlanType | null
  const canceled = searchParams.get('canceled')
  
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error' | 'canceled' | 'show-plans'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Handle canceled checkout
    if (canceled === 'true') {
      setStatus('canceled')
      return
    }

    // Wait for auth status to be determined
    if (authStatus === 'loading') return

    // If no plan specified, show the plans page
    if (!plan) {
      setStatus('show-plans')
      return
    }

    // If free plan, redirect to dashboard
    if (plan === 'FREE') {
      router.replace('/dashboard')
      return
    }

    // If not authenticated, redirect to sign-in with plan info
    if (authStatus === 'unauthenticated') {
      router.replace(`/sign-in?plan=${plan.toLowerCase()}`)
      return
    }

    // User is authenticated - handle subscription flow
    if (authStatus === 'authenticated' && session) {
      handleSubscriptionRedirect()
    }
  }, [authStatus, session, plan, canceled])

  const handleSubscriptionRedirect = async () => {
    // Validate plan exists
    if (!plan) {
      setStatus('show-plans')
      return
    }

    const selectedPlan = PLANS[plan]
    if (!selectedPlan) {
      setStatus('error')
      setErrorMessage('Invalid plan selected. Please choose a valid subscription plan.')
      return
    }

    // Check if product ID exists
    if (!selectedPlan.productId) {
      setStatus('error')
      setErrorMessage('This plan is not available for purchase yet. Please try again later.')
      return
    }

    setStatus('redirecting')

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: selectedPlan.productId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Subscription error:', error)
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to start checkout. Please try again.')
      toast.error('Failed to start checkout', {
        description: error instanceof Error ? error.message : 'Please try again later'
      })
    }
  }

  const handleRetry = () => {
    setStatus('loading')
    handleSubscriptionRedirect()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Show plans when no specific plan is selected */}
      {status === 'show-plans' && (
        <div className="container mx-auto px-4 py-8">
          <SubscriptionSection showHeader={true} />
        </div>
      )}

      {/* Loading/Redirecting state */}
      {(status === 'loading' || status === 'redirecting') && (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
              <h2 className="mb-2 text-xl font-semibold">
                {status === 'loading' ? 'Loading...' : 'Redirecting to checkout...'}
              </h2>
              <p className="text-center text-gray-600">
                {status === 'loading' 
                  ? 'Preparing your subscription...' 
                  : 'You will be redirected to our secure payment page shortly.'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {status === 'error' && (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Something went wrong</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/subscription">View Plans</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {status === 'canceled' && (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle>Checkout Canceled</CardTitle>
              <CardDescription>
                Your checkout was canceled. No charges were made.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button onClick={() => setStatus('show-plans')} className="w-full">
                View Plans
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <SubscriptionPageContent />
    </Suspense>
  )
}
