sudo -u postgres psql -d notarydb -c "SELECT id, email, wallet_address, role, identity_state, role_tx_status FROM users WHERE role = 'notary' OR identity_state = 'PENDING' ORDER BY created_at DESC LIMIT 5;"
sudo -u postgres psql -d notarydb -c "SELECT id, email, wallet_address, status FROM notary_applications WHERE status IN ('approved', 'activated') ORDER BY updated_at DESC LIMIT 3;"
