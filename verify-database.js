/**
 * Quick script to verify database tables were created correctly
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying database tables...\n');

    // Check if tables exist by trying to query them
    const sessionCount = await prisma.session.count();
    console.log('✅ Session table exists');

    const conversationCount = await prisma.conversation.count();
    console.log('✅ Conversation table exists');

    const messageCount = await prisma.message.count();
    console.log('✅ Message table exists');

    const settingsCount = await prisma.storeSettings.count();
    console.log('✅ StoreSettings table exists');

    console.log('\n📊 Table counts:');
    console.log(`   Sessions: ${sessionCount}`);
    console.log(`   Conversations: ${conversationCount}`);
    console.log(`   Messages: ${messageCount}`);
    console.log(`   Store Settings: ${settingsCount}`);

    console.log('\n✅ All tables verified successfully!');
    console.log('\n💡 You can also use Prisma Studio to view your database:');
    console.log('   npx prisma studio');

  } catch (error) {
    console.error('❌ Error verifying database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();






