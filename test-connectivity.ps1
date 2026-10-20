# Frontend-Backend Connectivity Test Script

Write-Host "=== Frontend-Backend Connectivity Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is running
Write-Host "1. Testing backend connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/transactions" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Backend is responding: HTTP $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend is not responding on http://localhost:8080" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Please ensure:" -ForegroundColor Yellow
    Write-Host "   - Spring Boot application is running" -ForegroundColor Yellow
    Write-Host "   - Server is listening on port 8080" -ForegroundColor Yellow
    exit 1
}

# Test 2: Check CORS headers
Write-Host ""
Write-Host "2. Testing CORS configuration..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "http://localhost:5173"
        "Access-Control-Request-Method" = "GET"
    }
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/transactions" -Method OPTIONS -Headers $headers -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.Headers["Access-Control-Allow-Origin"]) {
        Write-Host "   ✅ CORS is configured: $($response.Headers['Access-Control-Allow-Origin'])" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  CORS headers not found (may still work with GET/POST)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  CORS preflight check failed (normal if backend doesn't handle OPTIONS)" -ForegroundColor Yellow
}

# Test 3: Test POST request
Write-Host ""
Write-Host "3. Testing POST transaction..." -ForegroundColor Yellow
try {
    $body = @{
        title = "Test Transaction"
        amount = 100
        type = "expense"
        category = "Test"
    } | ConvertTo-Json
    
    $headers = @{
        "Content-Type" = "application/json"
        "Origin" = "http://localhost:5173"
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/transactions" -Method POST -Body $body -Headers $headers -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ POST request successful: HTTP $($response.StatusCode)" -ForegroundColor Green
    $transaction = $response.Content | ConvertFrom-Json
    Write-Host "   Created transaction ID: $($transaction.id)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ POST request failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "2. Open browser: http://localhost:5173" -ForegroundColor White
Write-Host "3. Check browser console for API logs" -ForegroundColor White

