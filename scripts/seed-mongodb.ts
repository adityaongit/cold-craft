import { connectDB } from '../src/lib/mongoose';
import { Category, Tag, Template, UserSettings } from '../src/models';
import mongoose from 'mongoose';

async function main() {
  console.log('Starting MongoDB seed...');

  await connectDB();

  // Clear existing data (NOT user/session/account - managed by Better Auth)
  await Promise.all([
    Category.deleteMany({}),
    Tag.deleteMany({}),
    Template.deleteMany({}),
    UserSettings.deleteMany({}),
    mongoose.connection.collection('usageHistory').deleteMany({}),
    mongoose.connection.collection('resumes').deleteMany({})
  ]);

  console.log('Cleared existing data');

  // Note: Users are managed by Better Auth (user, session, account collections)
  // You need to sign up through the app to create a user
  // For now, we'll use a placeholder userId - replace with your actual user ID after signing up
  const testUserId = 'test-user-id'; // Replace this with actual Better Auth user ID

  // Create user settings with global variables
  const testUserSettings = await UserSettings.create({
    userId: testUserId,
    globalVariables: [
      {
        name: 'myName',
        displayName: 'Your Name',
        value: 'John Doe',
        description: 'Your full name'
      },
      {
        name: 'email',
        displayName: 'Your Email',
        value: 'john.doe@example.com',
        description: 'Your professional email'
      },
      {
        name: 'phone',
        displayName: 'Your Phone',
        value: '+1 (555) 123-4567',
        description: 'Your phone number'
      },
      {
        name: 'currentCompany',
        displayName: 'Current Company',
        value: 'Tech Corp',
        description: 'Your current employer'
      },
      {
        name: 'currentRole',
        displayName: 'Current Role',
        value: 'Senior Software Engineer',
        description: 'Your current job title'
      }
    ]
  });

  console.log(`Created user settings for userId: ${testUserId}`);

  // Create categories
  const categories = await Category.create([
    {
      name: 'Job Applications',
      slug: 'job-applications',
      description: 'Templates for applying to jobs',
      icon: 'LinkedIn',
      order: 1,
      userId: testUserId
    },
    {
      name: 'Networking',
      slug: 'networking',
      description: 'Templates for professional networking',
      icon: 'LinkedIn',
      order: 2,
      userId: testUserId
    },
    {
      name: 'Follow-ups',
      slug: 'follow-ups',
      description: 'Templates for following up',
      icon: 'Gmail',
      order: 3,
      userId: testUserId
    },
    {
      name: 'Cold Outreach',
      slug: 'cold-outreach',
      description: 'Templates for cold emails and messages',
      icon: 'Gmail',
      order: 4,
      userId: testUserId
    }
  ]);

  console.log(`Created ${categories.length} categories`);

  // Create tags
  const tags = await Tag.create([
    { name: 'Software Engineering', color: '#3B82F6', userId: testUserId },
    { name: 'Product Management', color: '#F59E0B', userId: testUserId },
    { name: 'Design', color: '#EC4899', userId: testUserId },
    { name: 'Data Science', color: '#8B5CF6', userId: testUserId },
    { name: 'Marketing', color: '#10B981', userId: testUserId }
  ]);

  console.log(`Created ${tags.length} tags`);

  // Create templates
  const templates = await Template.create([
    {
      title: 'LinkedIn Connection Request - Tech Role',
      content: `Hi {{name}},

I came across your profile and was impressed by your work at {{company}}. I'm currently exploring opportunities in {{role}} and would love to connect with professionals in the field.

I noticed we both have experience with {{skill}}. Would you be open to a brief chat about your experience at {{company}}?

Looking forward to connecting!

Best regards,
{{myName}}`,
      description: 'Professional LinkedIn connection request for tech roles',
      userId: testUserId,
      categoryIds: [categories[1]._id],
      tagIds: [tags[0]._id],
      isFavorite: true,
      usageCount: 15,
      lastUsedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
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
      userId: testUserId,
      categoryIds: [categories[0]._id, categories[3]._id],
      tagIds: [tags[0]._id],
      isFavorite: true,
      usageCount: 23,
      lastUsedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    },
    {
      title: 'Follow-up After Interview',
      content: `Subject: Thank you - {{position}} Interview

Dear {{interviewerName}},

Thank you for taking the time to speak with me about the {{position}} role at {{company}}. I really enjoyed our conversation about {{topicDiscussed}} and learning more about the team's goals.

I'm even more excited about the opportunity after our discussion. The {{specificProject}} you mentioned aligns perfectly with my experience in {{relevantSkill}}.

Please let me know if you need any additional information from my end. I look forward to hearing about the next steps.

Best regards,
{{myName}}`,
      description: 'Professional follow-up email after job interview',
      userId: testUserId,
      categoryIds: [categories[2]._id],
      tagIds: [tags[0]._id],
      usageCount: 8,
      lastUsedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      title: 'LinkedIn Message - Informational Interview',
      content: `Hi {{name}},

I hope you're doing well! I'm {{myName}}, currently a {{currentRole}} at {{currentCompany}}.

I've been researching {{company}} and I'm really impressed by your work in {{area}}. I'm exploring opportunities in this space and would greatly appreciate 15-20 minutes of your time to learn about your experience and career journey.

Would you be available for a quick call in the next couple of weeks?

Thanks so much!
{{myName}}`,
      description: 'Request for informational interview on LinkedIn',
      userId: testUserId,
      categoryIds: [categories[1]._id],
      tagIds: [tags[0]._id, tags[1]._id],
      usageCount: 12,
      lastUsedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    },
    {
      title: 'Referral Request Email',
      content: `Hi {{name}},

I hope this email finds you well!

I wanted to reach out because I noticed that {{company}} is hiring for a {{position}} role. Based on my experience with {{skill1}} and {{skill2}}, I believe I'd be a great fit for the position.

Would you be comfortable referring me or introducing me to the hiring manager? I completely understand if you're not able to, but I thought I'd ask since we've worked together on {{project}}.

I've attached my resume for your reference. Happy to provide any additional information you might need!

Thanks for considering,
{{myName}}`,
      description: 'Request a referral from a connection',
      userId: testUserId,
      categoryIds: [categories[0]._id, categories[1]._id],
      tagIds: [tags[0]._id],
      usageCount: 6,
      isFavorite: false
    }
  ]);

  console.log(`Created ${templates.length} templates`);

  console.log('\n✅ Seed completed successfully!');
  console.log(`\nSummary:`);
  console.log(`- User settings for: ${testUserId}`);
  console.log(`- ${categories.length} categories`);
  console.log(`- ${tags.length} tags`);
  console.log(`- ${templates.length} templates`);
  console.log(`- All templates have auto-extracted variables`);

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});
