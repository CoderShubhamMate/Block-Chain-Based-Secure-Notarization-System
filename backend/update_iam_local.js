const { IAMClient, DeleteRolePolicyCommand, PutRolePolicyCommand } = require('@aws-sdk/client-iam');

async function updateIAM() {
  const iam = new IAMClient({ region: 'ap-south-1' });
  const roleName = 'bbsns-backend-role';
  
  try {
    console.log('Attempting to delete old inline policy...');
    await iam.send(new DeleteRolePolicyCommand({
      RoleName: roleName,
      PolicyName: 'bbsns-s3-access-policy'
    }));
    console.log('Old policy deleted.');
  } catch (err) {
    console.log('Old policy deletion skipped/failed:', err.message);
  }

  try {
    console.log('Attaching new broad S3 policy...');
    const policyDoc = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'BBSNSBucketAccess',
          Effect: 'Allow',
          Action: ['s3:ListBucket'],
          Resource: 'arn:aws:s3:::cloud-doc-bbsns-960828421625-ap-south-1-an'
        },
        {
          Sid: 'BBSNSObjectAccess',
          Effect: 'Allow',
          Action: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject'],
          Resource: 'arn:aws:s3:::cloud-doc-bbsns-960828421625-ap-south-1-an/*'
        }
      ]
    };
    
    await iam.send(new PutRolePolicyCommand({
      RoleName: roleName,
      PolicyName: 'BBSNS-S3-ACCESS',
      PolicyDocument: JSON.stringify(policyDoc)
    }));
    console.log('✅ New S3 policy attached via AWS SDK!');
  } catch (err) {
    console.error('Failed to attach policy:', err.message);
  }
}

updateIAM();
