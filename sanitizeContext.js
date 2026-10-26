/**
 * Client-Side Domain-Specific Industry Context & Location Sanitizer
 * Ensures parsePromptToCallFlow and script generators never cross-contaminate prompts across industries.
 */

export function sanitizeContextForIndustry(rawContext = '', industry = '', role = '', businessName = '') {
  const ind = (industry || '').toLowerCase();
  const r = (role || '').toLowerCase();
  const b = (businessName || '').toLowerCase();
  const ctx = (rawContext || '').trim();

  // 1. Healthcare, Clinic & Hospital
  if (
    ind.includes('hospital') ||
    ind.includes('clinic') ||
    ind.includes('health') ||
    ind.includes('doctor') ||
    r.includes('doctor') ||
    r.includes('patient') ||
    r.includes('clinic') ||
    b.includes('clinic') ||
    b.includes('hospital')
  ) {
    if (
      !ctx ||
      /jee|neet|repeaters|classes|tuition|scholarship|admission|12th score|flats?|bhk|villas?|car|dealership|brezza|swift|jewel|gold|silver|interior/i.test(ctx)
    ) {
      return 'priority doctor consultations, diagnostic health checkups, and comprehensive patient care';
    }
    return ctx;
  }

  // 2. Interiors & Construction
  if (ind.includes('interior') || ind.includes('construction') || r.includes('interior') || b.includes('interior')) {
    if (
      !ctx ||
      /jee|neet|repeaters|classes|tuition|scholarship|clinic|doctor|patient|car|dealership|jewel|gold|prime location appreciation|builder discount|2 bhk unit|flats\s+in\s+sector/i.test(ctx)
    ) {
      return 'turnkey modular kitchen solutions, 45-day handover guarantee, and free 3D design consultation';
    }
    return ctx;
  }

  // 3. Real Estate & Property
  if (ind.includes('real estate') || ind.includes('property') || r.includes('property') || r.includes('realty')) {
    if (
      !ctx ||
      /jee|neet|classes|tuition|scholarship|patient|doctor|clinic|teeth|car|dealership|jewel|gold|modular kitchen/i.test(ctx)
    ) {
      return 'premium residential apartments, luxury gated villas, and weekend site visits';
    }
    return ctx;
  }

  // 4. Coaching, Tuition & Academic Education
  if (
    ind.includes('coach') ||
    ind.includes('tuition') ||
    ind.includes('education') ||
    r.includes('counselor') ||
    r.includes('academic') ||
    r.includes('admissions')
  ) {
    if (
      !ctx ||
      /clinic|doctor|patient|teeth|hospital|flats?|bhk|villas?|car|dealership|jewel|gold|modular kitchen/i.test(ctx)
    ) {
      return 'upcoming academic admissions, scholarship entrance evaluation, and faculty counselling';
    }
    return ctx;
  }

  // 5. Automobile & Car Dealership
  if (ind.includes('car') || ind.includes('dealership') || ind.includes('automobile')) {
    if (
      !ctx ||
      /jee|neet|classes|tuition|scholarship|clinic|doctor|patient|flats?|bhk|jewel|modular kitchen/i.test(ctx)
    ) {
      return 'new vehicle models, doorstep test drive scheduling, and seasonal exchange bonuses';
    }
    return ctx;
  }

  // 6. Jewellery & Gold
  if (ind.includes('jewel') || r.includes('jewel') || b.includes('jewel')) {
    if (
      !ctx ||
      /jee|neet|classes|tuition|scholarship|clinic|doctor|patient|flats?|bhk|car|dealership/i.test(ctx)
    ) {
      return 'zero making charges, pure BIS 916 hallmarked gold, and festive silver collections';
    }
    return ctx;
  }

  // 7. General Business Fallback
  return ctx || 'exclusive seasonal packages, special promotions, and dedicated customer assistance';
}

export function extractLocation(prompt = '', businessName = '', industry = '') {
  const p = (prompt || '').trim();
  const ind = (industry || '').toLowerCase();
  const b = (businessName || '').toLowerCase();

  // If prompt has an explicit clean location
  if (p) {
    const match = p.match(/(?:located\s+in|location(?:\s+is)?|branch\s+at|office\s+at|near)\s+([A-Za-z0-9\s,]{3,35}?)(?:\.|\,|$|\s+and|\s+with)/i);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (!/call|parent|student|enquiry|score|test|batch|offer|discount|appointment|doctor|patient|scholarship|flat|bhk|car|interior/i.test(candidate) && candidate.length < 35) {
        return candidate;
      }
    }
  }

  if (ind.includes('health') || ind.includes('clinic') || ind.includes('hospital') || b.includes('clinic') || b.includes('health')) {
    return 'Road No. 12, Banjara Hills, Hyderabad';
  }
  if (ind.includes('interior') || ind.includes('construction') || b.includes('interior')) {
    return 'Financial District, Gachibowli, Hyderabad';
  }
  if (ind.includes('real estate') || ind.includes('property') || b.includes('meadow') || b.includes('realty')) {
    return 'Sector 150 Expressway, Prime Hub, Hyderabad';
  }
  if (ind.includes('jewel') || b.includes('jewel')) {
    return 'Main Road, Jillelaguda, Hyderabad';
  }
  if (ind.includes('coach') || ind.includes('tuition') || ind.includes('academy')) {
    return 'Himayatnagar Main Road, Hyderabad';
  }
  if (ind.includes('car') || ind.includes('dealership')) {
    return 'Kavuri Hills, Madhapur, Hyderabad';
  }
  return 'Prime Commercial Hub, Hyderabad, Telangana';
}
