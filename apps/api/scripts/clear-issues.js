import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clear() {
  await prisma.issueItemSignature.deleteMany();
  await prisma.ppeIssueItem.deleteMany();
  await prisma.signatureRequest.deleteMany();
  await prisma.ppeIssue.deleteMany();
  console.log('Recent issues cleared.');
}

clear()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
