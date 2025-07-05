'use client'

import React from 'react'
import { CheckCircle, Star, Zap, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface PricingCardProps {
    title: string
    description: string
    price: string
    originalPrice?: string
    features: string[]
    buttonText: string
    buttonLink: string
    tier?: 'basic' | 'pro' | 'enterprise'
    popular?: boolean
    badge?: string
}

const PricingCard: React.FC<PricingCardProps> = ({ title, description, price, originalPrice, features, buttonText, buttonLink, tier = 'basic', popular = false, badge }) => {
    const router = useRouter()

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
                    header: 'text-orange-900',
                    price: 'text-orange-900',
                    description: 'text-orange-700',
                    feature: 'text-orange-800',
                    icon: 'text-orange-500',
                    button: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg',
                    gradient: 'bg-gradient-to-r from-orange-500/10 to-red-500/10'
                }
            case 'enterprise':
                return {
                    container: 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 hover:border-purple-300 ring-2 ring-purple-100',
                    header: 'text-purple-900',
                    price: 'text-purple-900',
                    description: 'text-purple-700',
                    feature: 'text-purple-800',
                    icon: 'text-purple-500',
                    button: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg',
                    gradient: 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10'
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
            case 'enterprise':
                return <Crown className="w-5 h-5" />
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
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
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
                    onClick={() => router.replace(buttonLink)}
                    className={cn(
                        'w-full py-3 font-semibold transition-all duration-200',
                        'transform hover:scale-105 active:scale-95',
                        styles.button
                    )}
                >
                    {buttonText}
                </Button>
            </div>

            {/* Decorative Elements */}
            {tier === 'pro' && (
                <div className="absolute top-4 right-4 opacity-10">
                    <Zap className="w-8 h-8 text-orange-500" />
                </div>
            )}

            {tier === 'enterprise' && (
                <div className="absolute top-4 right-4 opacity-10">
                    <Crown className="w-8 h-8 text-purple-500" />
                </div>
            )}
        </motion.div>
    )
}

export default PricingCard
