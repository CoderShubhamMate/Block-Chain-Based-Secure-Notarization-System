curl -s -X POST http://localhost:5000/api/auth/remote/session/notarize \
  -H 'Content-Type: application/json' \
  -d '{
    "device_id": "test-device",
    "document_id": 1,
    "payload": {
      "docHash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      "ownerAddress": "0x1234567890123456789012345678901234567890",
      "status": 1,
      "summaryHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "rejectionReasonHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
      "timestamp": 1714414792,
      "nonce": 1
    }
  }'
