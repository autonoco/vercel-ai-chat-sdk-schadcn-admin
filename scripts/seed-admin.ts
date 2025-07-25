#!/usr/bin/env tsx

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { user, suggestedPrompt } from '../lib/db/schema';
import { generateHashedPassword } from '../lib/db/utils';
import { getDatabaseUrl } from '../config/environments';

// Load environment variables
config({ path: '.env.local' });

async function seed() {
  console.log('🌱 Seeding database...\n');

  const client = postgres(getDatabaseUrl());
  const db = drizzle(client);

  try {
    // Create super admin user
    console.log('Creating super admin user...');
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD environment variables are required');
    }

    const hashedPassword = generateHashedPassword(password);

    const [existingAdmin] = await db
      .select()
      .from(user)
      .where(eq(user.email, email));

    let adminUserId: string;

    if (existingAdmin) {
      console.log('✅ Super admin already exists');
      adminUserId = existingAdmin.id;

      // Update to super_admin role if needed
      if (existingAdmin.role !== 'super_admin') {
        await db
          .update(user)
          .set({ role: 'super_admin', updatedAt: new Date() })
          .where(eq(user.id, existingAdmin.id));
        console.log('✅ Updated existing user to super_admin role');
      }
    } else {
      const [newAdmin] = await db
        .insert(user)
        .values({
          email,
          password: hashedPassword,
          role: 'super_admin',
        })
        .returning();

      adminUserId = newAdmin.id;
      console.log('✅ Super admin created');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log('   ⚠️  Please change the password after first login!\n');
    }

    // Seed suggested prompts
    console.log('Creating suggested prompts...');

    const defaultPrompts = [
      {
        title: 'What are the advantages',
        prompt: 'What are the advantages of using Next.js?',
        category: 'Technical',
        order: 1,
        createdBy: adminUserId,
      },
      {
        title: 'Write code to',
        prompt: "Write code to demonstrate Dijkstra's algorithm",
        category: 'Programming',
        order: 2,
        createdBy: adminUserId,
      },
      {
        title: 'Help me write',
        prompt: 'Help me write an essay about Silicon Valley',
        category: 'Writing',
        order: 3,
        createdBy: adminUserId,
      },
      {
        title: 'Explain the concept',
        prompt: 'Explain the concept of machine learning in simple terms',
        category: 'Educational',
        order: 4,
        createdBy: adminUserId,
      },
      {
        title: 'Create a plan',
        prompt: 'Create a plan for building a SaaS application',
        category: 'Planning',
        order: 5,
        createdBy: adminUserId,
      },
      {
        title: 'Debug this code',
        prompt: "Debug this code and explain what's wrong",
        category: 'Programming',
        order: 6,
        createdBy: adminUserId,
      },
    ];

    // Check if prompts already exist
    const existingPrompts = await db.select().from(suggestedPrompt);

    if (existingPrompts.length === 0) {
      await db.insert(suggestedPrompt).values(defaultPrompts);
      console.log(`✅ Created ${defaultPrompts.length} suggested prompts\n`);
    } else {
      console.log(
        `✅ Suggested prompts already exist (${existingPrompts.length} found)\n`,
      );
    }

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Import eq from drizzle
import { eq } from 'drizzle-orm';

// Run the seed function
seed().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
