import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all Gmail accounts for a user
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from authenticated session
    // For now, using a fixed userId for testing
    const userId = 1

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
    const accountsWithMockData = googleAccounts.map(account => ({
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

// POST - Add a new Gmail account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Basic validation
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@gmail\.com$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Gmail address' },
        { status: 400 }
      )
    }

    // TODO: Get userId from authenticated session
    // For now, using a fixed userId for testing
    const userId = 1

    // Check if the Gmail is already associated with this user
    const existing = await prisma.googleAccount.findFirst({
      where: {
        userId,
        email
      }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Gmail already associated with this account' },
        { status: 409 }
      )
    }

    // Create the new Google account
    const googleAccount = await prisma.googleAccount.create({
      data: {
        userId,
        email
      }
    })

    // Return with mock data
    return NextResponse.json({
      success: true,
      data: {
        id: googleAccount.id,
        email: googleAccount.email,
        createdAt: googleAccount.createdAt,
        mccCount: 1,
        adsAccountCount: 5,
        conversionActionsCount: 10,
      }
    })

  } catch (error) {
    console.error('Error creating Gmail account:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a Gmail account
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, error: 'Valid ID is required' },
        { status: 400 }
      )
    }

    // TODO: Get userId from authenticated session
    // For now, using a fixed userId for testing
    const userId = 1

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