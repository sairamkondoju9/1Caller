/**
 * NLP Employee Builder Engine (Generic & Resilient Architecture)
 * Converts unstructured plain language briefings into full conversational call flows,
 * contextual questions, and role/business metadata across ANY industry.
 * 
 * Precedence Rule:
 *   1. Explicit user instructions in prompt (HIGHEST PRECEDENCE)
 *   2. Selected category as contextual guidance (when prompt is generic or complementary)
 *   3. Intelligent semantic extraction for unpredictable custom prompts
 */

import { sanitizeContextForIndustry, extractLocation } from './sanitizeContext.js';

export function parsePromptToCallFlow(rawPrompt = '', language = 'te', userCategory = null) {
  let prompt = (rawPrompt || '').trim();
  const categoryLower = (userCategory || '').toLowerCase().trim();

  // Industry Cross-Contamination Guard:
  // If user selected a specific industry category, purge any conflicting stale prompt text
  if (categoryLower.includes('hospital') || categoryLower.includes('clinic') || categoryLower.includes('health')) {
    if (/jee|neet|repeaters|12th score|scholarship test|tuition|classes|flat|bhk|interior/i.test(prompt)) {
      prompt = 'Confirm upcoming consultation appointments for tomorrow, check if patient has fasting blood reports ready, and send clinic directions.';
    }
  } else if (categoryLower.includes('interior') || categoryLower.includes('construction')) {
    if (/jee|neet|doctor|clinic|patient|teeth|brezza|swift|flats\s+in\s+sector/i.test(prompt)) {
      prompt = 'Qualify handover date for newly purchased home, explain our 45-day turnkey modular kitchen guarantee, and schedule 3D design consultation.';
    }
  } else if (categoryLower.includes('real estate') || categoryLower.includes('property')) {
    if (/jee|neet|doctor|clinic|patient|teeth|modular kitchen/i.test(prompt)) {
      prompt = 'Call every new enquiry about Sai Meadows flats, ask what budget and configuration they need, and book a site visit.';
    }
  } else if (categoryLower.includes('dealership') || categoryLower.includes('car')) {
    if (/jee|neet|doctor|clinic|flats|bhk|villas|interior/i.test(prompt)) {
      prompt = 'Follow up on test drive requests for new Brezza & Swift, ask if they prefer manual or automatic, and book home test drive slot.';
    }
  }

  const lower = prompt.toLowerCase();

  // Helper regex tests
  const testRx = (rx) => rx.test(lower);

  // 1. HR & RECRUITMENT
  const isHR = testRx(/\b(candidates?|interviews?|screen(ing)?|applicants?|hiring|job vacancy|job position|resume|recruitment|recruiter|talent acquisition|salary expectations?)\b/i) ||
    categoryLower.includes('hr') || categoryLower.includes('recruitment');

  // 2. CUSTOMER SUPPORT & E-COMMERCE ORDERS
  const isCustomerSupport = testRx(/\b(customer support|support desk|helpdesk|order status|track order|delivery (queries|questions|status)|returns?|refunds?|replacement|shipment|dispatch status|order issues?)\b/i) ||
    categoryLower.includes('support') || categoryLower.includes('e-commerce');

  // 3. B2B SALES & ENTERPRISE LEAD QUALIFICATION
  const isB2BSales = testRx(/\b(b2b|qualify leads?|lead qualification|sales pipeline|book demo|schedule demo|enterprise clients?|business proposals?|product walkthrough)\b/i) ||
    categoryLower.includes('sales');

  // 4. INTERIORS & CONSTRUCTION (Checked BEFORE Real Estate to prevent false classification!)
  const isInteriors = testRx(/\b(interiors?|modular kitchen|renovations?|construction|civil work|architectural|decor|woodwork|false ceiling)\b/i) ||
    categoryLower.includes('interior') || categoryLower.includes('construction');

  // 5. REAL ESTATE
  const isRealEstate = testRx(/\b(real estate|flats?|apartments?|villas?|open plots?|square yards|site visits?|bhk|gated community|sai meadows|property)\b/i) ||
    categoryLower.includes('real estate') || categoryLower.includes('property');

  // 6. HEALTHCARE, HOSPITAL & CLINIC
  const isHealthcare = testRx(/\b(hospitals?|clinics?|doctors?|patients?|dentists?|dental|teeth|root canal|orthopedic|cardiology|pediatric|physician|diagnostics?|medical treatment|clinic enquiries?)\b/i) ||
    categoryLower.includes('hospital') || categoryLower.includes('clinic') || categoryLower.includes('health');

  // 7. RESTAURANT, CAFE & DINING
  const isRestaurant = testRx(/\b(restaurants?|cafes?|dining|food delivery|cloud kitchen|biryani|bakery|catering|table reservations?|menu questions?|dishes|chef special)\b/i) ||
    categoryLower.includes('restaurant') || categoryLower.includes('food');

  // 8. COACHING, TUITION & EDUCATION
  const isCoaching = testRx(/\b(coaching|tuition|classes|institutes?|jee|neet|admissions?|batches|entrance exam|counselling sessions?|academy|tutor)\b/i) ||
    categoryLower.includes('coaching') || categoryLower.includes('tuition') || categoryLower.includes('education');

  // 9. LOCAL SERVICES & HOME REPAIR
  const isLocalServices = testRx(/\b(plumbing|electrician|ac servicing|ac repair|appliance repair|carpenter|pest control|house cleaning|local services?|service visits?|technician dispatch)\b/i) ||
    categoryLower.includes('local service');

  // 10. CAR & AUTOMOBILE DEALERSHIP
  const isCarDealership = testRx(/\b(dealership|test drive|showroom|automobiles?|hatchbacks?|suvs?|sedans?|ev vehicles?|maruti|hyundai|tata motors|kia|toyota|mahindra)\b/i) ||
    categoryLower.includes('dealership') || categoryLower.includes('car');

  // 11. CLOTHING, FASHION & BOUTIQUE
  const isClothing = testRx(/\b(clothing|clothes|fashion|boutique|sarees?|kurtis?|lehengas?|menswear|womenswear|apparels?|garments?|textiles?)\b/i) ||
    categoryLower.includes('clothing') || categoryLower.includes('fashion');

  // EXECUTE MATCHING IN ORDER OF SPECIFICITY

  if (isHR) {
    const role = 'Talent Acquisition & Interview Coordinator';
    const businessName = extractBrandName(prompt) || 'Global Talent HR Solutions';
    return {
      schema_version: "2.1",
      employee_name: 'Priya',
      business_name: businessName,
      role: role,
      language: language,
      industry: 'HR & Recruitment',
      smallContext: 'Screening applicant qualifications, verifying experience & salary expectations, and scheduling interview rounds.',
      small_context: 'Screening applicant qualifications, verifying experience & salary expectations, and scheduling interview rounds.',
      opening_greeting: language.startsWith('te')
        ? `Namaskaram! Nenu ${businessName} HR team nunchi Priya matladutunnanu. Mee job application gurinchi call chestunnanu.`
        : `Hello! This is Priya from the HR team at ${businessName}. Calling regarding your recent job application.`,
      call_steps: [
        "Acknowledge candidate application and confirm current availability",
        "Screen relevant work experience, key skills, and primary tech stack",
        "Verify current CTC, expected compensation, and notice period",
        "Confirm interview slot with hiring manager and send invite on WhatsApp"
      ],
      variables: ['experience_years', 'current_ctc', 'expected_ctc', 'notice_period', 'interview_date'],
      questions: [
        {
                step: 1,
                id: "business_name",
                title: "What is your company or organization name?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "Global Talent HR Solutions",
                type: "text"
        },
        {
                step: 2,
                id: "price_range",
                title: "What is the annual CTC or salary budget range?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "6 LPA to 35 LPA",
                type: "text"
        },
        {
                step: 3,
                id: "categories",
                title: "What job roles or skill sets are you hiring for?",
                subtitle: "Tick all that apply.",
                options: [
                        "Software Engineers & Tech Stack",
                        "Sales & Business Development",
                        "Customer Support & BPO Specialists",
                        "Product & Project Managers",
                        "Other"
                ],
                defaultSelected: [
                        "Software Engineers & Tech Stack"
                ],
                type: "chips"
        },
        {
                step: 4,
                id: "next_action",
                title: "What is the next step for qualified candidates?",
                subtitle: "So your test call sounds like your business.",
                options: [
                        "Schedule technical round with hiring team",
                        "Conduct HR phone screen",
                        "Invite for in-person office interview",
                        "Send interview invite on WhatsApp",
                        "Other"
                ],
                defaultSelected: [
                        "Schedule technical round with hiring team"
                ],
                type: "pills"
        }
]
    };
  }

  if (isCustomerSupport) {
    const role = 'Customer Support & Order Resolution Specialist';
    const businessName = extractBrandName(prompt) || 'Customer Care Desk';
    return {
      schema_version: "2.1",
      employee_name: 'Sneha',
      business_name: businessName,
      role: role,
      language: language,
      industry: 'Customer Support & E-commerce',
      smallContext: 'Resolving order delivery status, return & exchange requests, and customer enquiries.',
      small_context: 'Resolving order delivery status, return & exchange requests, and customer enquiries.',
      opening_greeting: language.startsWith('te')
        ? `Namaskaram! Nenu ${businessName} Customer Support nunchi Sneha matladutunnanu. Mee recent order enquiry gurinchi call chestunnanu.`
        : `Hello! This is Sneha from ${businessName} Customer Support. Calling regarding your recent order.`,
      call_steps: [
        "Greet customer warmly and verify order details",
        "Identify specific issue: delivery tracking, return, exchange, or product enquiry",
        "Provide clear resolution, updated dispatch status, or replacement details",
        "Confirm resolution and deliver live tracking link via WhatsApp"
      ],
      variables: ['order_id', 'enquiry_type', 'delivery_address', 'whatsapp_confirmed'],
      questions: [
        {
                step: 1,
                id: "business_name",
                title: "What is your brand or company name?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "FastTrack Care",
                type: "text"
        },
        {
                step: 2,
                id: "price_range",
                title: "What is your typical order value or refund limit?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "₹500 to ₹10,000",
                type: "text"
        },
        {
                step: 3,
                id: "categories",
                title: "What support topics or requests do you handle?",
                subtitle: "Tick all that apply.",
                options: [
                        "Order status & live tracking",
                        "Returns, refunds & replacement requests",
                        "Product usage guidance & troubleshooting",
                        "Billing & payment invoice queries",
                        "Other"
                ],
                defaultSelected: [
                        "Order status & live tracking"
                ],
                type: "chips"
        },
        {
                step: 4,
                id: "next_action",
                title: "What should happen after resolving the customer query?",
                subtitle: "So your test call sounds like your business.",
                options: [
                        "Send resolution & tracking link on WhatsApp",
                        "Escalate to human support specialist",
                        "Email updated ticket details",
                        "Other"
                ],
                defaultSelected: [
                        "Send resolution & tracking link on WhatsApp"
                ],
                type: "pills"
        }
]
    };
  }

  if (isB2BSales) {
    const role = 'Enterprise Sales & Lead Qualification Specialist';
    const businessName = extractBrandName(prompt) || 'Apex B2B Solutions';
    return {
      schema_version: "2.1",
      employee_name: 'Arjun',
      business_name: businessName,
      role: role,
      language: language,
      industry: 'B2B Sales & Growth',
      smallContext: 'Qualifying incoming corporate leads, discovering technical requirements, and booking product demos.',
      small_context: 'Qualifying incoming corporate leads, discovering technical requirements, and booking product demos.',
      opening_greeting: language.startsWith('te')
        ? `Namaskaram! Nenu ${businessName} nunchi Arjun matladutunnanu. Ma enterprise solutions enquiry gurinchi call chestunnanu.`
        : `Hello! This is Arjun from ${businessName}. Calling to follow up on your enquiry for our enterprise solutions.`,
      call_steps: [
        "Acknowledge business enquiry and introduce enterprise offerings",
        "Discover organization size, current workflow bottlenecks, and budget allocation",
        "Present high-level ROI, features, and tailored solution overview",
        "Schedule 30-minute executive demo and send calendar invitation"
      ],
      variables: ['company_size', 'budget', 'timeline', 'decision_maker', 'demo_time'],
      questions: [
        {
                step: 1,
                id: "business_name",
                title: "What is your company name?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "CloudScale SaaS Solutions",
                type: "text"
        },
        {
                step: 2,
                id: "price_range",
                title: "What is your typical deal size or software subscription price?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "₹50,000 to ₹10,00,000 / year",
                type: "text"
        },
        {
                step: 3,
                id: "categories",
                title: "What solutions or services do you offer?",
                subtitle: "Tick all that apply.",
                options: [
                        "Enterprise SaaS & Cloud Software",
                        "Digital Transformation Consulting",
                        "Custom Software & Mobile App Development",
                        "Marketing & Sales Automation",
                        "Other"
                ],
                defaultSelected: [
                        "Enterprise SaaS & Cloud Software"
                ],
                type: "chips"
        },
        {
                step: 4,
                id: "next_action",
                title: "What should the prospect do next?",
                subtitle: "So your test call sounds like your business.",
                options: [
                        "Book a 30-minute product demo",
                        "Schedule technical discovery call",
                        "Get pricing proposal on WhatsApp & email",
                        "Other"
                ],
                defaultSelected: [
                        "Book a 30-minute product demo"
                ],
                type: "pills"
        }
]
    };
  }

  // 4. INTERIORS & CONSTRUCTION (Checked BEFORE Real Estate)
  if (isInteriors) {
    const role = 'Interior Designer & Turnkey Consultant';
    const businessName = extractBrandName(prompt) || 'DesignCraft Luxury Interiors';
    return {
      schema_version: "2.1",
      employee_name: 'Pooja',
      business_name: businessName,
      role: role,
      language: language,
      industry: 'Interiors & construction',
      smallContext: 'Qualifying new apartment & villa owners for modular kitchens, turnkey 3D home design, and site measurement visits.',
      small_context: 'Qualifying new apartment & villa owners for modular kitchens, turnkey 3D home design, and site measurement visits.',
      opening_greeting: language.startsWith('te')
        ? `Namaskaram! Nenu ${businessName} nunchi Pooja matladutunnanu. Ma turnkey interior design & modular kitchen offers gurinchi enquiry chesaru kada?`
        : `Hello! This is Pooja from ${businessName}. Calling regarding your enquiry about our turnkey home interior and modular kitchen design.`,
      call_steps: [
        `Greet warmly from ${businessName} and acknowledge interior design enquiry`,
        "Enquire about space type (Modular Kitchen, Wardrobes, Full 3D Home Interior, Renovation) and handover timeline",
        "Explain our 45-day handover guarantee, 10-year warranty, and free 3D design consultation",
        "Book complimentary site measurement visit and deliver portfolio on WhatsApp"
      ],
      variables: ['space_type', 'budget', 'handover_timeline', 'site_address', 'whatsapp_confirmed'],
      questions: [
        {
                step: 1,
                id: "business_name",
                title: "What is your business name?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "DesignCraft Luxury Interiors",
                type: "text"
        },
        {
                step: 2,
                id: "price_range",
                title: "What is your typical interior project or renovation budget?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "1.5 Lakhs to 25 Lakhs",
                type: "text"
        },
        {
                step: 3,
                id: "categories",
                title: "What types of interior services do you offer?",
                subtitle: "Tick all that apply.",
                options: [
                        "Modular kitchens",
                        "Wardrobes & storage",
                        "Full home 3D interior design",
                        "False ceiling & lighting",
                        "Living & bedroom decor",
                        "Turnkey renovation",
                        "Other"
                ],
                defaultSelected: [
                        "Modular kitchens",
                        "Full home 3D interior design"
                ],
                type: "chips"
        },
        {
                step: 4,
                id: "next_action",
                title: "What should the caller do next?",
                subtitle: "So your test call sounds like your business.",
                options: [
                        "Book free site measurement visit",
                        "Schedule 3D design consultation",
                        "Get portfolio & estimate on WhatsApp",
                        "Request designer callback",
                        "Other"
                ],
                defaultSelected: [
                        "Book free site measurement visit"
                ],
                type: "pills"
        }
]
    };
  }

  // 5. REAL ESTATE
  if (isRealEstate) {
    const role = 'Property Consultant & Lead Qualifier';
    const businessName = extractBrandName(prompt) || (lower.includes('meadows') ? 'Sai Meadows Luxury Flats' : 'Prime Habitat Realty');
    return {
      schema_version: "2.1",
      employee_name: 'Priya',
      business_name: businessName,
      role: role,
      language: language,
      industry: 'Real estate',
      smallContext: 'Qualifying enquiries for 2 & 3 BHK luxury flats and scheduling weekend site visits with free cab pickup.',
      small_context: 'Qualifying enquiries for 2 & 3 BHK luxury flats and scheduling weekend site visits with free cab pickup.',
      opening_greeting: language.startsWith('te')
        ? `Namaskaram! Nenu ${businessName} nunchi Priya matladutunnanu. Meeru ma luxury 2 & 3 BHK flats enquiry chesaru kada?`
        : `Hello! This is Priya from ${businessName}. Calling regarding your enquiry about our 2 and 3 BHK luxury flats.`,
      call_steps: [
        `Greet warmly and acknowledge enquiry about ${businessName}`,
        "Qualify customer budget and preferred configuration (2 BHK, 3 BHK, Penthouse)",
        "Offer free weekend site visit with complimentary cab pickup",
        "Confirm WhatsApp brochure and Google Map location delivery"
      ],
      variables: ['budget', 'configuration', 'visit_date', 'facing_preference', 'whatsapp_confirmed'],
      questions: [
        {
                step: 1,
                id: "business_name",
                title: "What is your property development or agency name?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "Sai Meadows",
                type: "text"
        },
        {
                step: 2,
                id: "price_range",
                title: "What is the price range of your units or plots?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "45 Lakhs to 2.5 Crores",
                type: "text"
        },
        {
                step: 3,
                id: "categories",
                title: "What types of properties do you sell?",
                subtitle: "Tick all that apply.",
                options: [
                        "2 BHK & 3 BHK Luxury Apartments",
                        "Gated Community Villas",
                        "Commercial Office & Retail Spaces",
                        "Approved Residential Plots & Land",
                        "Penthouse Suites",
                        "Other"
                ],
                defaultSelected: [
                        "2 BHK & 3 BHK Luxury Apartments"
                ],
                type: "chips"
        },
        {
                step: 4,
                id: "next_action",
                title: "What should the customer do next?",
                subtitle: "So your test call sounds like your business.",
                options: [
                        "Book site visit for this weekend",
                        "Send floor plans & pricing on WhatsApp",
                        "Arrange call with sales manager",
                        "Other"
                ],
                defaultSelected: [
                        "Book site visit for this weekend"
                ],
                type: "pills"
        }
]
    };
  }

  // 6. HEALTHCARE, HOSPITAL & CLINIC
  if (isHealthcare) {
    const role = 'Patient Care & Appointment Desk';
    const businessName = extractBrandName(prompt) || 'Sanjeevani Clinic & Healthcare';
    return {
      schema_version: "2.1",
      employee_name: 'Dr. Ananya',
      business_name: businessName,
      role: role,
      language: language,
      industry: 'Hospital & clinic',
      smallContext: 'Scheduling doctor consultations, explaining diagnostic care, and providing clinic timings & location.',
      small_context: 'Scheduling doctor consultations, explaining diagnostic care, and providing clinic timings & location.',
      opening_greeting: language.startsWith('te')
        ? `Namaskaram! Nenu ${businessName} nunchi Dr. Ananya matladutunnanu. Doctor appointment enquiry gurinchi call chestunnanu.`
        : `Hello! This is Dr. Ananya from ${businessName}. Calling regarding your doctor appointment enquiry.`,
      call_steps: [
        `Greet patient warmly from ${businessName} and confirm appointment enquiry`,
        "Ask about specific health concern, preferred doctor department, or routine checkup",
        "Offer available morning or evening consultation slots with senior doctor",
        "Send clinic address, appointment token, and prep guidelines via WhatsApp"
      ],
      variables: ['department', 'preferred_slot', 'doctor_name', 'whatsapp_confirmed'],
      questions: [
        {
                step: 1,
                id: "business_name",
                title: "What is your clinic, hospital, or doctor practice name?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "Sanjeevani Clinic & Healthcare",
                type: "text"
        },
        {
                step: 2,
                id: "price_range",
                title: "What is your consultation fee or treatment range?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "₹400 to ₹3,500",
                type: "text"
        },
        {
                step: 3,
                id: "categories",
                title: "What clinical services or specialities do you provide?",
                subtitle: "Tick all that apply.",
                options: [
                        "General Physician Consultation",
                        "Dental Care & Implants",
                        "Pediatric & Child Care",
                        "Orthopedic & Joint Pain",
                        "Dermatology & Skin Clinic",
                        "Diagnostic Lab & Blood Tests",
                        "Other"
                ],
                defaultSelected: [
                        "General Physician Consultation"
                ],
                type: "chips"
        },
        {
                step: 4,
                id: "next_action",
                title: "What should the patient do next?",
                subtitle: "So your test call sounds like your business.",
                options: [
                        "Book a clinic appointment",
                        "Schedule video tele-consultation",
                        "Send clinic location & timings on WhatsApp",
                        "Arrange doctor callback",
                        "Other"
                ],
                defaultSelected: [
                        "Book a clinic appointment"
                ],
                type: "pills"
        }
]
    };
  }

  // 7. RESTAURANT, CAFE & DINING
  if (isRestaurant) {
    const role = 'Guest Relations & Table Booking Coordinator';
    const businessName = extractBrandName(prompt) || 'Royal Biryani & Fine Dining';
    return {
      schema_version: "2.1",
      employee_name: 'Rahul',
      business_name: businessName,
      role: role,
      language: language,
      industry: 'Restaurant & Dining',
      smallContext: 'Taking table reservations, answering menu and party catering questions, and providing location details.',
      small_context: 'Taking table reservations, answering menu and party catering questions, and providing location details.',
      opening_greeting: language.startsWith('te')
        ? `Namaskaram! Nenu ${businessName} nunchi Rahul matladutunnanu. Table reservation & dining enquiry gurinchi call chestunnanu.`
        : `Hello! This is Rahul from ${businessName}. Calling regarding your table booking enquiry.`,
      call_steps: [
        `Greet warmly from ${businessName} and confirm dining enquiry`,
        "Enquire about guest count, preferred lunch/dinner slot, and special seating requests",
        "Highlight chef specialties, live counters, and catering combo pricing",
        "Confirm reservation token and deliver digital menu with location map on WhatsApp"
      ],
      variables: ['party_size', 'dining_slot', 'dietary_pref', 'whatsapp_confirmed'],
      questions: [
        {
                step: 1,
                id: "business_name",
                title: "What is your restaurant or cafe name?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "Royal Biryani & Spice Kitchen",
                type: "text"
        },
        {
                step: 2,
                id: "price_range",
                title: "What is your average dining or order price range?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "₹400 to ₹1,800 for two",
                type: "text"
        },
        {
                step: 3,
                id: "categories",
                title: "What cuisines or dining options do you offer?",
                subtitle: "Tick all that apply.",
                options: [
                        "Dine-in Table Reservations",
                        "Authentic Indian & Biryani",
                        "Pan-Asian & Chinese Specialties",
                        "Continental & Italian Pasta/Pizza",
                        "Catering & Party Orders",
                        "Other"
                ],
                defaultSelected: [
                        "Dine-in Table Reservations",
                        "Authentic Indian & Biryani"
                ],
                type: "chips"
        },
        {
                step: 4,
                id: "next_action",
                title: "What should the guest do next?",
                subtitle: "So your test call sounds like your business.",
                options: [
                        "Reserve a dining table",
                        "Send menu & location on WhatsApp",
                        "Place delivery order",
                        "Other"
                ],
                defaultSelected: [
                        "Reserve a dining table"
                ],
                type: "pills"
        }
]
    };
  }

  // 8. COACHING, TUITION & EDUCATION
  if (isCoaching) {
    const role = 'Academic Counselor & Admissions Specialist';
    const businessName = extractBrandName(prompt) || 'Apex Academic Academy';
    return {
      schema_version: "2.1",
      employee_name: 'Rohan',
      business_name: businessName,
      role: role,
      language: language,
      industry: 'Coaching & tuition',
      smallContext: 'Explaining course syllabus, batches, scholarship tests, and scheduling 1-on-1 counseling sessions.',
      small_context: 'Explaining course syllabus, batches, scholarship tests, and scheduling 1-on-1 counseling sessions.',
      opening_greeting: language.startsWith('te')
        ? `Namaskaram! Nenu ${businessName} nunchi Rohan matladutunnanu. Ma coaching batches & admissions gurinchi enquiry chesaru kada?`
        : `Hello! This is Rohan from ${businessName}. Calling regarding your course admissions enquiry.`,
      call_steps: [
        `Greet student or parent warmly from ${businessName}`,
        "Understand student grade, target entrance exam (JEE, NEET, Board, Foundation), and current preparation",
        "Explain small batch sizes, top faculty track record, and scholarship tests",
        "Invite for free 1-on-1 academic counseling session and send brochure on WhatsApp"
      ],
      variables: ['target_exam', 'student_grade', 'batch_preference', 'whatsapp_confirmed'],
      questions: [
        {
                step: 1,
                id: "business_name",
                title: "What is your institute or academy name?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "BrightMinds Academy",
                type: "text"
        },
        {
                step: 2,
                id: "price_range",
                title: "What is your course fee or tuition fee range?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "₹15,000 to ₹95,000 / year",
                type: "text"
        },
        {
                step: 3,
                id: "categories",
                title: "What courses or batches do you offer?",
                subtitle: "Tick all that apply.",
                options: [
                        "Competitive Exam Prep (JEE, NEET, UPSC)",
                        "School Board Tuitions (Class 8-12)",
                        "Spoken English & Communication Skills",
                        "Software Coding & Data Science Bootcamp",
                        "Other"
                ],
                defaultSelected: [
                        "Competitive Exam Prep (JEE, NEET, UPSC)"
                ],
                type: "chips"
        },
        {
                step: 4,
                id: "next_action",
                title: "What should the student or parent do next?",
                subtitle: "So your test call sounds like your business.",
                options: [
                        "Book free demo class",
                        "Send syllabus & fee structure on WhatsApp",
                        "Schedule 1-on-1 counseling session",
                        "Other"
                ],
                defaultSelected: [
                        "Book free demo class"
                ],
                type: "pills"
        }
]
    };
  }

  // 9. LOCAL SERVICES & HOME REPAIR
  if (isLocalServices) {
    const role = 'Service Dispatch & Support Coordinator';
    const businessName = extractBrandName(prompt) || 'QuickFix Local Home Services';
    return {
      schema_version: "2.1",
      employee_name: 'Kavya',
      business_name: businessName,
      role: role,
      language: language,
      industry: 'Local services',
      smallContext: 'Diagnosing repair issues, quoting transparent service charges, and scheduling technician visits within 2 hours.',
      small_context: 'Diagnosing repair issues, quoting transparent service charges, and scheduling technician visits within 2 hours.',
      opening_greeting: language.startsWith('te')
        ? `Namaskaram! Nenu ${businessName} nunchi Kavya matladutunnanu. Home service & repair enquiry gurinchi call chestunnanu.`
        : `Hello! This is Kavya from ${businessName}. Calling regarding your home repair service enquiry.`,
      call_steps: [
        `Greet warmly from ${businessName} and confirm service request`,
        "Identify specific issue (appliance, AC, plumbing, electrical, cleaning) and urgency",
        "Explain transparent inspection charge with 30-day service warranty",
        "Schedule technician doorstep visit slot and send booking confirmation on WhatsApp"
      ],
      variables: ['service_category', 'issue_description', 'preferred_slot', 'address', 'whatsapp_confirmed'],
      questions: [
        {
                step: 1,
                id: "business_name",
                title: "What is your service business name?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "FixExpert Home Care",
                type: "text"
        },
        {
                step: 2,
                id: "price_range",
                title: "What is your typical service or inspection fee?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "₹299 to ₹2,500",
                type: "text"
        },
        {
                step: 3,
                id: "categories",
                title: "What repair or local services do you provide?",
                subtitle: "Tick all that apply.",
                options: [
                        "AC Repair, Gas Refill & Servicing",
                        "Electrical Wiring & Appliance Repair",
                        "Plumbing & Water Motor Repairs",
                        "Home Deep Cleaning & Sanitization",
                        "Carpentry & Furniture Assembly",
                        "Other"
                ],
                defaultSelected: [
                        "AC Repair, Gas Refill & Servicing"
                ],
                type: "chips"
        },
        {
                step: 4,
                id: "next_action",
                title: "What should the caller do next?",
                subtitle: "So your test call sounds like your business.",
                options: [
                        "Book a technician visit today",
                        "Get upfront price estimate on WhatsApp",
                        "Request callback from supervisor",
                        "Other"
                ],
                defaultSelected: [
                        "Book a technician visit today"
                ],
                type: "pills"
        }
]
    };
  }

  // 10. CAR & AUTOMOBILE DEALERSHIP
  if (isCarDealership) {
    const role = 'Showroom Sales & Test Drive Coordinator';
    const businessName = extractBrandName(prompt) || 'Apex Automobile Showroom';
    return {
      schema_version: "2.1",
      employee_name: 'Vikram',
      business_name: businessName,
      role: role,
      language: language,
      industry: 'Car & bike dealership',
      smallContext: 'Qualifying vehicle enquiries, offering home test drives, and sharing finance & exchange offers.',
      small_context: 'Qualifying vehicle enquiries, offering home test drives, and sharing finance & exchange offers.',
      opening_greeting: language.startsWith('te')
        ? `Namaskaram! Nenu ${businessName} nunchi Vikram matladutunnanu. Ma new vehicle offers gurinchi enquiry chesaru kada?`
        : `Hello! This is Vikram from ${businessName}. Calling regarding your vehicle enquiry and test drive request.`,
      call_steps: [
        `Greet warmly from ${businessName} and acknowledge vehicle enquiry`,
        "Discover preferred segment (SUV, Sedan, EV, Hatchback, Bike) and budget range",
        "Offer complimentary doorstep test drive this weekend and old vehicle exchange bonus",
        "Send digital brochure, price list, and EMI calculator on WhatsApp"
      ],
      variables: ['car_model', 'fuel_type', 'budget', 'test_drive_date', 'whatsapp_confirmed'],
      questions: [
        {
          step: 1,
          id: 'business_name',
          title: 'What is your business name?',
          subtitle: 'So your test call sounds like your business.',
          defaultValue: businessName,
          type: 'text'
        },
        {
          step: 2,
          id: 'price_range',
          title: 'What is the price range of your vehicles?',
          subtitle: 'So your test call sounds like your business.',
          defaultValue: '6 Lakhs to 28 Lakhs',
          type: 'text'
        },
        {
          step: 3,
          id: 'categories',
          title: 'What types of cars do you sell?',
          subtitle: 'Tick all that apply.',
          options: ['New cars', 'Used cars', 'Electric cars', 'Luxury cars', 'Commercial vehicles', 'Other'],
          defaultSelected: ['New cars', 'Used cars', 'Electric cars'],
          type: 'chips'
        },
        {
          step: 4,
          id: 'next_action',
          title: 'What should the customer do next?',
          subtitle: 'So your test call sounds like your business.',
          options: ['Book a test drive', 'Visit showroom', 'Get WhatsApp brochure & EMI quotes', 'Speak to a sales executive', 'Other'],
          defaultSelected: ['Book a test drive'],
          type: 'pills'
        }
      ]
    };
  }

  // 11. CLOTHING, FASHION & BOUTIQUE
  if (isClothing) {
    const role = 'Fashion Consultant & Stylist';
    const businessName = extractBrandName(prompt) || 'TrendSet Fashion & Boutique';
    return {
      schema_version: "2.1",
      employee_name: 'Priya',
      business_name: businessName,
      role: role,
      language: language,
      industry: 'Clothing & Fashion',
      smallContext: 'Showcasing latest designer ethnic & western collections, explaining sizes & fabrics, and taking orders.',
      small_context: 'Showcasing latest designer ethnic & western collections, explaining sizes & fabrics, and taking orders.',
      opening_greeting: language.startsWith('te')
        ? `Namaskaram! Nenu ${businessName} nunchi Priya matladutunnanu. Ma latest festive fashion collection gurinchi enquiry chesaru kada?`
        : `Hello! This is Priya from ${businessName}. Calling regarding our latest fashion collections and festive offers.`,
      call_steps: [
        `Greet warmly from ${businessName} and confirm fashion collection enquiry`,
        "Enquire about preferred style (Bridal Lehengas, Pure Silk Sarees, Casual Kurtis, Western Wear)",
        "Highlight handloom purity, size customization, and flat festival discounts",
        "Send complete WhatsApp catalog with photos, price list, and video shopping link"
      ],
      variables: ['clothing_type', 'size_preference', 'budget', 'whatsapp_confirmed'],
      questions: [
        {
                step: 1,
                id: "business_name",
                title: "What is your boutique or brand name?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "TrendSet Fashion & Boutique",
                type: "text"
        },
        {
                step: 2,
                id: "price_range",
                title: "What is your typical clothing or outfit price range?",
                subtitle: "So your test call sounds like your business.",
                defaultValue: "₹1,500 to ₹35,000",
                type: "text"
        },
        {
                step: 3,
                id: "categories",
                title: "What types of clothing or collections do you sell?",
                subtitle: "Tick all that apply.",
                options: [
                        "Bridal Lehengas & Gowns",
                        "Pure Silk & Handloom Sarees",
                        "Casual & Party Wear Kurtis",
                        "Men Ethnic Sherwanis & Kurta Sets",
                        "Western & Contemporary Fashion",
                        "Other"
                ],
                defaultSelected: [
                        "Pure Silk & Handloom Sarees"
                ],
                type: "chips"
        },
        {
                step: 4,
                id: "next_action",
                title: "What should the shopper do next?",
                subtitle: "So your test call sounds like your business.",
                options: [
                        "Send catalog with photos & prices on WhatsApp",
                        "Book video shopping appointment",
                        "Visit our store",
                        "Other"
                ],
                defaultSelected: [
                        "Send catalog with photos & prices on WhatsApp"
                ],
                type: "pills"
        }
]
    };
  }

  // 12. GENERIC & DYNAMIC ADAPTIVE SYNTHESIZER (For ANY truly custom, user-defined prompt or Other!)
  const topicNoun = extractTopicNoun(prompt) || (categoryLower && categoryLower !== 'other' ? userCategory : 'Custom Services');
  const role = `${topicNoun} Specialist & Advisor`;
  const businessName = extractBrandName(prompt) || `${topicNoun} Solutions`;
  const dynamicCategories = generateDynamicCategories(prompt, topicNoun);

  return {
    schema_version: "2.1",
    employee_name: 'Ananya',
    business_name: businessName,
    role: role,
    language: language,
    industry: topicNoun,
    smallContext: `Assisting callers with ${topicNoun.toLowerCase()}, answering specific questions, and booking appointments or orders.`,
    small_context: `Assisting callers with ${topicNoun.toLowerCase()}, answering specific questions, and booking appointments or orders.`,
    opening_greeting: language.startsWith('te')
      ? `Namaskaram! Nenu ${businessName} nunchi Ananya matladutunnanu. Ma ${topicNoun.toLowerCase()} gurinchi enquiry chesaru kada?`
      : `Hello! This is Ananya from ${businessName}. Calling regarding your enquiry about our ${topicNoun.toLowerCase()}.`,
    call_steps: [
      `Greet warmly from ${businessName} and acknowledge interest in ${topicNoun.toLowerCase()}`,
      "Understand caller's specific requirements, timeline, and budget",
      "Explain key features, guarantees, and tailored pricing options",
      "Confirm next step: appointment, order placement, or digital catalog on WhatsApp"
    ],
    variables: ['service_type', 'budget', 'preferred_timing', 'whatsapp_confirmed'],
    questions: [
      {
        step: 1,
        id: 'business_name',
        title: 'What is your business name?',
        subtitle: 'So your test call sounds like your business.',
        defaultValue: businessName,
        type: 'text'
      },
      {
        step: 2,
        id: 'price_range',
        title: `What is the typical price range or order value for your ${topicNoun.toLowerCase()}?`,
        subtitle: 'So your test call sounds like your business.',
        defaultValue: '1000 to 50000',
        type: 'text'
      },
      {
        step: 3,
        id: 'categories',
        title: `What types of ${topicNoun.toLowerCase()} do you offer?`,
        subtitle: 'Tick all that apply.',
        options: dynamicCategories,
        defaultSelected: dynamicCategories.slice(0, 2),
        type: 'chips'
      },
      {
        step: 4,
        id: 'next_action',
        title: 'What should the caller do next?',
        subtitle: 'So your test call sounds like your business.',
        options: ['Book an appointment or visit', 'Request a quote / proposal', 'Get details on WhatsApp', 'Place an order', 'Other'],
        defaultSelected: ['Book an appointment or visit'],
        type: 'pills'
      }
    ]
  };
}

function extractBrandName(prompt) {
  if (!prompt) return null;
  // Check for specific brand indicators: "my [business name]" or "[business name] clinic/flats/etc"
  const m1 = prompt.match(/(?:about|for|named|called|at|shop\s+name|business\s+is)\s+([A-Z][a-zA-Z0-9\s&]{2,25}?)(?:\s+(?:flats|clinic|hospital|store|shop|showroom|academy|studio|agency|firm|services|pvt|ltd|solutions|interiors)|\s*,|\s*\.|\s+in\s+)/i);
  if (m1 && m1[1] && m1[1].length < 28) {
    const candidate = m1[1].trim();
    if (!/call|parent|enquiry|every|instagram|student/i.test(candidate)) {
      return candidate;
    }
  }

  // Check for "i have my [X] shop" or "my [X]"
  const m2 = prompt.match(/(?:have\s+my|our)\s+([A-Za-z0-9\s&]{3,20}?)\s+(?:shop|store|business|firm|clinic|studio)/i);
  if (m2 && m2[1] && m2[1].length < 25) {
    const candidate = m2[1].trim();
    if (!/call|parent|enquiry/i.test(candidate)) {
      return `${candidate.charAt(0).toUpperCase() + candidate.slice(1)} Store`;
    }
  }

  return null;
}

function extractTopicNoun(prompt) {
  if (!prompt) return 'Professional Services';
  const clean = prompt.replace(/(call|every|new|enquiry|from|my|instagram|ad|about|ask|what|budget|and|book|schedule|confirm|deliver|send|handle|answer)/gi, '').trim();
  const words = clean.split(/\s+/).filter(w => w.length > 3);
  if (words.length > 0) {
    const firstWord = words[0];
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
  }
  return 'Professional Services';
}

function generateDynamicCategories(prompt, topicNoun) {
  const p = (prompt || '').toLowerCase();
  const cats = [];
  if (p.includes('gold')) cats.push('Gold collections');
  if (p.includes('silver')) cats.push('Silver jewellery & articles');
  if (p.includes('diamond')) cats.push('Diamond jewelry');
  if (p.includes('solar') || p.includes('panel')) {
    cats.push('Rooftop On-Grid Solar', 'Off-Grid Inverter Battery', 'Commercial Solar PV');
  }
  if (p.includes('gym') || p.includes('fitness')) {
    cats.push('Personal Training', 'Annual Gym Membership', 'Crossfit & Strength');
  }
  if (p.includes('salon') || p.includes('spa')) {
    cats.push('Hair Styling & Color', 'Bridal Makeover', 'Facials & Skin Treatment');
  }
  if (p.includes('travel') || p.includes('tour')) {
    cats.push('International Holiday Packages', 'Domestic Flight & Hotel', 'Custom Honeymoon Itineraries');
  }

  if (cats.length === 0) {
    cats.push(
      `Premium ${topicNoun} Package`,
      `Standard ${topicNoun} Service`,
      `Customized Solutions`,
      `Express Consultation`
    );
  }
  cats.push('Other');
  return cats;
}
