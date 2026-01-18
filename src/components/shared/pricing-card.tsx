'use client'

import React, { useState } from 'react'
import { CheckCircle, Star, Zap, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface PricingCardProps {
    title: string
    description: string
    price: string
    originalPrice?: string
    features: string[]
    buttonText: string
    buttonLink: string
    tier?: 'basic' | 'pro'
    popular?: boolean
    badge?: string
    planKey?: 'FREE' | 'PRO' | 'PREMIUM'
    productId?: string
}

const PricingCard: React.FC<PricingCardProps> = ({ 
    title, 
    description, 
    price, 
    originalPrice, 
    features, 
    buttonText, 
    buttonLink, 
    tier = 'basic', 
    popular = false, 
    badge,
    planKey,
    productId 
}) => {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(false)

    const handleSubscribe = async () => {
        setLoading(true)
        
        try {
            // Free plan - redirect to dashboard or sign-up
            if (planKey === 'FREE' || !productId) {
                if (session) {
                    router.push('/dashboard')
                } else {
                    router.push('/sign-up?plan=free')
                }
                return
            }

            // Paid plan - check if user is authenticated
            if (!session) {
                // User not signed in - redirect to sign-up with plan info
                router.push(`/sign-up?plan=${planKey?.toLowerCase()}`)
                return
            }

            // User is authenticated - create Stripe checkout session
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId }),
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
            toast.error('Failed to start subscription', {
                description: error instanceof Error ? error.message : 'Please try again later'
            })
        } finally {
            setLoading(false)
        }
    }

    const getCardStyles = () => {
        switch (tier) {
            case 'basic':
                return {
                    container: 'bg-white border-gray-200 hover:border-gray-300',
                    header: 'text-gray-900',
                    price: 'text-gray-900',
                    description: 'text-gray-600',
                    feature: 'text-gray-700',
                    icon: 'text-blue-500',
                    button: 'bg-gray-900 hover:bg-gray-800 text-white',
                    gradient: ''
                }
            case 'pro':
                return {
                    container: 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 hover:border-orange-300 ring-2 ring-orange-100',
                    header: 'text-primary',
                    price: 'text-primary',
                    description: 'text-primary',
                    feature: 'text-primary',
                    icon: 'text-primary',
                    button: 'bg-gradient-to-r from-primary to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg',
                    gradient: 'bg-gradient-to-r from-primary/10 to-red-500/10'
                }
            default:
                return {
                    container: 'bg-white border-gray-200',
                    header: 'text-gray-900',
                    price: 'text-gray-900',
                    description: 'text-gray-600',
                    feature: 'text-gray-700',
                    icon: 'text-blue-500',
                    button: 'bg-gray-900 hover:bg-gray-800 text-white',
                    gradient: ''
                }
        }
    }

    const styles = getCardStyles()

    const getTierIcon = () => {
        switch (tier) {
            case 'basic':
                return <Star className="w-5 h-5" />
            case 'pro':
                return <Zap className="w-5 h-5" />
            default:
                return <Star className="w-5 h-5" />
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className={cn(
                'relative rounded-2xl border-2 p-8 max-w-lg transition-all duration-300',
                'shadow-lg hover:shadow-2xl',
                styles.container,
                popular && 'scale-105 z-[1]'
            )}
        >
            {/* Popular Badge */}
            {popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary to-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                        Most Popular
                    </div>
                </div>
            )}

            {/* Custom Badge */}
            {badge && !popular && (
                <div className="absolute -top-3 -right-3">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        {badge}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={cn('p-2 rounded-lg', styles.gradient)}>
                        <div className={styles.icon}>
                            {getTierIcon()}
                        </div>
                    </div>
                    <h1 className={cn('text-xl md:text-2xl font-bold', styles.header)}>
                        {title}
                    </h1>
                </div>

                <div className="text-right">
                    {originalPrice && (
                        <p className="text-sm text-gray-400 line-through">
                            {originalPrice}
                        </p>
                    )}
                    <h1 className={cn('text-2xl md:text-3xl font-bold', styles.price)}>
                        {price}
                    </h1>
                </div>
            </div>

            {/* Description */}
            <div className="mt-4">
                <p className={cn('text-base', styles.description)}>
                    {description}
                </p>
            </div>

            {/* Features */}
            <ul className="mt-8 space-y-4">
                {features.map((feature, index) => (
                    <motion.li
                        key={`feature-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center gap-3"
                    >
                        <CheckCircle size={20} className={cn('flex-shrink-0', styles.icon)} />
                        <p className={cn('text-base font-medium', styles.feature)}>
                            {feature}
                        </p>
                    </motion.li>
                ))}
            </ul>

            {/* Button */}
            <div className="mt-8 w-full">
                <Button
                    onClick={handleSubscribe}
                    disabled={loading || status === 'loading'}
                    className={cn(
                        'w-full py-3 font-semibold transition-all duration-200 cursor-pointer',
                        'transform hover:scale-105 active:scale-95',
                        'disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none',
                        styles.button
                    )}
                >
                    {loading || status === 'loading' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        buttonText
                    )}
                </Button>
            </div>

            {/* Decorative Elements */}
            {tier === 'pro' && (
                <div className="absolute top-4 right-4 opacity-10">
                    <Zap className="w-8 h-8 text-primary-500" />
                </div>
            )}
        </motion.div>
    )
}

export default PricingCard
