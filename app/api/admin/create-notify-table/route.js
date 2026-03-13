/**
 * One-time setup endpoint to create notify_requests table
 * 
 * MANUAL SETUP REQUIRED:
 * Run the SQL in scripts/create-notify-table.sql in your Supabase SQL Editor
 * 
 * This endpoint is kept for reference but won't work without custom RPC function
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Please run scripts/create-notify-table.sql in Supabase SQL Editor",
    instructions: [
      "1. Go to your Supabase project dashboard",
      "2. Navigate to SQL Editor",
      "3. Copy and paste the contents of scripts/create-notify-table.sql",
      "4. Click 'Run' to execute the migration",
    ],
  });
}
