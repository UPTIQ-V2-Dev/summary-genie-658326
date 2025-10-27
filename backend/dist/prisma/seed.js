import { PrismaClient, Role } from '../generated/prisma/index.js';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Starting database seeding...');
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin',
            password: adminPassword,
            role: Role.ADMIN,
            isEmailVerified: true
        }
    });
    console.log('✅ Created admin user:', admin.email);
    // Create regular user for testing summaries
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            name: 'John Doe',
            password: userPassword,
            role: Role.USER,
            isEmailVerified: true
        }
    });
    console.log('✅ Created regular user:', user.email);
    // Create sample summaries for the user
    const sampleSummary1 = await prisma.summary.upsert({
        where: { id: 1 },
        update: {},
        create: {
            originalText: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            summary: 'Lorem ipsum is a placeholder text commonly used in the printing and typesetting industry. It serves as a standard dummy text that allows designers and developers to focus on visual elements rather than content.',
            length: 'medium',
            style: 'paragraph',
            wordCount: 34,
            characterCount: 210,
            title: 'Lorem Ipsum Placeholder Text',
            userId: user.id
        }
    });
    const sampleSummary2 = await prisma.summary.upsert({
        where: { id: 2 },
        update: {},
        create: {
            originalText: 'Artificial Intelligence (AI) is a rapidly evolving field that aims to create intelligent machines capable of performing tasks that typically require human intelligence. These tasks include learning, reasoning, problem-solving, perception, and natural language processing. Machine learning, a subset of AI, enables systems to automatically learn and improve from experience without being explicitly programmed.',
            summary: '• AI creates intelligent machines for human-like tasks\n• Includes learning, reasoning, and language processing\n• Machine learning enables automatic improvement from experience',
            length: 'short',
            style: 'bullets',
            wordCount: 18,
            characterCount: 143,
            title: 'Artificial Intelligence Overview',
            userId: user.id
        }
    });
    console.log('✅ Created sample summaries:', sampleSummary1.id, sampleSummary2.id);
}
main()
    .catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
