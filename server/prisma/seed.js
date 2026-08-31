import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STOCK = {
  hero: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1500&q=88",
  therapist: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=84",
  rehab: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=84",
  elder: "https://images.unsplash.com/photo-1581579185169-7f3db74f655e?auto=format&fit=crop&w=900&q=84",
  room: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=84",
  team: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1000&q=84"
};

const ADMIN_SERVICE_SEED = [
  {
    id: "svc-nursing",
    name: "24/7 skilled nursing",
    kind: "in-package",
    rate: 2800,
    summary: "Round-the-clock nursing. Medication administration.",
    content: "<h2>About 24/7 skilled nursing</h2><p>This service is coordinated around the patient's current needs, care goals and family preferences.</p><h3>What is included</h3><ul><li>Round-the-clock nursing</li><li>Medication administration</li><li>Daily doctor coordination</li></ul>",
    benefits: JSON.stringify(["Round-the-clock nursing", "Medication administration", "Daily doctor coordination"]),
    images: JSON.stringify([STOCK.rehab, STOCK.therapist]),
    active: true
  },
  {
    id: "svc-room",
    name: "Assisted living suite",
    kind: "in-package",
    rate: 1900,
    summary: "Private room. All meals.",
    content: "<h2>About Assisted living suite</h2><p>This service is coordinated around the patient's current needs, care goals and family preferences.</p><h3>What is included</h3><ul><li>Private room</li><li>All meals</li><li>Housekeeping and linen</li></ul>",
    benefits: JSON.stringify(["Private room", "All meals", "Housekeeping and linen"]),
    images: JSON.stringify([STOCK.room, STOCK.team]),
    active: true
  },
  {
    id: "svc-basic-physio",
    name: "Daily mobility physiotherapy",
    kind: "in-package",
    rate: 900,
    summary: "One guided session daily. Mobility assessment.",
    content: "<h2>About Daily mobility physiotherapy</h2><p>This service is coordinated around the patient's current needs, care goals and family preferences.</p><h3>What is included</h3><ul><li>One guided session daily</li><li>Mobility assessment</li><li>Progress review</li></ul>",
    benefits: JSON.stringify(["One guided session daily", "Mobility assessment", "Progress review"]),
    images: JSON.stringify([STOCK.therapist, STOCK.elder]),
    active: true
  },
  {
    id: "svc-palliative",
    name: "Palliative comfort support",
    kind: "in-package",
    rate: 1200,
    summary: "Symptom monitoring. Family counselling.",
    content: "<h2>About Palliative comfort support</h2><p>This service is coordinated around the patient's current needs, care goals and family preferences.</p><h3>What is included</h3><ul><li>Symptom monitoring</li><li>Family counselling</li><li>Comfort-care coordination</li></ul>",
    benefits: JSON.stringify(["Symptom monitoring", "Family counselling", "Comfort-care coordination"]),
    images: JSON.stringify([STOCK.elder, STOCK.room]),
    active: true
  },
  {
    id: "svc-neuro",
    name: "Intensive neuro physiotherapy",
    kind: "off-package",
    rate: 1500,
    summary: "Specialist neuro session. Gait and balance retraining.",
    content: "<h2>About Intensive neuro physiotherapy</h2><p>This service is coordinated around the patient's current needs, care goals and family preferences.</p><h3>What is included</h3><ul><li>Specialist neuro session</li><li>Gait and balance retraining</li><li>Outcome tracking</li></ul>",
    benefits: JSON.stringify(["Specialist neuro session", "Gait and balance retraining", "Outcome tracking"]),
    images: JSON.stringify([STOCK.rehab, STOCK.hero]),
    active: true
  },
  {
    id: "svc-speech",
    name: "Speech & swallow therapy",
    kind: "off-package",
    rate: 1100,
    summary: "Speech-language assessment. Swallow safety plan.",
    content: "<h2>About Speech & swallow therapy</h2><p>This service is coordinated around the patient's current needs, care goals and family preferences.</p><h3>What is included</h3><ul><li>Speech-language assessment</li><li>Swallow safety plan</li><li>Caregiver exercises</li></ul>",
    benefits: JSON.stringify(["Speech-language assessment", "Swallow safety plan", "Caregiver exercises"]),
    images: JSON.stringify([STOCK.therapist, STOCK.team]),
    active: true
  },
  {
    id: "svc-attendant",
    name: "Dedicated bedside attendant",
    kind: "off-package",
    rate: 1250,
    summary: "One-to-one assistance. Personal hygiene support.",
    content: "<h2>About Dedicated bedside attendant</h2><p>This service is coordinated around the patient's current needs, care goals and family preferences.</p><h3>What is included</h3><ul><li>One-to-one assistance</li><li>Personal hygiene support</li><li>Mobility escort</li></ul>",
    benefits: JSON.stringify(["One-to-one assistance", "Personal hygiene support", "Mobility escort"]),
    images: JSON.stringify([STOCK.elder, STOCK.hero]),
    active: true
  },
  {
    id: "svc-oxygen",
    name: "Oxygen concentrator support",
    kind: "off-package",
    rate: 650,
    summary: "Equipment use. Routine safety checks.",
    content: "<h2>About Oxygen concentrator support</h2><p>This service is coordinated around the patient's current needs, care goals and family preferences.</p><h3>What is included</h3><ul><li>Equipment use</li><li>Routine safety checks</li><li>Consumable coordination</li></ul>",
    benefits: JSON.stringify(["Equipment use", "Routine safety checks", "Consumable coordination"]),
    images: JSON.stringify([STOCK.room, STOCK.rehab]),
    active: true
  }
];

const PACKAGE_SEED = [
  {
    id: "pkg-recovery",
    name: "Supported Recovery",
    rate: 4750,
    serviceIds: JSON.stringify(["svc-nursing", "svc-room", "svc-basic-physio"]),
    benefits: JSON.stringify(["Coordinated daily care plan", "Weekly family update", "Discharge-readiness review"]),
    active: true
  },
  {
    id: "pkg-comfort",
    name: "Comfort & Long-Stay",
    rate: 5100,
    serviceIds: JSON.stringify(["svc-nursing", "svc-room", "svc-palliative"]),
    benefits: JSON.stringify(["Long-stay care coordination", "Comfort-focused reviews", "Family support"]),
    active: true
  }
];

const MEDIA_SEED = [
  {
    id: "media-blog-recovery",
    section: "blog",
    subtype: "article",
    title: "Why recovery plans work better when families can see the next step",
    excerpt: "A practical look at coordinated rehabilitation, measurable milestones and clearer family communication.",
    caption: "Coordinated rehabilitation milestones and family care pathways.",
    content: "<h2>Clarity is part of care</h2><p>Recovery can feel uncertain. A shared plan gives the patient, family and care team the same view of priorities, progress and the next review.</p><h3>Small milestones matter</h3><p>Meaningful progress may be a safer transfer, a longer walk, improved confidence or a more comfortable daily routine.</p>",
    mediaUrl: "",
    image: STOCK.rehab,
    images: JSON.stringify([STOCK.rehab, STOCK.therapist]),
    author: "Sri Thirumala Care Team",
    publishedAt: "2026-08-28",
    active: true
  },
  {
    id: "media-blog-longstay",
    section: "blog",
    subtype: "article",
    title: "Choosing respectful long-stay support",
    excerpt: "Questions families can ask when comparing nursing, assisted living and comfort-focused care.",
    caption: "Attentive long-stay routines and family-centered environments.",
    content: "<h2>Look beyond the room</h2><p>A strong long-stay plan combines attentive routines, transparent communication and services that can change as the person’s needs change.</p>",
    mediaUrl: "",
    image: STOCK.elder,
    images: JSON.stringify([STOCK.elder, STOCK.room]),
    author: "Admissions Team",
    publishedAt: "2026-08-23",
    active: true
  },
  {
    id: "media-testimonial-family",
    section: "testimonial",
    subtype: "testimonial-video",
    title: "A family’s experience of coordinated recovery",
    excerpt: "The family describes the value of consistent updates and one coordinated plan.",
    caption: "",
    content: "<p>Shared with consent for educational and community-awareness purposes.</p>",
    mediaUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
    image: STOCK.hero,
    images: JSON.stringify([]),
    author: "Family story",
    publishedAt: "2026-08-20",
    active: true
  },
  {
    id: "media-testimonial-care",
    section: "testimonial",
    subtype: "testimonial-video",
    title: "Feeling supported through a longer stay",
    excerpt: "A caregiver reflects on communication, comfort and continuity.",
    caption: "",
    content: "<p>A short caregiver testimonial about the long-stay care experience.</p>",
    mediaUrl: "",
    image: STOCK.room,
    images: JSON.stringify([]),
    author: "Caregiver story",
    publishedAt: "2026-08-17",
    active: true
  },
  {
    id: "media-youtube",
    section: "post",
    subtype: "youtube-video",
    title: "Inside a coordinated recovery day",
    excerpt: "A short video overview of care planning and daily routines.",
    caption: "",
    content: "<p>Watch an overview of how coordinated care days are structured.</p>",
    mediaUrl: "https://www.youtube.com/embed/ysz5S6PUM-U",
    image: STOCK.team,
    images: JSON.stringify([]),
    author: "YouTube",
    publishedAt: "2026-08-30",
    active: true
  },
  {
    id: "media-instagram-post",
    section: "post",
    subtype: "instagram-post",
    title: "A recovery milestone worth celebrating",
    excerpt: "A photo update from the rehabilitation team.",
    caption: "",
    content: "<p>Progress is personal, and every safe milestone deserves recognition.</p>",
    mediaUrl: "",
    image: STOCK.rehab,
    images: JSON.stringify([]),
    author: "Instagram",
    publishedAt: "2026-08-29",
    active: true
  },
  {
    id: "media-instagram-reel",
    section: "post",
    subtype: "instagram-reel",
    title: "Three ways caregivers can support daily mobility",
    excerpt: "A quick vertical-video guide for families.",
    caption: "",
    content: "<p>Simple prompts, safe pacing and encouragement can reinforce the care plan.</p>",
    mediaUrl: "",
    image: STOCK.therapist,
    images: JSON.stringify([]),
    author: "Instagram Reels",
    publishedAt: "2026-08-27",
    active: true
  },
  {
    id: "media-facebook-reel",
    section: "post",
    subtype: "facebook-reel",
    title: "Meet the care coordination team",
    excerpt: "A short introduction to the people who keep the plan connected.",
    caption: "",
    content: "<p>Meet the team supporting admissions, reviews and family updates.</p>",
    mediaUrl: "",
    image: STOCK.team,
    images: JSON.stringify([]),
    author: "Facebook Reels",
    publishedAt: "2026-08-26",
    active: true
  },
  {
    id: "media-facebook-post",
    section: "post",
    subtype: "facebook-post",
    title: "Family visiting and review guidance",
    excerpt: "Helpful information for planning a calm, useful visit.",
    caption: "",
    content: "<p>Coordinate longer visits and care-plan questions with the resident’s care coordinator.</p>",
    mediaUrl: "",
    image: STOCK.room,
    images: JSON.stringify([]),
    author: "Facebook",
    publishedAt: "2026-08-25",
    active: true
  },
  {
    id: "media-x-post",
    section: "post",
    subtype: "x-post",
    title: "Recovery update: consistency builds confidence",
    excerpt: "A concise progress reminder from the care team.",
    caption: "",
    content: "<p>Clear goals, consistent practice and regular reviews help make progress visible.</p>",
    mediaUrl: "",
    image: "",
    images: JSON.stringify([]),
    author: "X",
    publishedAt: "2026-08-24",
    active: true
  },
  {
    id: "media-image",
    section: "post",
    subtype: "image",
    title: "Spaces designed for calm recovery",
    excerpt: "A look at accessible, comfortable care spaces.",
    caption: "",
    content: "<p>Accessible movement routes and calm shared spaces support everyday routines.</p>",
    mediaUrl: "",
    image: STOCK.room,
    images: JSON.stringify([]),
    author: "Photo desk",
    publishedAt: "2026-08-22",
    active: true
  }
];

const ACCOMMODATION_SEED = [
  { id: "ROOM-101", type: "Room", label: "Private room 101", active: true },
  { id: "ROOM-102", type: "Room", label: "Shared room 102", active: true },
  { id: "BED-201-A", type: "Bed", label: "Bed A · room 201", active: true },
  { id: "BED-201-B", type: "Bed", label: "Bed B · room 201", active: true },
  { id: "BED-202-A", type: "Bed", label: "Bed A · room 202", active: true }
];

const INQUIRY_SEED = [
  {
    id: "INQ-1082",
    patient: "Savitri Amma",
    need: "Post-stroke rehabilitation",
    contact: "Arjun R.",
    phone: "+91 98480 11082",
    date: "30 Aug",
    start: "2026-09-02",
    duration: "30 days",
    language: "Telugu",
    room: "Private room",
    currentLocation: "Hospital",
    packageId: "pkg-recovery",
    offPackageServiceIds: JSON.stringify(["svc-neuro", "svc-speech"]),
    status: "New",
    priority: "High",
    basket: JSON.stringify(["Supported Recovery"])
  },
  {
    id: "INQ-1081",
    patient: "Mohan Babu",
    need: "Long-term skilled nursing",
    contact: "Sushma M.",
    phone: "+91 98480 11081",
    date: "30 Aug",
    start: "2026-09-05",
    duration: "60–90 days",
    language: "English",
    room: "Individual bed",
    currentLocation: "At home",
    packageId: "pkg-comfort",
    offPackageServiceIds: JSON.stringify(["svc-attendant"]),
    status: "Contacted",
    priority: "Medium",
    basket: JSON.stringify(["Comfort & Long-Stay"])
  },
  {
    id: "INQ-1080",
    patient: "Fathima Begum",
    need: "Palliative care",
    contact: "Irfan K.",
    phone: "+91 98480 11080",
    date: "29 Aug",
    start: "2026-09-01",
    duration: "30 days",
    language: "Urdu",
    room: "Private room",
    currentLocation: "Hospital",
    packageId: "pkg-comfort",
    offPackageServiceIds: JSON.stringify(["svc-oxygen"]),
    status: "Quote sent",
    priority: "High",
    basket: JSON.stringify(["Comfort & Long-Stay"])
  },
  {
    id: "INQ-1079",
    patient: "Joseph Paul",
    need: "Knee rehabilitation",
    contact: "Maria J.",
    phone: "+91 98480 11079",
    date: "29 Aug",
    start: "2026-08-30",
    duration: "30 days",
    language: "English",
    room: "Shared room",
    currentLocation: "Hospital",
    packageId: "pkg-recovery",
    offPackageServiceIds: JSON.stringify([]),
    status: "Admitted",
    priority: "Normal",
    basket: JSON.stringify(["Supported Recovery"])
  },
  {
    id: "INQ-1078",
    patient: "Vijaya Lakshmi",
    need: "Home physiotherapy",
    contact: "Kiran V.",
    phone: "+91 98480 11078",
    date: "28 Aug",
    start: "2026-09-03",
    duration: "14 days",
    language: "Telugu",
    room: "No preference",
    currentLocation: "At home",
    packageId: "pkg-recovery",
    offPackageServiceIds: JSON.stringify(["svc-neuro"]),
    status: "New",
    priority: "Normal",
    basket: JSON.stringify(["Supported Recovery"])
  }
];

const ADMISSION_SEED = [
  {
    id: "ADM-1042",
    patient: "Lakshmi Devi",
    age: 68,
    gender: "Female",
    contact: "Ravi Kumar",
    phone: "+91 98480 21042",
    address: "Khammam",
    need: "Stroke recovery and assisted living",
    language: "Telugu",
    currentLocation: "Hospital",
    roomPreference: "Private room",
    admissionDate: "2026-08-01",
    expectedDischarge: "2026-08-30",
    stayType: "staying",
    accommodationId: "ROOM-101",
    packageId: "pkg-recovery",
    offPackageServiceIds: JSON.stringify(["svc-neuro"]),
    sourceInquiryId: "",
    status: "Admitted"
  },
  {
    id: "ADM-1043",
    patient: "Ramesh Goud",
    age: 74,
    gender: "Male",
    contact: "Suma Goud",
    phone: "+91 98480 21043",
    address: "Wyra",
    need: "Long-term nursing and comfort support",
    language: "Telugu",
    currentLocation: "At home",
    roomPreference: "Individual bed",
    admissionDate: "2026-08-10",
    expectedDischarge: "2026-09-08",
    stayType: "staying",
    accommodationId: "BED-201-A",
    packageId: "pkg-comfort",
    offPackageServiceIds: JSON.stringify(["svc-attendant", "svc-oxygen"]),
    sourceInquiryId: "",
    status: "Admitted"
  }
];

const PROGRESS_SEED = {
  "ADM-1042": [
    {
      id: "prog-c9a21f",
      at: new Date("2026-08-30T09:15:00Z"),
      author: "Dr. Kavya",
      status: "On track",
      category: "Mobility",
      note: "Completed assisted corridor walk with improved left-foot clearance. Continue the current recovery plan."
    },
    {
      id: "prog-88bf04",
      at: new Date("2026-08-27T16:30:00Z"),
      author: "P. Sandeep",
      status: "Improving",
      category: "Therapy review",
      note: "Transfers now require one-person assistance instead of two-person assistance."
    },
    {
      id: "prog-4e731d",
      at: new Date("2026-08-22T11:10:00Z"),
      author: "Care coordinator",
      status: "Plan updated",
      category: "Family review",
      note: "Family briefing completed and home-readiness goals added to the discharge checklist."
    }
  ],
  "ADM-1043": [
    {
      id: "prog-7ad310",
      at: new Date("2026-08-30T08:45:00Z"),
      author: "Ananya Rao",
      status: "Stable",
      category: "Daily review",
      note: "Comfort, nutrition and assisted-living routines remain stable. No escalation required."
    },
    {
      id: "prog-b02f6c",
      at: new Date("2026-08-25T14:20:00Z"),
      author: "Care coordinator",
      status: "Service added",
      category: "Care plan",
      note: "Dedicated bedside attendant added following the family review."
    }
  ]
};

const BILLING_PROFILE_SEED = [
  {
    id: "bill-ADM-1042",
    admissionId: "ADM-1042",
    start: "2026-08-01",
    end: "2026-08-30",
    packageId: "pkg-recovery",
    packageDiscountType: "percent",
    packageDiscount: 0,
    addOns: JSON.stringify([
      {
        id: "addon-svc-neuro-0",
        serviceId: "svc-neuro",
        start: "2026-08-01",
        end: "2026-08-30",
        qty: 1,
        discountType: "percent",
        discount: 0
      }
    ]),
    customLines: JSON.stringify([]),
    globalType: "percent",
    globalDiscount: 0,
    tax: 0
  },
  {
    id: "bill-ADM-1043",
    admissionId: "ADM-1043",
    start: "2026-08-10",
    end: "2026-08-30",
    packageId: "pkg-comfort",
    packageDiscountType: "percent",
    packageDiscount: 0,
    addOns: JSON.stringify([
      {
        id: "addon-svc-attendant-0",
        serviceId: "svc-attendant",
        start: "2026-08-10",
        end: "2026-08-30",
        qty: 1,
        discountType: "percent",
        discount: 0
      },
      {
        id: "addon-svc-oxygen-1",
        serviceId: "svc-oxygen",
        start: "2026-08-10",
        end: "2026-08-30",
        qty: 1,
        discountType: "percent",
        discount: 0
      }
    ]),
    customLines: JSON.stringify([]),
    globalType: "percent",
    globalDiscount: 0,
    tax: 0
  }
];

const PAYMENT_SEED = [
  {
    id: "PAY-1042-1",
    admissionId: "ADM-1042",
    amount: 45000,
    at: new Date("2026-08-18T10:30:00Z"),
    note: "Advance payment",
    method: "UPI"
  },
  {
    id: "PAY-1043-1",
    admissionId: "ADM-1043",
    amount: 60000,
    at: new Date("2026-08-20T12:10:00Z"),
    note: "Admission deposit",
    method: "Bank transfer"
  }
];

export async function main() {
  console.log("🌱 Checking and seeding database...");

  // 1. Services
  const serviceCount = await prisma.service.count();
  if (serviceCount === 0) {
    console.log("Inserting initial services seed...");
    for (const s of ADMIN_SERVICE_SEED) {
      await prisma.service.create({ data: s });
    }
  } else {
    console.log(`Services table already has ${serviceCount} rows, skipping.`);
  }

  // 2. Packages
  const packageCount = await prisma.package.count();
  if (packageCount === 0) {
    console.log("Inserting initial packages seed...");
    for (const p of PACKAGE_SEED) {
      await prisma.package.create({ data: p });
    }
  } else {
    console.log(`Packages table already has ${packageCount} rows, skipping.`);
  }

  // 3. Media Items
  const mediaCount = await prisma.mediaItem.count();
  if (mediaCount === 0) {
    console.log("Inserting initial media items seed...");
    for (const m of MEDIA_SEED) {
      await prisma.mediaItem.create({ data: m });
    }
  } else {
    console.log(`MediaItems table already has ${mediaCount} rows, skipping.`);
  }

  // 4. Accommodations
  const accommodationCount = await prisma.accommodation.count();
  if (accommodationCount === 0) {
    console.log("Inserting initial accommodations seed...");
    for (const a of ACCOMMODATION_SEED) {
      await prisma.accommodation.create({ data: a });
    }
  } else {
    console.log(`Accommodations table already has ${accommodationCount} rows, skipping.`);
  }

  // 5. Inquiries
  const inquiryCount = await prisma.inquiry.count();
  if (inquiryCount === 0) {
    console.log("Inserting initial inquiries seed...");
    for (const inq of INQUIRY_SEED) {
      await prisma.inquiry.create({ data: inq });
    }
  } else {
    console.log(`Inquiries table already has ${inquiryCount} rows, skipping.`);
  }

  // 6. Admissions
  const admissionCount = await prisma.admission.count();
  if (admissionCount === 0) {
    console.log("Inserting initial admissions seed...");
    for (const adm of ADMISSION_SEED) {
      await prisma.admission.create({ data: adm });
    }
  } else {
    console.log(`Admissions table already has ${admissionCount} rows, skipping.`);
  }

  // 7. Resident Progress
  const progressCount = await prisma.residentProgress.count();
  if (progressCount === 0) {
    console.log("Inserting initial progress records seed...");
    for (const [admissionId, list] of Object.entries(PROGRESS_SEED)) {
      for (const pr of list) {
        await prisma.residentProgress.create({
          data: {
            id: pr.id,
            admissionId,
            at: pr.at,
            author: pr.author,
            status: pr.status,
            category: pr.category,
            note: pr.note
          }
        });
      }
    }
  } else {
    console.log(`ResidentProgress table already has ${progressCount} rows, skipping.`);
  }

  // 8. Billing Profiles
  const billingCount = await prisma.billingProfile.count();
  if (billingCount === 0) {
    console.log("Inserting initial billing profiles seed...");
    for (const b of BILLING_PROFILE_SEED) {
      await prisma.billingProfile.create({ data: b });
    }
  } else {
    console.log(`BillingProfile table already has ${billingCount} rows, skipping.`);
  }

  // 9. Payments
  const paymentCount = await prisma.payment.count();
  if (paymentCount === 0) {
    console.log("Inserting initial payments seed...");
    for (const pay of PAYMENT_SEED) {
      await prisma.payment.create({ data: pay });
    }
  } else {
    console.log(`Payment table already has ${paymentCount} rows, skipping.`);
  }

  console.log("✅ Seed check and execution completed successfully.");
}

if (process.argv[1] === import.meta.filename) {
  main()
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
