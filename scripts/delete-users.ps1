# PowerShell script to delete Supabase users
param(
    [Parameter(Mandatory=$true)]
    [string]$SupabaseUrl,
    
    [Parameter(Mandatory=$true)]
    [string]$ServiceRoleKey
)

$userIds = @(
    "f68fec3a-d1e5-4817-b932-61dc5e581c5a",
    "cffdce92-1539-4e17-8d23-330ef749352d", 
    "7322d1a6-b3ae-47da-ae27-526578ad9c83",
    "0b817180-5f29-4869-b733-74b9f24caa7d",
    "d0a36cd5-1741-411e-b811-0879fbfa5f04",
    "f263e9ae-9958-4859-953b-2f7f2d929dd3",
    "3d83dec8-538b-4c87-bac1-6dc7e6735192"
)

$headers = @{
    "Authorization" = "Bearer $ServiceRoleKey"
    "Content-Type" = "application/json"
}

Write-Host "Deleting $($userIds.Count) users..." -ForegroundColor Yellow

foreach ($userId in $userIds) {
    try {
        $uri = "$SupabaseUrl/auth/v1/admin/users/$userId"
        Write-Host "Deleting user: $userId" -ForegroundColor Gray
        
        $response = Invoke-RestMethod -Uri $uri -Method DELETE -Headers $headers
        Write-Host "✅ Successfully deleted user: $userId" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Failed to delete user $userId : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "User deletion process completed." -ForegroundColor Yellow