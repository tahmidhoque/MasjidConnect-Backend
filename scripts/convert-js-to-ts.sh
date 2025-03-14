#!/bin/bash

# This script helps convert JavaScript API route files to TypeScript
# Usage: ./scripts/convert-js-to-ts.sh

echo "🔍 Finding JavaScript API route files..."
JS_ROUTES=$(find src/app/api -name "route.js")

# Check if any JavaScript route files were found
if [ -z "$JS_ROUTES" ]; then
  echo "✅ No JavaScript route files found. All routes are already TypeScript!"
  exit 0
fi

echo "🔄 Converting the following JavaScript files to TypeScript:"
echo "$JS_ROUTES"
echo ""

for FILE in $JS_ROUTES; do
  TS_FILE="${FILE%.js}.ts"
  echo "📝 Converting $FILE to $TS_FILE"
  
  # Create a TypeScript version of the file with proper type annotations
  cat > "$TS_FILE" << EOF
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
$(grep -v "import" "$FILE" | sed 's/export async function GET(request, { params })/export async function GET(\n  request: Request,\n  { params }: { params: Promise<{ [key: string]: string }> }\n)/' | sed 's/export async function POST(request, { params })/export async function POST(\n  request: Request,\n  { params }: { params: Promise<{ [key: string]: string }> }\n)/' | sed 's/export async function PUT(request, { params })/export async function PUT(\n  request: Request,\n  { params }: { params: Promise<{ [key: string]: string }> }\n)/' | sed 's/export async function PATCH(request, { params })/export async function PATCH(\n  request: Request,\n  { params }: { params: Promise<{ [key: string]: string }> }\n)/' | sed 's/export async function DELETE(request, { params })/export async function DELETE(\n  request: Request,\n  { params }: { params: Promise<{ [key: string]: string }> }\n)/' | sed 's/const { \([a-zA-Z0-9_]*\) } = params/const { \1 } = await params/')
EOF
  
  # Add back all imports
  grep "import" "$FILE" | grep -v "NextResponse\|getServerSession\|authOptions" >> "$TS_FILE"
  
  echo "✅ Created $TS_FILE"
  echo "⚠️  Please review the converted file for any necessary adjustments"
  echo ""
done

echo "🎉 Conversion complete! Please test your TypeScript routes."
echo "After testing, you can delete the original .js files."
echo ""
echo "To delete all JavaScript route files after verification:"
echo "find src/app/api -name \"route.js\" -exec rm {} \\;" 