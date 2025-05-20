import { PrismaClient } from '@prisma/client';

async function main() {
  // Create a new Prisma Client
  const prisma = new PrismaClient();
  
  try {
    // Test connection by querying a simple count
    const userCount = await prisma.user.count();
    console.log('Database connection successful!');
    console.log(`Number of users in the database: ${userCount}`);
    
    // Success state
    return true;
  } catch (error) {
    console.error('Error connecting to the database:');
    console.error(error);
    
    // Failed state
    return false;
  } finally {
    // Always disconnect
    await prisma.$disconnect();
  }
}

// Run the main function
main()
  .then((success) => {
    if (success) {
      console.log('Database test completed successfully.');
      process.exit(0);
    } else {
      console.error('Database test failed.');
      process.exit(1);
    }
  })
  .catch((e) => {
    console.error('Unexpected error during database test:');
    console.error(e);
    process.exit(1);
  });
