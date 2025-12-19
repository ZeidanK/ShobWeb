#!/bin/bash

# Default users setup script for Event Monitoring MVP
echo "Creating default users..."

# Admin user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com", 
    "password": "password123",
    "role": "admin"
  }'

echo -e "\n✓ Admin user created"

# Operator user 1
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "operator1",
    "email": "operator1@example.com",
    "password": "password123", 
    "role": "operator"
  }'

echo -e "\n✓ Operator1 user created"

# Operator user 2  
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "operator2",
    "email": "operator2@example.com",
    "password": "password123",
    "role": "operator"
  }'

echo -e "\n✓ Operator2 user created"
echo -e "\n🎉 Default users setup complete!"
echo -e "\nDefault login credentials:"
echo -e "- Email: admin@example.com"
echo -e "- Password: password123"