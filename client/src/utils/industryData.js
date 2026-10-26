// Authoritative Industry Templates & Call Script Definitions for Outpero Voice AI
import { Building2, GraduationCap, Stethoscope, Car, Home, Store, Sparkles } from 'lucide-react';

export const INDUSTRY_TEMPLATES = [
  {
    label: 'Real estate',
    icon: Building2,
    samplePrompt: 'Sai Constructions 2 & 3 BHK luxury gated community flats in Sector 150. Ask budget and timeline, book weekend site visit with free cab pickup, send floor plan PDF.',
    text: 'Sai Constructions 2 & 3 BHK luxury gated community flats in Sector 150. Ask budget and timeline, book weekend site visit with free cab pickup, send floor plan PDF.'
  },
  {
    label: 'Coaching & tuition',
    icon: GraduationCap,
    samplePrompt: 'IIT-JEE & NEET Academy admissions counseling. Call parent leads, explain small batch sizes and scholarship test this Saturday, schedule academic counselling session.',
    text: 'IIT-JEE & NEET Academy admissions counseling. Call parent leads, explain small batch sizes and scholarship test this Saturday, schedule academic counselling session.'
  },
  {
    label: 'Hospital & clinic',
    icon: Stethoscope,
    samplePrompt: 'Sanjeevani Clinic in Banjara Hills. Follow up on appointment enquiries, ask preferred morning or evening doctor slot, confirm consultation fee 500, send clinic map on WhatsApp.',
    text: 'Sanjeevani Clinic in Banjara Hills. Follow up on appointment enquiries, ask preferred morning or evening doctor slot, confirm consultation fee 500, send clinic map on WhatsApp.'
  },
  {
    label: 'Car & bike dealership',
    icon: Car,
    samplePrompt: 'Maruti Suzuki authorized showroom. Call new car enquiry leads, offer home test drive this Saturday or Sunday, discover budget and finance requirements, send brochure on WhatsApp.',
    text: 'Maruti Suzuki authorized showroom. Call new car enquiry leads, offer home test drive this Saturday or Sunday, discover budget and finance requirements, send brochure on WhatsApp.'
  },
  {
    label: 'Interiors & construction',
    icon: Home,
    samplePrompt: 'DesignCraft Luxury Interiors. Qualify handover date for new apartment owners, explain our 45-day turnkey modular kitchen guarantee and 10-year warranty, schedule free 3D design consultation.',
    text: 'DesignCraft Luxury Interiors. Qualify handover date for new apartment owners, explain our 45-day turnkey modular kitchen guarantee and 10-year warranty, schedule free 3D design consultation.'
  },
  {
    label: 'Local services',
    icon: Store,
    samplePrompt: 'QuickFix Local Home Services. Call customers inquiring about home repair, plumbing and AC servicing, check urgency, and schedule technician doorstep visit.',
    text: 'QuickFix Local Home Services. Call customers inquiring about home repair, plumbing and AC servicing, check urgency, and schedule technician doorstep visit.'
  },
  {
    label: 'Other',
    icon: Sparkles,
    samplePrompt: '',
    text: ''
  }
];

export function getIndustryDefaults(industry = 'Real estate', language = 'te') {
  const isTe = !language || language.toLowerCase().startsWith('te');
  const isHi = language && language.toLowerCase().startsWith('hi');
  const ind = (industry || '').toLowerCase();

  // 1. Hospital & Clinic
  if (ind.includes('hospital') || ind.includes('clinic') || ind.includes('health') || ind.includes('doctor')) {
    const employeeName = 'Dr. Ananya';
    const businessName = 'Sanjeevani Clinic';
    const role = 'Patient Care & Appointment Desk';
    const priceRange = '₹500 consultation fee';
    const voice = 'P01 Warm Female';

    const questions = [
      {
        step: 1,
        id: 'business_name',
        title: 'What is your clinic, hospital, or doctor practice name?',
        subtitle: 'So your test call sounds like your business.',
        defaultValue: businessName,
        type: 'text'
      },
      {
        step: 2,
        id: 'price_range',
        title: 'What is your consultation fee or treatment range?',
        subtitle: 'So your test call sounds like your business.',
        defaultValue: priceRange,
        type: 'text'
      },
      {
        step: 3,
        id: 'categories',
        title: 'What clinical services or specialities do you provide?',
        subtitle: 'Tick all that apply.',
        options: [
          'General Physician Consultation',
          'Dental Care & Implants',
          'Pediatric & Child Care',
          'Orthopedic & Joint Pain',
          'Dermatology & Skin Clinic',
          'Diagnostic Lab & Blood Tests',
          'Other'
        ],
        defaultSelected: ['General Physician Consultation'],
        type: 'chips'
      },
      {
        step: 4,
        id: 'next_action',
        title: 'What should the patient do next?',
        subtitle: 'So your test call sounds like your business.',
        options: [
          'Confirm morning or evening doctor slot',
          'Send clinic map & appointment token on WhatsApp',
          'Schedule tele-consultation',
          'Other'
        ],
        defaultSelected: ['Confirm morning or evening doctor slot'],
        type: 'pills'
      }
    ];

    const scriptSteps = [
      {
        id: 1,
        title: '1. Orient & Context',
        badge: 'START',
        body: isTe
          ? `Once they've confirmed their identity, introduce yourself as 'Dr. Ananya' from 'Sanjeevani Clinic', and remind them they enquired about our consultations or appointments. Mention you'll help with info or next steps. Keep it brief and friendly — for example you might say: 'నమస్తే అండి, నేను Dr. Ananya, Sanjeevani Clinic నుండి మాట్లాడుతున్నాను. మీరు డాక్టర్ కన్సల్టేషన్ గురించి enquiry చేసారు కదా, మీకు ఏ స్లాట్ వీలవుతుంది అండి?'`
          : isHi
          ? `Once they've confirmed their identity, introduce yourself as 'Dr. Ananya' from 'Sanjeevani Clinic', and remind them they enquired about doctor consultation. Keep it brief and friendly — for example you might say: 'नमस्ते, मैं Sanjeevani Clinic से Dr. Ananya बोल रही हूँ। आपने डॉक्टर कंसल्टेशन के लिए संपर्क किया था, क्या मैं आपको अपॉइंटमेंट की जानकारी दे सकती हूँ?'`
          : `Once they've confirmed their identity, introduce yourself as 'Dr. Ananya' from 'Sanjeevani Clinic', and remind them they enquired about doctor consultation. Keep it brief and friendly — for example you might say: 'Hello, this is Dr. Ananya calling from Sanjeevani Clinic. I noticed your enquiry for a doctor consultation — would you prefer a morning or evening appointment slot?'`
      },
      {
        id: 2,
        title: '2. Qualify Need',
        body: isTe
          ? `Find out what specific consultation or healthcare requirement they have. Ask ONE thing at a time, wait for their answer, and respond naturally before the next question. For example: 'మీకు ఏ కన్సల్టేషన్ లేదా చెకప్ కావాలి అండి?'`
          : isHi
          ? `Find out what specific consultation or healthcare requirement they have. Ask ONE thing at a time: 'आपको किस विभाग या डॉक्टर से परामर्श लेना है?'`
          : `Find out what specific consultation or healthcare requirement they have. Ask ONE thing at a time: 'Which department or specialist consultation are you looking to book?'`
      },
      {
        id: 3,
        title: '3. Share Info & Answer Questions',
        body: isTe
          ? `Based on their interest, briefly explain how our clinic consultations work and mention the consultation fee (₹500) if they ask or if it's relevant. Answer any questions they have. Mention you'll confirm priority appointment slot. For example: 'మా క్లినిక్ లో కన్సల్టేషన్ ఫీ 500 అండి. ఎలాంటి వెయిటింగ్ లేకుండా ప్రయారిటీ స్లాట్ బుక్ చేయొచ్చు.'`
          : isHi
          ? `Based on their interest, explain consultation timings and mention the fee (₹500). 'कंसल्टेशन फीस ₹500 है और हम बिना किसी वेटिंग के आपका स्लॉट कन्फर्म कर देंगे।'`
          : `Based on their interest, explain consultation timings and mention the fee (₹500). 'Our consultation fee is ₹500, and we can reserve a priority zero-wait slot for you.'`
      },
      {
        id: 4,
        title: '4. Book Callback / Capture Next Step',
        body: isTe
          ? `Offer to book their clinic consultation or doctor appointment at their preferred time. Confirm their preferred slot and thank them warmly. For example: 'మీకు మార్నింగ్ లేదా ఈవెనింగ్ ఏ టైమ్ కంఫర్టబుల్ అండి, స్లాట్ బుక్ చేసి వాట్సాప్ లో డీటెయిల్స్ పంపించమంటారా?'`
          : isHi
          ? `Offer to confirm preferred appointment time and send clinic location on WhatsApp: 'आपको सुबह या शाम का कौन सा समय अनुकूल रहेगा? मैं वॉट्सऐप पर लोकेशन और टोकन भेज देती हूँ।'`
          : `Offer to confirm preferred appointment time: 'Would morning or evening suit you better? I will confirm your slot and send the clinic location on WhatsApp.'`
      },
      {
        id: 5,
        title: '5. Close',
        body: isTe
          ? `Wrap up warmly, confirming the next step and letting them know they can reach out if they have more questions. For example: 'సరే అండి, మీ అపాయింట్‌మెంట్ కన్ఫర్మ్ చేసాము. ఏ డౌట్ ఉన్నా కాల్ చేయొచ్చు. టేక్ కేర్ అండి, థాంక్యూ!'`
          : isHi
          ? `Wrap up warmly: 'धन्यवाद! आपकी अपॉइंटमेंट बुक हो चुकी है। कोई भी सवाल हो तो आप कभी भी संपर्क कर सकते हैं। टेक केयर!'`
          : `Wrap up warmly: 'Wonderful! Your appointment is noted. We look forward to seeing you at Sanjeevani Clinic. Take care!'`
      },
      {
        id: 6,
        title: '6. FAQs',
        body: `Common questions callers ask, and how to answer them. Add one per line as "Q: … A: …".
Answer ONLY from what's written here; if a question isn't listed, use your don't-know response.

e.g.
Q: What are your clinic timings?  A: We're open 9am to 1pm, and 5pm to 9pm, Monday to Saturday.
Q: Where are you located?  A: Road No. 12, Banjara Hills, Hyderabad.`
      }
    ];

    return { employeeName, businessName, role, priceRange, voice, questions, scriptSteps, offeringsNoun: 'డాక్టర్ కన్సల్టేషన్' };
  }

  // 2. Interiors & Construction
  if (ind.includes('interior') || ind.includes('construction') || ind.includes('renovation')) {
    const employeeName = isTe ? 'పూజ' : 'Pooja';
    const businessName = 'DesignCraft Luxury Interiors';
    const role = 'Interior Designer & Turnkey Consultant';
    const priceRange = '₹1.5 Lakhs to ₹25 Lakhs';
    const voice = 'P09 Great Telugu';

    const questions = [
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
        title: 'What is your typical interior project or renovation budget?',
        subtitle: 'So your test call sounds like your business.',
        defaultValue: priceRange,
        type: 'text'
      },
      {
        step: 3,
        id: 'categories',
        title: 'What types of interior services do you offer?',
        subtitle: 'Tick all that apply.',
        options: [
          'Modular kitchens',
          'Wardrobes & storage',
          'Full home 3D interior design',
          'False ceiling & lighting',
          'Living & bedroom decor',
          'Turnkey renovation',
          'Other'
        ],
        defaultSelected: ['Modular kitchens', 'Full home 3D interior design'],
        type: 'chips'
      },
      {
        step: 4,
        id: 'next_action',
        title: 'What should the caller do next?',
        subtitle: 'So your test call sounds like your business.',
        options: [
          'Schedule free 3D design consultation',
          'Book free site measurement visit',
          'Get portfolio & estimate on WhatsApp',
          'Request designer callback',
          'Other'
        ],
        defaultSelected: ['Schedule free 3D design consultation'],
        type: 'pills'
      }
    ];

    const scriptSteps = [
      {
        id: 1,
        title: '1. Orient & Context',
        badge: 'START',
        body: isTe
          ? `Once they've confirmed their identity, introduce yourself as 'పూజ' from 'DesignCraft Luxury Interiors', and remind them they enquired about our turnkey interior and modular kitchen design. Mention you'll help with info or next steps. Keep it brief and friendly — for example you might say: 'నేను పూజ, DesignCraft Luxury Interiors నుండి అండి. మీరు మా మాడ్యులర్ కిచెన్ మరియు 3D హోమ్ ఇంటీరియర్స్ గురించి enquiry చేసారు కదా, మీకు ఏదైనా క్లారిటీ కావాలా లేదా డీటెయిల్స్ తెలుసుకోవాలా?'`
          : `Once they've confirmed their identity, introduce yourself as 'Pooja' from 'DesignCraft Luxury Interiors', and remind them they enquired about turnkey modular kitchens and home interiors.`
      },
      {
        id: 2,
        title: '2. Qualify Need',
        body: isTe
          ? `Find out what specific interior service they are interested in (Modular Kitchen, Wardrobes, Full Home, Renovation), and their handover timeline. Ask ONE thing at a time: 'మీకు మాడ్యులర్ కిచెన్ లేదా ఫుల్ హోమ్ ఇంటీరియర్ లో ఏది ప్లాన్ చేస్తున్నారు అండి?'`
          : `Find out what specific interior service they need and their possession timeline.`
      },
      {
        id: 3,
        title: '3. Share Info & Answer Questions',
        body: isTe
          ? `Explain our 45-day turnkey handover guarantee, 10-year warranty, and free 3D design consultation. Mention pricing (${priceRange}) if asked. For example: 'మా దగ్గర 45-డేస్ హ్యాండోవర్ గ్యారెంటీ మరియు 10 ఇయర్స్ వారంటీ ఉంటుంది అండి.'`
          : `Explain our 45-day handover guarantee, 10-year warranty, and free 3D design consultation.`
      },
      {
        id: 4,
        title: '4. Book Callback / Capture Next Step',
        body: isTe
          ? `Offer to schedule a free 3D design consultation or site measurement visit: 'మీకు ఈ వీకెండ్ ఫ్రీ 3D డిజైన్ కన్సల్టేషన్ లేదా సైట్ విజిట్ ప్లాన్ చేద్దామా అండి?'`
          : `Offer to schedule a free 3D design consultation or complimentary site measurement visit.`
      },
      {
        id: 5,
        title: '5. Close',
        body: isTe
          ? `Wrap up warmly, confirming the next step: 'సరే అండి, మా డిజైనర్ మీకు కాల్ చేస్తారు, వాట్సాప్ లో లేటెస్ట్ క్యాటలాగ్ పంపిస్తున్నాను. థాంక్యూ!'`
          : `Wrap up warmly, confirming the 3D consultation and sharing the catalog on WhatsApp.`
      },
      {
        id: 6,
        title: '6. FAQs',
        body: `Common questions callers ask, and how to answer them. Add one per line as "Q: … A: …".
Answer ONLY from what's written here; if a question isn't listed, use your don't-know response.

e.g.
Q: What is the handover timeline?  A: We deliver turnkey interiors within 45 days.
Q: Do you offer warranty?  A: Yes, we provide a 10-year warranty on modular woodwork.`
      }
    ];

    return { employeeName, businessName, role, priceRange, voice, questions, scriptSteps, offeringsNoun: 'ఇంటీరియర్స్ & మాడ్యులర్ కిచెన్' };
  }

  // 3. Coaching & Tuition
  if (ind.includes('coaching') || ind.includes('tuition') || ind.includes('education') || ind.includes('jee') || ind.includes('neet')) {
    const employeeName = isTe ? 'రోహన్' : 'Rohan';
    const businessName = 'IIT-JEE & NEET Academy';
    const role = 'Academic Counselor & Admissions Specialist';
    const priceRange = '₹15,000 to ₹95,000 / year';
    const voice = 'P09 Great Telugu';

    const questions = [
      {
        step: 1,
        id: 'business_name',
        title: 'What is your institute or academy name?',
        subtitle: 'So your test call sounds like your business.',
        defaultValue: businessName,
        type: 'text'
      },
      {
        step: 2,
        id: 'price_range',
        title: 'What is your course fee or tuition fee range?',
        subtitle: 'So your test call sounds like your business.',
        defaultValue: priceRange,
        type: 'text'
      },
      {
        step: 3,
        id: 'categories',
        title: 'What courses or batches do you offer?',
        subtitle: 'Tick all that apply.',
        options: [
          'IIT-JEE Repeaters & Long Term',
          'NEET Repeaters & Foundation',
          'Class 11 & 12 Science Tuitions',
          'Diagnostic Scholarship Test',
          'Spoken English & Skills',
          'Other'
        ],
        defaultSelected: ['IIT-JEE Repeaters & Long Term', 'NEET Repeaters & Foundation'],
        type: 'chips'
      },
      {
        step: 4,
        id: 'next_action',
        title: 'What should the student or parent do next?',
        subtitle: 'So your test call sounds like your business.',
        options: [
          'Schedule academic counselling session this Saturday',
          'Book diagnostic scholarship test',
          'Send syllabus & fee structure on WhatsApp',
          'Other'
        ],
        defaultSelected: ['Schedule academic counselling session this Saturday'],
        type: 'pills'
      }
    ];

    const scriptSteps = [
      {
        id: 1,
        title: '1. Orient & Context',
        badge: 'START',
        body: isTe
          ? `Once they've confirmed their identity, introduce yourself as 'రోహన్' from 'IIT-JEE & NEET Academy', and remind them they enquired about our admissions counseling. Mention you'll help with info or next steps. For example: 'నేను రోహన్, IIT-JEE & NEET Academy నుండి మాట్లాడుతున్నాను అండి. మీరు కోచింగ్ అడ్మిషన్స్ గురించి enquiry చేసారు కదా, మీకు ఏ కోర్సు డీటెయిల్స్ కావాలి అండి?'`
          : `Once they've confirmed their identity, introduce yourself as 'Rohan' from 'IIT-JEE & NEET Academy', calling regarding admissions counseling.`
      },
      {
        id: 2,
        title: '2. Qualify Need',
        body: isTe
          ? `Ask student's current grade and target exam (JEE, NEET, Repeaters). Ask ONE thing at a time: 'స్టూడెంట్ ప్రస్తుతం 12th కంప్లీట్ చేశారా లేదా రిపీటర్ బ్యాచ్ చూస్తున్నారా అండి?'`
          : `Ask student's target exam (JEE, NEET, Foundation) and current grade.`
      },
      {
        id: 3,
        title: '3. Share Info & Answer Questions',
        body: isTe
          ? `Explain small batch sizes, top faculty, and upcoming scholarship test this Saturday. Mention fee range (${priceRange}): 'మా దగ్గర లిమిటెడ్ బ్యాచ్ సైజ్ ఉంటుంది, మరియు ఈ శనివారం స్కాలర్‌షిప్ టెస్ట్ ఉంది అండి.'`
          : `Explain small batch sizes, proven faculty track record, and scholarship tests.`
      },
      {
        id: 4,
        title: '4. Book Callback / Capture Next Step',
        body: isTe
          ? `Invite for free academic counselling session this Saturday: 'ఈ శనివారం పేరెంట్స్ తో పాటు ఫ్రీ కౌన్సిలింగ్ సెషన్ కి రమ్మంటారా అండి?'`
          : `Invite for free 1-on-1 academic counselling session this Saturday.`
      },
      {
        id: 5,
        title: '5. Close',
        body: isTe
          ? `Wrap up warmly: 'సరే అండి, వాట్సాప్ లో సిలబస్ మరియు టైమింగ్స్ పంపిస్తున్నాను. థాంక్యూ!'`
          : `Wrap up warmly and deliver syllabus on WhatsApp.`
      },
      {
        id: 6,
        title: '6. FAQs',
        body: `Common questions callers ask, and how to answer them. Add one per line as "Q: … A: …".
Answer ONLY from what's written here; if a question isn't listed, use your don't-know response.

e.g.
Q: When is the scholarship test?  A: Every Saturday at 10:00 AM.
Q: Do you offer hostel facility?  A: Yes, separate supervised hostels for boys and girls.`
      }
    ];

    return { employeeName, businessName, role, priceRange, voice, questions, scriptSteps, offeringsNoun: 'కోచింగ్ & అడ్మిషన్స్' };
  }

  // 4. Car & Bike Dealership
  if (ind.includes('car') || ind.includes('dealership') || ind.includes('bike') || ind.includes('automobile')) {
    const employeeName = isTe ? 'భువన' : 'Bhuvana';
    const businessName = 'Maruti Suzuki authorized showroom';
    const role = 'Showroom Sales & Test Drive Coordinator';
    const priceRange = '₹6 Lakhs to ₹28 Lakhs';
    const voice = 'P09 Great Telugu';

    const questions = [
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
        defaultValue: priceRange,
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
        options: [
          'Book home test drive this Saturday or Sunday',
          'Visit showroom',
          'Send brochure & EMI calculator on WhatsApp',
          'Speak to sales manager',
          'Other'
        ],
        defaultSelected: ['Book home test drive this Saturday or Sunday'],
        type: 'pills'
      }
    ];

    const scriptSteps = [
      {
        id: 1,
        title: '1. Orient & Context',
        badge: 'START',
        body: isTe
          ? `Once they've confirmed their identity, introduce yourself as 'భువన' from 'శ్రీ సాయి మోటార్స్', and remind them they enquired about our cars or test drive booking. Mention you'll help with info or next steps. Keep it brief and friendly — for example you might say: 'నేను భువన, శ్రీ సాయి మోటార్స్ నుండి అండి. మీరు మా కార్స్ మరియు టెస్ట్ డ్రైవ్ గురించి enquiry చేసారు కదా, మీకు ఏదైనా క్లారిటీ కావాలా లేదా డీటెయిల్స్ తెలుసుకోవాలా?'`
          : `Once they've confirmed their identity, introduce yourself as 'Bhuvana' from 'Sri Sai Motors', calling regarding cars and test drive booking.`
      },
      {
        id: 2,
        title: '2. Qualify Need',
        body: isTe
          ? `Find out what specific car model or configuration they are interested in, and if they have any particular requirement or question. Ask ONE thing at a time: 'మీకు ఏ కార్ మోడల్ గురించి తెలుసుకోవాలని ఉంది అండి?'`
          : `Find out what specific car model they are looking for and whether they prefer manual or automatic.`
      },
      {
        id: 3,
        title: '3. Share Info & Answer Questions',
        body: isTe
          ? `Based on their interest, briefly explain how our test drives and financing work and mention the price (₹6.5 Lakh to ₹28 Lakh) if they ask. For example: 'మా కార్ల డీటెయిల్స్ చెప్పొచ్చు అండి, ప్రైస్ 6.5 లక్షల నుంచి స్టార్ట్ అవుతుంది.'`
          : `Explain financing options, exchange bonuses, and vehicle features.`
      },
      {
        id: 4,
        title: '4. Book Callback / Capture Next Step',
        body: isTe
          ? `Offer to arrange a callback or home test drive: 'మీకు ఈ శనివారం లేదా ఆదివారం హోమ్ టెస్ట్ డ్రైవ్ బుక్ చేయమంటారా అండి?'`
          : `Offer to book a complimentary home test drive this Saturday or Sunday.`
      },
      {
        id: 5,
        title: '5. Close',
        body: isTe
          ? `Wrap up warmly: 'సరే అండి, మా సేల్స్ టీమ్ మీకు టెస్ట్ డ్రైవ్ కన్ఫర్మేషన్ పంపిస్తారు. థాంక్యూ!'`
          : `Wrap up warmly and send digital brochure on WhatsApp.`
      },
      {
        id: 6,
        title: '6. FAQs',
        body: `Common questions callers ask, and how to answer them. Add one per line as "Q: … A: …".
Answer ONLY from what's written here; if a question isn't listed, use your don't-know response.

e.g.
Q: Do you offer exchange bonus?  A: Yes, up to ₹40,000 exchange bonus on old vehicles.
Q: Can I get doorstep test drive?  A: Yes, free doorstep test drives across the city.`
      }
    ];

    return { employeeName, businessName, role, priceRange, voice, questions, scriptSteps, offeringsNoun: 'కార్స్ & టెస్ట్ డ్రైవ్' };
  }

  // 5. Local Services
  if (ind.includes('local') || ind.includes('service') || ind.includes('repair') || ind.includes('plumb')) {
    const employeeName = isTe ? 'కావ్య' : 'Kavya';
    const businessName = 'QuickFix Local Home Services';
    const role = 'Service Dispatch & Support Coordinator';
    const priceRange = '₹299 to ₹2,500';
    const voice = 'P09 Great Telugu';

    const questions = [
      {
        step: 1,
        id: 'business_name',
        title: 'What is your service business name?',
        subtitle: 'So your test call sounds like your business.',
        defaultValue: businessName,
        type: 'text'
      },
      {
        step: 2,
        id: 'price_range',
        title: 'What is your typical service or inspection fee?',
        subtitle: 'So your test call sounds like your business.',
        defaultValue: priceRange,
        type: 'text'
      },
      {
        step: 3,
        id: 'categories',
        title: 'What repair or local services do you provide?',
        subtitle: 'Tick all that apply.',
        options: [
          'AC Repair, Gas Refill & Servicing',
          'Plumbing & Water Motor Repairs',
          'Electrical Wiring & Appliances',
          'Home Deep Cleaning',
          'Carpentry & Furniture Assembly',
          'Other'
        ],
        defaultSelected: ['AC Repair, Gas Refill & Servicing'],
        type: 'chips'
      },
      {
        step: 4,
        id: 'next_action',
        title: 'What should the caller do next?',
        subtitle: 'So your test call sounds like your business.',
        options: [
          'Schedule technician doorstep visit',
          'Get upfront price estimate on WhatsApp',
          'Urgent 2-hour technician dispatch',
          'Other'
        ],
        defaultSelected: ['Schedule technician doorstep visit'],
        type: 'pills'
      }
    ];

    const scriptSteps = [
      {
        id: 1,
        title: '1. Orient & Context',
        badge: 'START',
        body: isTe
          ? `Once they've confirmed their identity, introduce yourself as 'కావ్య' from 'QuickFix Local Home Services', and remind them they enquired about home repair and servicing. Mention you'll help with info or booking. For example: 'నేను కావ్య, QuickFix సర్వీసెస్ నుండి అండి. మీరు హోమ్ రిపేర్ గురించి enquiry చేసారు కదా, మీకు ఏ సర్వీస్ అవసరం ఉంది అండి?'`
          : `Once they've confirmed their identity, introduce yourself as 'Kavya' from 'QuickFix Local Home Services', calling regarding home repair and servicing.`
      },
      {
        id: 2,
        title: '2. Qualify Need',
        body: isTe
          ? `Identify specific repair issue (AC, plumbing, electrical) and urgency: 'మీకు AC సర్వీస్ లేదా ప్లంబింగ్ లో ఏ సమస్య ఉంది అండి, ఎంత అర్జెంట్?'`
          : `Identify specific repair issue and urgency.`
      },
      {
        id: 3,
        title: '3. Share Info & Answer Questions',
        body: isTe
          ? `Explain transparent inspection fee (₹299) and 30-day service warranty: 'మా విజిటింగ్ చార్జ్ ₹299 మాత్రమే మరియు 30-రోజుల సర్వీస్ వారంటీ ఉంటుంది.'`
          : `Explain transparent inspection fee (₹299) and 30-day service warranty.`
      },
      {
        id: 4,
        title: '4. Book Callback / Capture Next Step',
        body: isTe
          ? `Offer to schedule technician doorstep visit: 'ఈ రోజు టెక్నీషియన్ ని మీ ఇంటికి పంపించమంటారా అండి?'`
          : `Offer to schedule technician doorstep visit within 2 hours.`
      },
      {
        id: 5,
        title: '5. Close',
        body: isTe
          ? `Wrap up warmly: 'సరే అండి, బుకింగ్ కన్ఫర్మ్ చేసాము. టెక్నీషియన్ నంబర్ వాట్సాప్ లో పంపిస్తున్నాను. థాంక్యూ!'`
          : `Wrap up warmly and send booking details on WhatsApp.`
      },
      {
        id: 6,
        title: '6. FAQs',
        body: `Common questions callers ask, and how to answer them. Add one per line as "Q: … A: …".
Answer ONLY from what's written here; if a question isn't listed, use your don't-know response.

e.g.
Q: How quickly can a technician visit?  A: Within 60 to 90 minutes.
Q: Is there any warranty?  A: Yes, 30-day rework warranty on all repairs.`
      }
    ];

    return { employeeName, businessName, role, priceRange, voice, questions, scriptSteps, offeringsNoun: 'హోమ్ సర్వీసెస్ & రిపేర్స్' };
  }

  // Default: Real Estate (Lakshmi)
  const employeeName = isTe ? 'లక్ష్మి' : 'Lakshmi';
  const businessName = 'Sai Constructions';
  const role = 'Real Estate Sales & Site Visit Desk';
  const priceRange = '₹45 Lakhs to ₹2.5 Crores';
  const voice = 'P09 Great Telugu';

  const questions = [
    {
      step: 1,
      id: 'business_name',
      title: 'What is your property development or agency name?',
      subtitle: 'So your test call sounds like your business.',
      defaultValue: businessName,
      type: 'text'
    },
    {
      step: 2,
      id: 'price_range',
      title: 'What is the price range of your units or plots?',
      subtitle: 'So your test call sounds like your business.',
      defaultValue: priceRange,
      type: 'text'
    },
    {
      step: 3,
      id: 'categories',
      title: 'What types of properties do you sell?',
      subtitle: 'Tick all that apply.',
      options: [
        '2 BHK & 3 BHK Luxury Apartments',
        'Gated Community Villas',
        'Commercial Office & Retail Spaces',
        'Approved Residential Plots & Land',
        'Penthouse Suites',
        'Other'
      ],
      defaultSelected: ['2 BHK & 3 BHK Luxury Apartments', 'Gated Community Villas'],
      type: 'chips'
    },
    {
      step: 4,
      id: 'next_action',
      title: 'What should the customer do next?',
      subtitle: 'So your test call sounds like your business.',
      options: [
        'Book weekend site visit with free cab pickup',
        'Send floor plan PDF & pricing on WhatsApp',
        'Arrange call with project manager',
        'Other'
      ],
      defaultSelected: ['Book weekend site visit with free cab pickup'],
      type: 'pills'
    }
  ];

  const scriptSteps = [
    {
      id: 1,
      title: '1. Orient & Context',
      badge: 'START',
      body: isTe
        ? `Once they've confirmed their identity, introduce yourself as 'లక్ష్మి' from 'సాయి కన్‌స్ట్రక్షన్స్', and remind them they enquired about our 2 & 3 BHK flats in Sector 150. Mention you'll help with info or next steps. Keep it brief and friendly — for example you might say: 'నేను లక్ష్మి, సాయి కన్‌స్ట్రక్షన్స్ నుండి అండి. మీరు సెక్టార్ 150 లో 2 & 3 BHK లగ్జరీ ఫ్లాట్స్ గురించి enquiry చేసారు కదా, మీకు ఏదైనా క్లారిటీ కావాలా లేదా డీటెయిల్స్ తెలుసుకోవాలా?'`
        : `Once they've confirmed their identity, introduce yourself as 'Lakshmi' from 'Sai Constructions', calling regarding our luxury 2 and 3 BHK gated community flats in Sector 150.`
    },
    {
      id: 2,
      title: '2. Qualify Need',
      body: isTe
        ? `Find out what specific configuration (2 BHK or 3 BHK) they are interested in, and their budget range. Ask ONE thing at a time, wait for their answer, and respond naturally before the next question. For example: 'మీకు 2 BHK లేదా 3 BHK లో ఏది ఇంట్రెస్ట్ ఉంది అండి?'`
        : `Find out what specific configuration (2 BHK or 3 BHK) they are interested in, and their budget range. Ask ONE question at a time.`
    },
    {
      id: 3,
      title: '3. Share Info & Answer Questions',
      body: isTe
        ? `Based on their interest, briefly explain luxury amenities, clubhouse, possession timeline, and mention the price (${priceRange}). Answer any questions they have. Mention you'll send floor plan PDF on WhatsApp. For example: 'మా ప్రాజెక్ట్ లో క్లబ్‌హౌస్ మరియు లగ్జరీ ఎమెనిటీస్ ఉన్నాయి అండి, ప్రైస్ ₹45 లక్షల నుంచి మొదలవుతుంది.'`
        : `Explain luxury amenities, clubhouse, possession timeline, and pricing (${priceRange}). Send floor plan PDF on WhatsApp.`
    },
    {
      id: 4,
      title: '4. Book Callback / Capture Next Step',
      body: isTe
        ? `Offer to arrange a weekend site visit with complimentary cab pickup. Confirm their preferred visit time and thank them warmly. For example: 'మీకు ఈ వీకెండ్ ఫ్రీ క్యాబ్ పికప్ తో సైట్ విజిట్ ప్లాన్ చేద్దామా అండి? సరేనా?'`
        : `Offer to arrange a weekend site visit with complimentary cab pickup. Confirm their preferred date and time.`
    },
    {
      id: 5,
      title: '5. Close',
      body: isTe
        ? `Wrap up warmly, confirming the next step and letting them know they can reach out if they have more questions. For example: 'సరే అండి, మా సేల్స్ మేనేజర్ మీకు కాల్ చేసి క్యాబ్ డీటెయిల్స్ పంపిస్తారు. థాంక్యూ!'`
        : `Wrap up warmly, confirming the site visit date and sending location map on WhatsApp.`
    },
    {
      id: 6,
      title: '6. FAQs',
      body: `Common questions callers ask, and how to answer them. Add one per line as "Q: … A: …".
Answer ONLY from what's written here; if a question isn't listed, use your don't-know response.

e.g.
Q: Is free cab pickup available?  A: Yes, we provide free doorstep cab pickup for weekend site visits.
Q: Are bank loans approved?  A: Yes, approved by SBI, HDFC, and ICICI with attractive interest rates.`
    }
  ];

  return { employeeName, businessName, role, priceRange, voice, questions, scriptSteps, offeringsNoun: 'లగ్జరీ ఫ్లాట్స్ & సైట్ విజిట్' };
}
