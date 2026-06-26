const { S3Client, CreateBucketCommand, HeadBucketCommand } = require("@aws-sdk/client-s3");

async function checkAndCreate() {
  const bucket = "cloud-doc-bbsns-960828421625";
  const region = "ap-south-1";
  const client = new S3Client({ region });
  
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log("Bucket exists.");
  } catch (err) {
    if (err.name === 'NotFound') {
      console.log("Bucket missing. Creating...");
      try {
        await client.send(new CreateBucketCommand({ 
          Bucket: bucket, 
          CreateBucketConfiguration: region !== 'us-east-1' ? { LocationConstraint: region } : undefined 
        }));
        console.log("Bucket created successfully.");
      } catch (createErr) {
        console.error("Failed to create bucket:", createErr);
      }
    } else {
      console.log("Head bucket error:", err);
    }
  }
}

checkAndCreate();
