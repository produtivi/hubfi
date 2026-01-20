import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET - List all Gmail accounts for a user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const userId = user.id;

    const googleAccounts = await prisma.googleAccount.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        createdAt: true,
      }
    })

    // Add mock data for MCC count, ads account count, and conversion actions
    const accountsWithMockData = googleAccounts.map((account: typeof googleAccounts[number]) => ({
      id: account.id,
      email: account.email,
      createdAt: account.createdAt,
      mccCount: Math.floor(Math.random() * 5) + 1, // Random 1-5
      adsAccountCount: Math.floor(Math.random() * 20) + 5, // Random 5-25
      conversionActionsCount: Math.floor(Math.random() * 50) + 10, // Random 10-60
    }))

    return NextResponse.json({
      success: true,
      data: accountsWithMockData
    })

  } catch (error) {
    console.error('Error fetching Gmail accounts:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add a new Gmail account (Deprecated - use OAuth flow instead)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Use OAuth flow at /api/auth/google/authorize' },
    { status: 400 }
  );
}

// DELETE - Remove a Gmail account
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required' },
        { status: 400 }
      )
    }

    const userId = user.id;

    // Check if the account exists and belongs to the user
    const googleAccount = await prisma.googleAccount.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    })

    if (!googleAccount) {
      return NextResponse.json(
        { success: false, error: 'Gmail account not found' },
        { status: 404 }
      )
    }

    // Delete the account
    await prisma.googleAccount.delete({
      where: {
        id: parseInt(id)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Gmail account removed successfully'
    })

  } catch (error) {
    console.error('Error deleting Gmail account:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}