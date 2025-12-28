import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.usageHistory.deleteMany();
  await prisma.variable.deleteMany();
  await prisma.template.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.resumeVersion.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.globalVariable.deleteMany();
  await prisma.contact.deleteMany();

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Job Applications',
        slug: 'job-applications',
        description: 'Templates for applying to jobs',
        color: '#6366F1',
        icon: 'briefcase',
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Networking',
        slug: 'networking',
        description: 'Templates for professional networking',
        color: '#8B5CF6',
        icon: 'users',
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Follow-ups',
        slug: 'follow-ups',
        description: 'Templates for following up on conversations',
        color: '#EC4899',
        icon: 'arrow-right',
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Cold Outreach',
        slug: 'cold-outreach',
        description: 'Templates for cold emails and messages',
        color: '#10B981',
        icon: 'mail',
        order: 4,
      },
    }),
  ]);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'Software Engineering', color: '#3B82F6' } }),
    prisma.tag.create({ data: { name: 'Product Management', color: '#F59E0B' } }),
    prisma.tag.create({ data: { name: 'Design', color: '#EC4899' } }),
    prisma.tag.create({ data: { name: 'Data Science', color: '#8B5CF6' } }),
    prisma.tag.create({ data: { name: 'Marketing', color: '#10B981' } }),
  ]);

  // Create templates
  const template1 = await prisma.template.create({
    data: {
      title: 'LinkedIn Connection Request - Tech Role',
      content: `Hi {{name}},

I came across your profile and was impressed by your work at {{company}}. I'm currently exploring opportunities in {{role}} and would love to connect with professionals in the field.

I noticed we both have experience with {{skill}}. Would you be open to a brief chat about your experience at {{company}}?

Looking forward to connecting!

Best regards,
{{myName}}`,
      description: 'Professional LinkedIn connection request for tech roles',
      platform: 'LINKEDIN',
      tone: 'PROFESSIONAL',
      length: 'MEDIUM',
      usageCount: 15,
      lastUsedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      isFavorite: true,
      categories: {
        connect: [{ id: categories[1].id }],
      },
      tags: {
        connect: [{ id: tags[0].id }],
      },
    },
  });

  const template2 = await prisma.template.create({
    data: {
      title: 'Cold Email - Software Engineer Position',
      content: `Subject: {{position}} Role at {{company}}

Dear {{hiringManager}},

I hope this email finds you well. My name is {{myName}}, and I'm a {{yearsOfExperience}}-year software engineer with expertise in {{primarySkill}}, {{secondarySkill}}, and {{tertiarySkill}}.

I'm reaching out because I'm very interested in the {{position}} role at {{company}}. I've been following your company's work on {{product}}, and I'm particularly excited about {{specificFeature}}.

In my current role at {{currentCompany}}, I've:
- {{achievement1}}
- {{achievement2}}
- {{achievement3}}

I'd love to discuss how my experience aligns with your team's needs. I've attached my resume for your review.

Would you be available for a brief call next week?

Best regards,
{{myName}}
{{email}}
{{phone}}`,
      description: 'Professional cold email for software engineering positions',
      platform: 'COLD_EMAIL',
      tone: 'PROFESSIONAL',
      length: 'LONG',
      usageCount: 23,
      lastUsedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      isFavorite: true,
      categories: {
        connect: [{ id: categories[0].id }, { id: categories[3].id }],
      },
      tags: {
        connect: [{ id: tags[0].id }],
      },
    },
  });

  const template3 = await prisma.template.create({
    data: {
      title: 'Follow-up After Interview',
      content: `Subject: Thank you - {{position}} Interview

Dear {{interviewerName}},

Thank you for taking the time to speak with me about the {{position}} role at {{company}}. I really enjoyed our conversation about {{topicDiscussed}} and learning more about the team's goals.

I'm even more excited about the opportunity after our discussion. The {{specificProject}} you mentioned aligns perfectly with my experience in {{relevantSkill}}.

Please let me know if you need any additional information from my end. I look forward to hearing about the next steps.

Best regards,
{{myName}}`,
      description: 'Professional follow-up email after job interview',
      platform: 'GMAIL',
      tone: 'FRIENDLY',
      length: 'MEDIUM',
      usageCount: 8,
      lastUsedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      categories: {
        connect: [{ id: categories[2].id }],
      },
      tags: {
        connect: [{ id: tags[0].id }],
      },
    },
  });

  const template4 = await prisma.template.create({
    data: {
      title: 'LinkedIn Message - Informational Interview',
      content: `Hi {{name}},

I hope you're doing well! I'm {{myName}}, currently a {{currentRole}} at {{currentCompany}}.

I've been researching {{company}} and I'm really impressed by your work in {{area}}. I'm exploring opportunities in this space and would greatly appreciate 15-20 minutes of your time to learn about your experience and career journey.

Would you be available for a quick call in the next couple of weeks?

Thanks so much!
{{myName}}`,
      description: 'Request for informational interview on LinkedIn',
      platform: 'LINKEDIN',
      tone: 'CASUAL',
      length: 'SHORT',
      usageCount: 12,
      lastUsedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      categories: {
        connect: [{ id: categories[1].id }],
      },
      tags: {
        connect: [{ id: tags[0].id }, { id: tags[1].id }],
      },
    },
  });

  const template5 = await prisma.template.create({
    data: {
      title: 'Referral Request Email',
      content: `Hi {{name}},

I hope this email finds you well!

I wanted to reach out because I noticed that {{company}} is hiring for a {{position}} role. Based on my experience with {{skill1}} and {{skill2}}, I believe I'd be a great fit for the position.

Would you be comfortable referring me or introducing me to the hiring manager? I completely understand if you're not able to, but I thought I'd ask since we've worked together on {{project}}.

I've attached my resume for your reference. Happy to provide any additional information you might need!

Thanks for considering,
{{myName}}`,
      description: 'Request a referral from a connection',
      platform: 'GMAIL',
      tone: 'FRIENDLY',
      length: 'MEDIUM',
      usageCount: 6,
      isFavorite: false,
      categories: {
        connect: [{ id: categories[0].id }, { id: categories[1].id }],
      },
      tags: {
        connect: [{ id: tags[0].id }],
      },
    },
  });

  // Create global variables
  await Promise.all([
    prisma.globalVariable.create({
      data: {
        name: 'myName',
        displayName: 'Your Name',
        value: 'John Doe',
        description: 'Your full name',
      },
    }),
    prisma.globalVariable.create({
      data: {
        name: 'email',
        displayName: 'Your Email',
        value: 'john.doe@example.com',
        description: 'Your professional email',
      },
    }),
    prisma.globalVariable.create({
      data: {
        name: 'phone',
        displayName: 'Your Phone',
        value: '+1 (555) 123-4567',
        description: 'Your phone number',
      },
    }),
    prisma.globalVariable.create({
      data: {
        name: 'currentCompany',
        displayName: 'Current Company',
        value: 'Tech Corp',
        description: 'Your current employer',
      },
    }),
    prisma.globalVariable.create({
      data: {
        name: 'currentRole',
        displayName: 'Current Role',
        value: 'Senior Software Engineer',
        description: 'Your current job title',
      },
    }),
  ]);

  // Create contacts
  await Promise.all([
    prisma.contact.create({
      data: {
        name: 'Jane Smith',
        email: 'jane.smith@company.com',
        linkedin: 'https://linkedin.com/in/janesmith',
        company: 'Tech Startup Inc',
        position: 'Engineering Manager',
      },
    }),
    prisma.contact.create({
      data: {
        name: 'Bob Johnson',
        email: 'bob.j@bigcorp.com',
        linkedin: 'https://linkedin.com/in/bobjohnson',
        company: 'Big Corp',
        position: 'Senior Recruiter',
      },
    }),
  ]);

  console.log('Seed completed successfully!');
  console.log(`Created:`);
  console.log(`- ${categories.length} categories`);
  console.log(`- ${tags.length} tags`);
  console.log(`- 5 templates`);
  console.log(`- 5 global variables`);
  console.log(`- 2 contacts`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
