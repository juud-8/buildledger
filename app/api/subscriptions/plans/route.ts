import { NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/services/subscription-service';

export async function GET() {
  try {
    const plans = await subscriptionService.getSubscriptionPlans();
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 