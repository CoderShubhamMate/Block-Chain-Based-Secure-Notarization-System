psql postgres://bbsns_user:bbsns_pass@localhost:5432/notarydb -c "SELECT wallet_address, identity_state FROM users WHERE role = 'notary'"
