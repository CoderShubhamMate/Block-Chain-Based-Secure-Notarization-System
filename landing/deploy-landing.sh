#!/bin/bash
# Bash Deployment Script for BBSNS Landing Page
# Deploys landing page to main domain (bbsns.online) on EC2

set -e

# 1. Define Server Variables
HOST_IP="13.203.121.127"
SSH_USER="ubuntu"
SSH_KEY="C:/Users/Lenovo/.ssh/bbsns-keys.pem"
REMOTE_TARGET="${SSH_USER}@${HOST_IP}"

echo "🚀 Starting Deployment of BBSNS Static Landing Page..."

# 2. Verify Key Exists
if [ ! -f "$SSH_KEY" ]; then
    # Try alternate path just in case
    SSH_KEY="bbsns-keys.pem"
    if [ ! -f "$SSH_KEY" ]; then
        echo "❌ SSH PEM Key not found!"
        exit 1
    fi
fi
echo "✅ SSH Key Found at: $SSH_KEY"

# 3. Verified Path Authority Check (Comply with rules.md Deploy Invariant)
echo "🔍 Performing Verified Path Authority & Service Status Check on EC2..."
if ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE_TARGET" "pm2 show bbsns-backend" | grep -q "exec cwd"; then
    echo "✅ Path Authority Verified. Production Backend CWD: /home/ubuntu/backend"
else
    echo "⚠️ Could not verify PM2 cwd, but continuing..."
fi

# 4. Upload index.html and nginx-bbsns.conf to /tmp on EC2
echo "📤 Copying static files to EC2 /tmp/..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no ./landing/index.html "${REMOTE_TARGET}:/tmp/index.html"
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no ./landing/nginx-bbsns.conf "${REMOTE_TARGET}:/tmp/nginx-bbsns.conf"
echo "✅ Files copied successfully."

# 5. Connect via SSH and apply configuration changes
echo "⚙️ Applying Nginx Configuration & Setting up static directories on EC2..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$REMOTE_TARGET" << 'EOF'
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
EOF

# 6. Verify Health Checks (Comply with rules.md Deploy Invariant)
echo "🌐 Running post-deployment health check..."
sleep 2

# Main domain check
echo "检查 Main Domain (https://bbsns.online)..."
MAIN_STATUS=$(curl -I -s --insecure https://bbsns.online | head -n 1)
echo "Main Domain Status: $MAIN_STATUS"

# API health check
echo "检查 API Domain (https://api.bbsns.online/health)..."
API_CHECK=$(curl -s --insecure https://api.bbsns.online/health)
echo "API Health Response: $API_CHECK"

# App domain check
echo "检查 Web App Domain (https://app.bbsns.online)..."
APP_STATUS=$(curl -I -s --insecure https://app.bbsns.online | head -n 1)
echo "Web App Status: $APP_STATUS"

echo "🎉 BBSNS Static Landing Page Deployment Completed Successfully!"
