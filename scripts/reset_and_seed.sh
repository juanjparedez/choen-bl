#!/bin/bash

# This script resets the database and seeds it with initial data.


npx prisma migrate reset --force
npx prisma db seed
npx prisma generate

if [ $? -eq 0 ]; then
  echo "Database reset and seeded successfully."
else
  echo "An error occurred while resetting or seeding the database."
  exit 1
fi
# Optionally, you can run the application after resetting and seeding the database
# npm run dev