#!/bin/bash

# Quick Setup Script for Supabase Edge Function
# This script helps you deploy the auto-start-battles edge function

echo "🚀 Supabase Edge Function Setup"
echo "================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Please install it first:"
    echo "  macOS:   brew install supabase/tap/supabase"
    echo "  Windows: scoop install supabase"
    echo "  Linux:   brew install supabase/tap/supabase"
    echo "  NPM:     npm install -g supabase"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Check if logged in
echo "📍 Checking Supabase login status..."
if ! supabase projects list &> /dev/null
then
    echo "❌ Not logged in to Supabase"
    echo ""
    echo "Please login first:"
    echo "  supabase login"
    echo ""
    exit 1
fi

echo "✅ Logged in to Supabase"
echo ""

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "❌ Project not linked!"
    echo ""
    echo "Please link your project first:"
    echo "  supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "Get your PROJECT_REF from:"
    echo "  Supabase Dashboard → Settings → General → Reference ID"
    echo ""
    exit 1
fi

echo "✅ Project linked"
echo ""

# Deploy edge function
echo "📍 Deploying auto-start-battles edge function..."
if supabase functions deploy auto-start-battles; then
    echo ""
    echo "✅ Edge function deployed successfully!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Copy your Function URL from above"
    echo "2. Go to Supabase Dashboard → Database → Cron Jobs"
    echo "3. Create new cron job with schedule: * * * * * (every minute)"
    echo "4. Use the SQL command from SUPABASE_EDGE_FUNCTION_SETUP.md"
    echo ""
    echo "📖 Full guide: SUPABASE_EDGE_FUNCTION_SETUP.md"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Check the error message above and try again."
    echo ""
    exit 1
fi
