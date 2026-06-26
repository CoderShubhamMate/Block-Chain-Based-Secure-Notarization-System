const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const fs = require('fs');
const path = require('path');

async function rescue() {
  console.log("🚑 BBSNS Emergency Secret Rescue Starting...");
  
  const client = new SecretsManagerClient({ region: "ap-south-1" });
  const secretId = "bbsns/prod/secrets";
  const envPath = path.join(__dirname, '../.env');

  try {
    const response = await client.send(new GetSecretValueCommand({ SecretId: secretId }));
    if (!response.SecretString) throw new Error("No SecretString found in vault.");

    const secrets = JSON.parse(response.SecretString);
    console.log("✅ Authoritative secrets retrieved from AWS.");

    let envContent = fs.readFileSync(envPath, 'utf8');
    
    const required = [
      'JWT_SECRET', 
      'BNB_SYSTEM_PRIVATE_KEY', 
      'CHAIN_ID', 
      'AWS_S3_BUCKET', 
      'AWS_REGION', 
      'WEB_APP_URL',
      'RPC_URL'
    ];

    let updated = false;
    required.forEach(key => {
      if (secrets[key]) {
        if (!envContent.includes(`${key}=`)) {
          envContent += `\n${key}=${secrets[key]}`;
          console.log(`   + Added: ${key}`);
          updated = true;
        } else {
          console.log(`   - Existing: ${key}`);
        }
      }
    });

    if (updated) {
      fs.writeFileSync(envPath, envContent);
      console.log("✅ .env file updated successfully.");
    } else {
      console.log("ℹ️ .env already contains all vaulted secrets.");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Rescue Failed:", err.message);
    process.exit(1);
  }
}

rescue();
