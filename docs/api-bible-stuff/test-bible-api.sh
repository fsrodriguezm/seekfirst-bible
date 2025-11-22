#!/bin/bash
# Quick reference for testing the Bible API

# Set your API key here
API_KEY="your_api_key_here"

# Bible IDs
RVR09="592420522e16049f-01"  # Reina Valera 1909 (Spanish)
WEB="9879dbb7cfe39e4d-01"     # World English Bible (English)
KJV="de4e12af7f28f599-01"     # King James Version (English)

# Test 1: Get all available bibles
echo "=== TEST 1: Get all bibles ==="
curl --location 'https://rest.api.bible/v1/bibles' \
  --header "api-key: $API_KEY" | jq '.data | length'

# Test 2: Proverbs 3 from Reina Valera 1909 (Spanish)
echo ""
echo "=== TEST 2: Proverbs 3 (RVR09 - Spanish) ==="
curl --location "https://rest.api.bible/v1/bibles/$RVR09/chapters/PRO.3" \
  --header "api-key: $API_KEY" | jq '.data.content' | head -20

# Test 3: Proverbs 3 from World English Bible
echo ""
echo "=== TEST 3: Proverbs 3 (WEB - English) ==="
curl --location "https://rest.api.bible/v1/bibles/$WEB/chapters/PRO.3" \
  --header "api-key: $API_KEY" | jq '.data.content' | head -20

# Test 4: Get available books in RVR09
echo ""
echo "=== TEST 4: Available books in RVR09 ==="
curl --location "https://rest.api.bible/v1/bibles/$RVR09/books" \
  --header "api-key: $API_KEY" | jq '.data[] | {id, name}' | head -20

# Usage:
# 1. Set API_KEY variable above
# 2. Save this file as test-api.sh
# 3. Run: bash test-api.sh
