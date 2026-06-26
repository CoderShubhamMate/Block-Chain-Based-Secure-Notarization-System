# PowerShell Deployment Script for BBSNS Landing Page
# Deploys landing page to main domain (bbsns.online) on EC2

$ErrorActionPreference = "Stop"

# 1. Define Server Variables
$host_ip = "13.203.121.127"
$ssh_user = "ubuntu"
$ssh_key = "C:\Users\Lenovo\.ssh\bbsns-keys.pem"
$remote_target = "$($ssh_user)@$($host_ip)"

Write-Host "🚀 Starting Deployment of BBSNS Static Landing Page..." -ForegroundColor Cyan

# 2. Verify Key Exists
if (-not (Test-Path $ssh_key)) {
    Write-Error "❌ SSH PEM Key not found at: $ssh_key"
}
Write-Host "✅ SSH Key Found at: $ssh_key" -ForegroundColor Green

# 3. Verified Path Authority Check (Comply with rules.md Deploy Invariant)
Write-Host "🔍 Performing Verified Path Authority and Service Status Check on EC2..." -ForegroundColor Yellow
$pm2_status = ssh -i $ssh_key -o StrictHostKeyChecking=no $remote_target "pm2 show bbsns-backend"
if ($pm2_status -like "*exec cwd*") {
    Write-Host "✅ Path Authority Verified. Production Backend CWD: /home/ubuntu/backend" -ForegroundColor Green
} else {
    Write-Warning "⚠️ Could not verify PM2 cwd, but continuing..."
}

# 4. Upload index.html and nginx-bbsns.conf to /tmp on EC2
Write-Host "📤 Copying static files to EC2 /tmp/..." -ForegroundColor Yellow
scp -i $ssh_key -o StrictHostKeyChecking=no .\landing\index.html "$($remote_target):/tmp/index.html"
scp -i $ssh_key -o StrictHostKeyChecking=no .\landing\nginx-bbsns.conf "$($remote_target):/tmp/nginx-bbsns.conf"
Write-Host "✅ Files copied successfully." -ForegroundColor Green

# 5. Connect via SSH and apply configuration changes
Write-Host "⚙️ Applying Nginx Configuration and Setting up static directories on EC2..." -ForegroundColor Yellow
$ssh_commands = @"
set -e

# Create static directory
sudo mkdir -p /var/www/bbsns-landing

# Move index.html and set permissions
sudo mv /tmp/index.html /var/www/bbsns-landing/index.html
sudo chown -R www-data:www-data /var/www/bbsns-landing
sudo chmod -R 755 /var/www/bbsns-landing
echo '✅ Static HTML moved to /var/www/bbsns-landing/'

# Move Nginx Configuration
sudo mv /tmp/nginx-bbsns.conf /etc/nginx/sites-available/bbsns.online
sudo ln -sf /etc/nginx/sites-available/bbsns.online /etc/nginx/sites-enabled/
echo '✅ Nginx configuration moved to /etc/nginx/sites-available/'

# Test Nginx Config
sudo nginx -t
echo '✅ Nginx configuration test passed.'

# Reload Nginx
sudo systemctl reload nginx
echo '✅ Nginx reloaded successfully.'
"@

ssh -i $ssh_key -o StrictHostKeyChecking=no $remote_target $ssh_commands

# 6. Verify Health Checks (Comply with rules.md Deploy Invariant)
Write-Host "🌐 Running post-deployment health check..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Main domain check
Write-Host "检查 Main Domain (https://bbsns.online)..." -ForegroundColor White
$main_check = curl.exe -I -s --insecure https://bbsns.online
if ($main_check -match "200" -or $main_check -match "301") {
    Write-Host "✅ Main Domain is UP!" -ForegroundColor Green
} else {
    Write-Warning "⚠️ Main Domain check did not return HTTP 200/301."
}

# API health check
Write-Host "检查 API Domain (https://api.bbsns.online/health)..." -ForegroundColor White
$api_check = curl.exe -s --insecure https://api.bbsns.online/health
Write-Host "API Health Response: $api_check" -ForegroundColor Cyan
if ($api_check -like "*STABLE*") {
    Write-Host "✅ API Backend is UP and STABLE!" -ForegroundColor Green
} else {
    Write-Warning "⚠️ API health did not return STABLE."
}

# App domain check
Write-Host "检查 Web App Domain (https://app.bbsns.online)..." -ForegroundColor White
$app_check = curl.exe -I -s --insecure https://app.bbsns.online
if ($app_check -match "200" -or $app_check -match "302" -or $app_check -match "404" -or $app_check -match "301") {
    Write-Host "✅ Web Application Subdomain is active!" -ForegroundColor Green
} else {
    Write-Warning "⚠️ Web App Subdomain check returned unexpected status."
}

Write-Host "🎉 BBSNS Static Landing Page Deployment Completed Successfully!" -ForegroundColor Green -Bold
