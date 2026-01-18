'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

function SuccessPageContent() {
  const [status, setStatus] = useState<'loading' | 'paid' | 'failed'>('loading');
  const [customerEmail, setCustomerEmail] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      fetchSessionStatus();
    } else {
      router.replace('/dashboard');
    }
  }, [sessionId]);

  async function fetchSessionStatus() {
    try {
      const response = await axios.post('/api/stripe/checkout-session', {
        sessionId,
      });

      const { session, error } = response.data;

      if (error || !session) {
        setStatus('failed');
        console.error('Error fetching session:', error);
        return;
      }

      setStatus(session.payment_status === 'paid' ? 'paid' : 'failed');
      setCustomerEmail(session.customer_details?.email || '');
    } catch (error) {
      console.error('Error fetching session status:', error);
      setStatus('failed');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {status === "loading" && (
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <h2 className="mb-2 text-xl font-semibold">Processing your payment...</h2>
            <p className="text-center text-gray-600">
              Please wait while we confirm your subscription.
            </p>
          </CardContent>
        </Card>
      )}

      {status === "paid" && (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Payment Successful!</CardTitle>
            <CardDescription>
              Thank you for your purchase. Your subscription is now active.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {customerEmail && (
              <p className="text-center text-gray-600">
                A receipt has been sent to: <strong>{customerEmail}</strong>
              </p>
            )}
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {status === "failed" && (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-red-600">Payment Failed</CardTitle>
            <CardDescription>
              Unfortunately, your payment could not be processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/subscription">Try Again</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
