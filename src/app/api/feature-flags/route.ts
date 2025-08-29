import { NextRequest, NextResponse } from 'next/server';
import { FeatureFlagService } from '@/lib/feature-flag-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const email = searchParams.get('email');

    const user = userId && role && email ? {
      id: userId,
      role,
      email,
    } : undefined;

    const flags = await FeatureFlagService.getAllFeatureFlags(user);
    
    return NextResponse.json({
      success: true,
      data: flags,
    });
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feature flags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { flagKey, data } = body;

    if (!flagKey || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await FeatureFlagService.createOrUpdateFlag(flagKey, data);
    
    return NextResponse.json({
      success: true,
      message: 'Feature flag updated successfully',
    });
  } catch (error) {
    console.error('Error updating feature flag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update feature flag' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const flagKey = searchParams.get('flagKey');

    if (!flagKey) {
      return NextResponse.json(
        { success: false, error: 'Missing flag key' },
        { status: 400 }
      );
    }

    await FeatureFlagService.deleteFlag(flagKey);
    
    return NextResponse.json({
      success: true,
      message: 'Feature flag deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting feature flag:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete feature flag' },
      { status: 500 }
    );
  }
}
