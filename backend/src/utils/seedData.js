import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import Department from '../models/Department.js';
import Scheme from '../models/Scheme.js';
import EligibilityRule from '../models/EligibilityRule.js';
import Bookmark from '../models/Bookmark.js';
import Notification from '../models/Notification.js';
import Feedback from '../models/Feedback.js';
import SystemNotification from '../models/SystemNotification.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/government_scheme_db';

const departmentsData = [
  {
    departmentName: 'Department of Agriculture & Farmers Welfare',
    slug: 'department-of-agriculture-and-farmers-welfare',
    description: 'Formulates and implements national policies and programs for agricultural growth, farmers welfare, credit, and food security.',
    ministryName: 'Ministry of Agriculture and Farmers Welfare',
    officialWebsite: 'https://agricoop.gov.in',
    contactInformation: {
      email: 'agri-support@gov.in',
      phone: '1800-180-1551',
      address: 'Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001',
    },
    isActive: true,
  },
  {
    departmentName: 'Department of Health & Family Welfare',
    slug: 'department-of-health-and-family-welfare',
    description: 'Responsible for public health infrastructure, family planning, medical education, and national universal health protection programs.',
    ministryName: 'Ministry of Health and Family Welfare',
    officialWebsite: 'https://mohfw.gov.in',
    contactInformation: {
      email: 'health-desk@mohfw.gov.in',
      phone: '1800-11-4477',
      address: 'Nirman Bhawan, Maulana Azad Road, New Delhi - 110011',
    },
    isActive: true,
  },
  {
    departmentName: 'Department of Housing and Urban Affairs',
    slug: 'department-of-housing-and-urban-affairs',
    description: 'Apex authority for formulating policies, sponsoring programs and coordinating urban development and affordable housing schemes.',
    ministryName: 'Ministry of Housing and Urban Affairs',
    officialWebsite: 'https://mohua.gov.in',
    contactInformation: {
      email: 'pmay-urban@gov.in',
      phone: '011-23063285',
      address: 'Nirman Bhawan, C-Wing, New Delhi - 110011',
    },
    isActive: true,
  },
  {
    departmentName: 'Department of Financial Services',
    slug: 'department-of-financial-services',
    description: 'Oversees banking services, financial inclusion initiatives, credit facilitation, pension architecture, and micro-enterprise lending.',
    ministryName: 'Ministry of Finance',
    officialWebsite: 'https://financialservices.gov.in',
    contactInformation: {
      email: 'dfs-support@nic.in',
      phone: '1800-180-1111',
      address: 'Jeevan Deep Building, Parliament Street, New Delhi - 110001',
    },
    isActive: true,
  },
  {
    departmentName: 'Department of Higher Education',
    slug: 'department-of-higher-education',
    description: 'Supports higher education access, research grants, scholarships, equity initiatives, and institutional development across India.',
    ministryName: 'Ministry of Education',
    officialWebsite: 'https://education.gov.in',
    contactInformation: {
      email: 'scholarships-support@gov.in',
      phone: '0120-6619540',
      address: 'Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001',
    },
    isActive: true,
  },
  {
    departmentName: 'Ministry of Women and Child Development',
    slug: 'ministry-of-women-and-child-development',
    description: 'Spearheads women empowerment, gender budget initiatives, child rights, nutrition programs, and protection of vulnerable groups.',
    ministryName: 'Ministry of Women and Child Development',
    officialWebsite: 'https://wcd.nic.in',
    contactInformation: {
      email: 'wcd-portal@gov.in',
      phone: '011-23386423',
      address: 'Shastri Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001',
    },
    isActive: true,
  },
  {
    departmentName: 'Ministry of Micro, Small and Medium Enterprises',
    slug: 'ministry-of-msme',
    description: 'Promotes growth and development of micro, small and medium enterprises including artisans, handicrafts, and village industries.',
    ministryName: 'Ministry of Micro, Small and Medium Enterprises',
    officialWebsite: 'https://msme.gov.in',
    contactInformation: {
      email: 'msme-helpdesk@gov.in',
      phone: '011-23063800',
      address: 'Udyog Bhawan, Rafi Marg, New Delhi - 110011',
    },
    isActive: true,
  },
  {
    departmentName: 'Department of Social Justice and Empowerment',
    slug: 'department-of-social-justice-and-empowerment',
    description: 'Ensures equitable welfare, scholarships, and social protection for SC, OBC, EWS, senior citizens, and persons with disabilities.',
    ministryName: 'Ministry of Social Justice and Empowerment',
    officialWebsite: 'https://socialjustice.gov.in',
    contactInformation: {
      email: 'socialjustice-desk@gov.in',
      phone: '011-23381643',
      address: 'Shastri Bhawan, New Delhi - 110001',
    },
    isActive: true,
  },
];

export const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected to MongoDB');

    // Clean previous collections
    await Promise.all([
      User.deleteMany({}),
      UserProfile.deleteMany({}),
      Department.deleteMany({}),
      Scheme.deleteMany({}),
      EligibilityRule.deleteMany({}),
      Bookmark.deleteMany({}),
      Notification.deleteMany({}),
      Feedback.deleteMany({}),
      SystemNotification.deleteMany({}),
    ]);
    console.log('[Seed] Cleared existing data');

    // 1. Create Default Users
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('Admin@12345', salt);
    const citizenPasswordHash = await bcrypt.hash('Citizen@12345', salt);

    const adminUser = await User.create({
      fullName: 'National Admin',
      email: 'admin@schemegov.in',
      phone: '+91 9876543210',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
    });

    const citizenUser = await User.create({
      fullName: 'Rajesh Sharma',
      email: 'citizen@schemegov.in',
      phone: '+91 9823456789',
      passwordHash: citizenPasswordHash,
      role: 'USER',
      isActive: true,
    });

    // Profile for Citizen User
    await UserProfile.create({
      userId: citizenUser._id,
      dateOfBirth: new Date('1988-06-15'),
      gender: 'Male',
      state: 'Maharashtra',
      district: 'Pune',
      annualFamilyIncome: 240000,
      education: 'Graduate',
      occupation: 'Farmer',
      employmentStatus: 'Farmer',
      community: 'OBC',
      disabilityStatus: false,
      otherDetails: {
        landHoldingAcres: 2.5,
        ownsHouse: false,
      },
    });

    console.log('[Seed] Created Admin & Citizen users');

    // 2. Create Departments
    const insertedDepts = await Department.insertMany(departmentsData);
    const deptMap = {};
    insertedDepts.forEach((d) => {
      deptMap[d.slug] = d._id;
    });
    console.log(`[Seed] Created ${insertedDepts.length} departments`);

    // 3. Create Schemes with Rich Details
    const schemesData = [
      {
        schemeName: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        slug: 'pm-kisan-samman-nidhi',
        shortDescription: 'Direct income support of ₹6,000 per year in three equal installments to all landholding farmer families across India.',
        fullDescription:
          'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) is a Central Sector scheme with 100% funding from the Government of India. It has become operational from 1.12.2018. Under the scheme, income support of ₹6,000/- per year is provided to all landholding farmer families across the country in three equal installments of ₹2,000/- each, every four months, transferred directly to bank accounts via DBT.',
        objectives: [
          'Augment income of farmer families for procuring agricultural inputs and domestic needs',
          'Protect farmers from falling into the clutches of moneylenders',
          'Ensure financial resilience during pre-harvest and sowing cycles',
        ],
        benefits: [
          {
            title: 'Annual Income Support',
            description: 'Financial benefit of ₹6,000 per annum paid in 3 four-monthly installments of ₹2,000 each.',
            amount: '₹6,000 / year',
          },
        ],
        category: 'Agriculture',
        schemeLevel: 'Central',
        applicableStates: ['All India'],
        ministry: 'Ministry of Agriculture and Farmers Welfare',
        departmentId: deptMap['department-of-agriculture-and-farmers-welfare'],
        targetBeneficiaries: ['Small and Marginal Farmers', 'Landholding Cultivators'],
        eligibilitySummary: 'All landholding farmer families who hold cultivable land in their names, excluding institutional landholders and high-income tax payers.',
        requiredDocuments: [
          { name: 'Aadhaar Card', mandatory: true, notes: 'Must be linked to active bank account' },
          { name: 'Land Ownership Records (Khata/Khasra/7-12 extract)', mandatory: true, notes: 'Updated land revenue record' },
          { name: 'Active Bank Passbook', mandatory: true, notes: 'IFSC code and account number' },
        ],
        applicationProcedure: [
          'Visit the official PM-KISAN portal or contact the nearest Common Service Centre (CSC).',
          'Click on "Farmers Corner" and select "New Farmer Registration".',
          'Enter Aadhaar number, state, and complete captcha verification.',
          'Fill in land holding details, survey numbers, and bank account credentials.',
          'Submit application and note down the registration number for tracking.',
        ],
        officialWebsite: 'https://pmkisan.gov.in',
        officialApplicationUrl: 'https://pmkisan.gov.in/RegistrationFormNew.aspx',
        officialStatusUrl: 'https://pmkisan.gov.in/BeneficiaryStatus_New.aspx',
        sourceUrls: [
          { title: 'PM-KISAN National Portal', url: 'https://pmkisan.gov.in', verified: true },
          { title: 'MyScheme Portal Entry', url: 'https://www.myscheme.gov.in/schemes/pm-kisan', verified: true },
        ],
        verificationStatus: 'VERIFIED',
        lastVerifiedAt: new Date('2026-09-15'),
        isActive: true,
      },
      {
        schemeName: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)',
        slug: 'ayushman-bharat-pm-jay',
        shortDescription: 'World’s largest health insurance scheme providing health cover of up to ₹5 lakh per family per year for secondary and tertiary care hospitalisation.',
        fullDescription:
          'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (AB-PMJAY) provides a health cover of ₹5,00,000 per family per year for secondary and tertiary care hospitalization to over 12 crore poor and vulnerable families (approximately 55 crore beneficiaries) that form the bottom 40% of the Indian population. The coverage includes pre and post-hospitalization, diagnostics, medications, and over 1,900 medical procedures across impaneled public and private hospitals.',
        objectives: [
          'Reduce catastrophic out-of-pocket health expenditures',
          'Provide cashless and paperless access to quality healthcare services',
          'Ensure comprehensive financial protection during acute and chronic medical emergencies',
        ],
        benefits: [
          {
            title: 'Cashless Hospitalization Cover',
            description: 'Up to ₹5,00,000 health cover per family per year with no cap on family size or age of members.',
            amount: '₹5,00,000 / family / year',
          },
          {
            title: 'Diagnostic and Post-Hospitalization Care',
            description: 'Covers 3 days pre-hospitalization and 15 days post-hospitalization expenses including medicines.',
            amount: 'Comprehensive',
          },
        ],
        category: 'Healthcare',
        schemeLevel: 'Central',
        applicableStates: ['All India'],
        ministry: 'Ministry of Health and Family Welfare',
        departmentId: deptMap['department-of-health-and-family-welfare'],
        targetBeneficiaries: ['Low-Income Families', 'BPL Households', 'Informal Sector Workers', 'Senior Citizens'],
        eligibilitySummary: 'Families listed in the Socio-Economic and Caste Census (SECC 2011) database or covered under state food security/NFSA schemes.',
        requiredDocuments: [
          { name: 'Aadhaar Card or Government Photo ID', mandatory: true, notes: 'For biometric identification' },
          { name: 'Ration Card / NFSA Card', mandatory: true, notes: 'To establish family member eligibility' },
        ],
        applicationProcedure: [
          'Check eligibility online at pmjay.gov.in using mobile number or Ration card number.',
          'Visit any impaneled public hospital, private hospital, or nearest CSC center with Aadhaar and Ration card.',
          'Undergo biometric verification with the Ayushman Mitra at the helpdesk.',
          'Receive the Golden Ayushman Card on the spot.',
        ],
        officialWebsite: 'https://nha.gov.in/PM-JAY',
        officialApplicationUrl: 'https://beneficiary.nha.gov.in',
        officialStatusUrl: 'https://beneficiary.nha.gov.in',
        sourceUrls: [
          { title: 'National Health Authority Official Website', url: 'https://nha.gov.in', verified: true },
          { title: 'National Beneficiary Portal', url: 'https://beneficiary.nha.gov.in', verified: true },
        ],
        verificationStatus: 'VERIFIED',
        lastVerifiedAt: new Date('2026-08-20'),
        isActive: true,
      },
      {
        schemeName: 'Pradhan Mantri Awas Yojana - Urban (PMAY-U)',
        slug: 'pradhan-mantri-awas-yojana-urban',
        shortDescription: 'Credit-linked subsidy and financial assistance up to ₹2.67 lakh for eligible urban families from EWS and LIG segments to acquire or build pucca houses.',
        fullDescription:
          'Pradhan Mantri Awas Yojana - Urban (PMAY-U) is designed to address the urban housing shortage among the Economically Weaker Section (EWS) and Low Income Group (LIG) categories. Beneficiaries can avail interest subvention on housing loans through the Credit Linked Subsidy Scheme (CLSS) or direct financial assistance under Beneficiary-Led Construction (BLC).',
        objectives: [
          'Ensure pucca houses with basic civic amenities for eligible urban poor families',
          'Promote women empowerment by requiring female ownership or co-ownership of the house',
          'Provide subsidized home loan interest rates to lower urban mortgage burden',
        ],
        benefits: [
          {
            title: 'Interest Subsidy on Housing Loan',
            description: 'Up to 6.5% interest subsidy on housing loans for tenure up to 20 years.',
            amount: 'Up to ₹2,67,000',
          },
        ],
        category: 'Housing',
        schemeLevel: 'Central',
        applicableStates: ['All India'],
        ministry: 'Ministry of Housing and Urban Affairs',
        departmentId: deptMap['department-of-housing-and-urban-affairs'],
        targetBeneficiaries: ['EWS & LIG Urban Families', 'Slum Dwellers', 'First-Time Home Buyers'],
        eligibilitySummary: 'Beneficiary family must not own a pucca house in any part of India. Annual income up to ₹3,00,000 for EWS and up to ₹6,00,000 for LIG.',
        requiredDocuments: [
          { name: 'Aadhaar Card of all family members', mandatory: true, notes: 'Identity proof' },
          { name: 'Income Certificate / ITR / Form 16', mandatory: true, notes: 'To certify EWS/LIG bracket' },
          { name: 'Bank Statement (last 6 months)', mandatory: true, notes: 'Financial evaluation' },
          { name: 'Affidavit declaring non-ownership of pucca house', mandatory: true, notes: 'Mandatory declaration' },
        ],
        applicationProcedure: [
          'Access pmaymis.gov.in or apply through an urban local body (Municipality) or CSC.',
          'Select Citizen Assessment -> Apply Online and choose applicable vertical.',
          'Enter Aadhaar number and verify name against official records.',
          'Fill in urban residence details, household income, and property details.',
          'Save application and track status using Assessment ID.',
        ],
        officialWebsite: 'https://pmaymis.gov.in',
        officialApplicationUrl: 'https://pmaymis.gov.in/Open/Check_Aadhar_Existence.aspx',
        officialStatusUrl: 'https://pmaymis.gov.in/Track_Application_Status.aspx',
        sourceUrls: [
          { title: 'Ministry of Housing and Urban Affairs PMAY Portal', url: 'https://pmaymis.gov.in', verified: true },
        ],
        verificationStatus: 'VERIFIED',
        lastVerifiedAt: new Date('2026-07-10'),
        isActive: true,
      },
      {
        schemeName: 'PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)',
        slug: 'pm-svanidhi-scheme',
        shortDescription: 'Collateral-free working capital loan starting at ₹10,000 with 7% interest subsidy and cashback incentives for urban and peri-urban street vendors.',
        fullDescription:
          'PM SVANidhi is a special micro-credit facility for street vendors launched by the Ministry of Housing and Urban Affairs. Vendors can access an initial collateral-free working capital loan of ₹10,000 with interest subsidy of 7% per annum on timely repayment, followed by enhanced tranches of ₹20,000 and ₹50,000 upon successful repayment.',
        objectives: [
          'Facilitate access to affordable working capital loans for street vendors',
          'Incentivize digital transactions through monthly cashback rewards',
          'Enable formal credit history and graduation into higher loan brackets',
        ],
        benefits: [
          {
            title: 'Collateral-Free Loan Tranches',
            description: '1st tranche of ₹10,000, 2nd tranche of ₹20,000, and 3rd tranche of up to ₹50,000.',
            amount: '₹10,000 to ₹50,000',
          },
          {
            title: 'Interest Subsidy & Digital Cashback',
            description: '7% interest subsidy credited directly to account + up to ₹1,200 annual digital cashback.',
            amount: '7% interest subvention',
          },
        ],
        category: 'Finance & Loans',
        schemeLevel: 'Central',
        applicableStates: ['All India'],
        ministry: 'Ministry of Housing and Urban Affairs',
        departmentId: deptMap['department-of-housing-and-urban-affairs'],
        targetBeneficiaries: ['Street Vendors', 'Hawkers', 'Thela Walas', 'Peri-urban Vendors'],
        eligibilitySummary: 'Street vendors in possession of Certificate of Vending / Identity Card issued by Urban Local Bodies (ULBs) or identified in vending survey.',
        requiredDocuments: [
          { name: 'Aadhaar Card', mandatory: true, notes: 'Linked to mobile number' },
          { name: 'Certificate of Vending / LOR', mandatory: true, notes: 'Letter of Recommendation from ULB' },
          { name: 'Bank Account Passbook', mandatory: true, notes: 'Active savings account' },
        ],
        applicationProcedure: [
          'Visit pmsvanidhi.mohua.gov.in or contact the municipal corporation vending cell.',
          'Verify your mobile number via OTP.',
          'Select your vendor category and check for existing ULB survey record.',
          'Select preferred lending institution (Lender Bank) and submit application.',
        ],
        officialWebsite: 'https://pmsvanidhi.mohua.gov.in',
        officialApplicationUrl: 'https://pmsvanidhi.mohua.gov.in/Home/VendorLanding',
        officialStatusUrl: 'https://pmsvanidhi.mohua.gov.in/Home/TrackStatus',
        sourceUrls: [
          { title: 'PM SVANidhi Official Portal', url: 'https://pmsvanidhi.mohua.gov.in', verified: true },
        ],
        verificationStatus: 'VERIFIED',
        lastVerifiedAt: new Date('2026-08-01'),
        isActive: true,
      },
      {
        schemeName: 'Pradhan Mantri Mudra Yojana (PMMY)',
        slug: 'pradhan-mantri-mudra-yojana',
        shortDescription: 'Collateral-free business loans up to ₹10 lakh across Shishu, Kishore, and Tarun categories for non-corporate, non-farm small/micro enterprises.',
        fullDescription:
          'Pradhan Mantri Mudra Yojana (PMMY) is a flagship scheme of Government of India to extend affordable credit to micro and small enterprises. Under PMMY, loans are categorized into three stages: Shishu (loans up to ₹50,000), Kishore (loans from ₹50,001 to ₹5,00,000), and Tarun (loans from ₹5,00,001 to ₹10,00,000). Loans are provided by Commercial Banks, RRBs, Small Finance Banks, MFIs, and NBFCs with zero collateral.',
        objectives: [
          'Fund the unfunded small entrepreneurs and shopkeepers',
          'Promote self-employment and micro-enterprise growth in rural and urban areas',
          'Reduce dependence on unorganized predatory moneylenders',
        ],
        benefits: [
          {
            title: 'Collateral-Free Business Credit',
            description: 'Credit facility up to ₹10,00,000 across Shishu, Kishore, and Tarun buckets.',
            amount: 'Up to ₹10,00,000',
          },
        ],
        category: 'Finance & Loans',
        schemeLevel: 'Central',
        applicableStates: ['All India'],
        ministry: 'Ministry of Finance',
        departmentId: deptMap['department-of-financial-services'],
        targetBeneficiaries: ['Small Shopkeepers', 'Artisans', 'Micro Manufacturers', 'Entrepreneurs', 'Self-Employed'],
        eligibilitySummary: 'Any Indian citizen who has a business plan for a non-farm sector income generating activity such as manufacturing, processing, trading or service sector.',
        requiredDocuments: [
          { name: 'Identity Proof (Aadhaar / Voter ID / PAN)', mandatory: true, notes: 'KYC documents' },
          { name: 'Proof of Residence', mandatory: true, notes: 'Electricity bill / Ration card' },
          { name: 'Business Enterprise Proof / Udyam Registration', mandatory: true, notes: 'Shop establishment or registration' },
          { name: 'Statement of Accounts for last 6 months', mandatory: false, notes: 'For Kishore and Tarun loans' },
        ],
        applicationProcedure: [
          'Apply directly online through the Udyami Mitra portal (udyamimitra.in) or visit any nationalized bank.',
          'Fill in personal and proposed business enterprise details.',
          'Upload required quotation / project cost report and business registration.',
          'Bank evaluates the proposal and sanctions loan under MUDRA scheme.',
        ],
        officialWebsite: 'https://www.mudra.org.in',
        officialApplicationUrl: 'https://www.udyamimitra.in',
        officialStatusUrl: 'https://www.udyamimitra.in/Login/TrackApplication',
        sourceUrls: [
          { title: 'MUDRA Official Portal', url: 'https://www.mudra.org.in', verified: true },
          { title: 'Department of Financial Services PMMY', url: 'https://financialservices.gov.in', verified: true },
        ],
        verificationStatus: 'VERIFIED',
        lastVerifiedAt: new Date('2026-06-15'),
        isActive: true,
      },
      {
        schemeName: 'Post-Matric Scholarship Scheme for SC / OBC Students',
        slug: 'post-matric-scholarship-scheme',
        shortDescription: 'Financial assistance covering full tuition fees and maintenance allowance for SC/OBC students pursuing post-matriculation or post-secondary education.',
        fullDescription:
          'The Post-Matric Scholarship Scheme is a centrally sponsored initiative aimed at providing substantial financial support to students belonging to Scheduled Castes and Other Backward Classes studying at post-matriculation or post-secondary stages. It covers non-refundable compulsory fees, study tour charges, thesis typing charges, and monthly maintenance allowance.',
        objectives: [
          'Enable economically weaker SC and OBC students to complete higher education',
          'Arrest drop-out rates between secondary school and undergraduate/professional degrees',
          'Promote educational empowerment through direct benefit transfer of allowances',
        ],
        benefits: [
          {
            title: 'Tuition Fee Reimbursement',
            description: '100% reimbursement of non-refundable tuition and examination fees charged by recognized colleges/universities.',
            amount: 'Full Course Fees',
          },
          {
            title: 'Monthly Maintenance Allowance',
            description: 'Up to ₹13,500 per academic year for hostellers and ₹7,000 for day scholars.',
            amount: '₹7,000 - ₹13,500 / year',
          },
        ],
        category: 'Education',
        schemeLevel: 'Central',
        applicableStates: ['All India'],
        ministry: 'Ministry of Social Justice and Empowerment',
        departmentId: deptMap['department-of-social-justice-and-empowerment'],
        targetBeneficiaries: ['SC Students', 'OBC Students', 'College Students'],
        eligibilitySummary: 'Candidate must belong to SC or OBC community, studying in Class 11 and above. Annual family income must not exceed ₹2,50,000 per annum.',
        requiredDocuments: [
          { name: 'Caste Certificate issued by Competent Authority', mandatory: true, notes: 'Valid digital certificate' },
          { name: 'Income Certificate', mandatory: true, notes: 'Family income <= ₹2.5 Lakhs' },
          { name: 'Previous Year Marksheet', mandatory: true, notes: 'Passed qualifying examination' },
          { name: 'Current Fee Receipt & Bonafide Certificate', mandatory: true, notes: 'Issued by college/institute' },
        ],
        applicationProcedure: [
          'Register on the National Scholarship Portal (scholarships.gov.in).',
          'Complete OTR (One Time Registration) using Aadhaar and mobile verification.',
          'Select Post-Matric Scholarship under Ministry of Social Justice.',
          'Fill in academic course details and upload caste and income certificates.',
          'Submit form for institutional and state nodal officer verification.',
        ],
        officialWebsite: 'https://scholarships.gov.in',
        officialApplicationUrl: 'https://scholarships.gov.in/fresh/newstdRegfrmInstruction',
        officialStatusUrl: 'https://scholarships.gov.in/loginPage',
        sourceUrls: [
          { title: 'National Scholarship Portal', url: 'https://scholarships.gov.in', verified: true },
        ],
        verificationStatus: 'VERIFIED',
        lastVerifiedAt: new Date('2026-08-10'),
        isActive: true,
      },
      {
        schemeName: 'Sukanya Samriddhi Yojana (SSY)',
        slug: 'sukanya-samriddhi-yojana',
        shortDescription: 'High-interest government-backed small savings scheme for girl child with 8.2% annual interest and Section 80C tax exemption benefits.',
        fullDescription:
          'Sukanya Samriddhi Account is a Government of India-backed savings scheme targeted at the parents of girl children. The scheme encourages parents to build a fund for the future education and marriage expenses of their female child. Accounts can be opened anytime between birth and the child turning 10 years of age, offering superior returns and complete triple tax exemption (EEE).',
        objectives: [
          'Secure financial future of the girl child for higher education and marriage',
          'Promote social mindset change under Beti Bachao Beti Padhao campaign',
          'Provide guaranteed high-interest savings mechanism backed by sovereign guarantee',
        ],
        benefits: [
          {
            title: 'High Guaranteed Interest',
            description: 'Compounded annual interest rate (currently 8.2% p.a.) backed by Govt of India.',
            amount: '8.2% interest p.a.',
          },
          {
            title: 'Tax Benefit under Section 80C',
            description: 'Tax exemption on deposits up to ₹1.5 lakh, interest earned, and maturity proceeds (EEE).',
            amount: 'Up to ₹1.5 Lakh deduction',
          },
        ],
        category: 'Social Welfare',
        schemeLevel: 'Central',
        applicableStates: ['All India'],
        ministry: 'Ministry of Women and Child Development',
        departmentId: deptMap['ministry-of-women-and-child-development'],
        targetBeneficiaries: ['Girl Child', 'Parents of Girl Child'],
        eligibilitySummary: 'Account can be opened by parents/legal guardians in the name of a girl child from her birth till she attains 10 years of age. Maximum two accounts per family.',
        requiredDocuments: [
          { name: 'Birth Certificate of the Girl Child', mandatory: true, notes: 'Issued by municipal authority' },
          { name: 'Identity Proof of Guardian (Aadhaar / PAN)', mandatory: true, notes: 'KYC of parent/guardian' },
          { name: 'Proof of Address of Guardian', mandatory: true, notes: 'Utility bill / Passport' },
        ],
        applicationProcedure: [
          'Visit any authorized Post Office branch or designated commercial bank branch.',
          'Submit filled Sukanya Samriddhi Account Opening Form (Form-1).',
          'Attach child birth certificate and guardian KYC documents.',
          'Deposit minimum initial amount (minimum ₹250).',
          'Receive physical SSY passbook with unique account number.',
        ],
        officialWebsite: 'https://www.indiapost.gov.in/Financial/Pages/Content/Sukanya-Samriddhi-Account.aspx',
        officialApplicationUrl: 'https://www.indiapost.gov.in',
        officialStatusUrl: 'https://ebanking.indiapost.gov.in',
        sourceUrls: [
          { title: 'India Post Savings Bank SSY', url: 'https://www.indiapost.gov.in', verified: true },
        ],
        verificationStatus: 'VERIFIED',
        lastVerifiedAt: new Date('2026-09-01'),
        isActive: true,
      },
      {
        schemeName: 'PM Vishwakarma Scheme',
        slug: 'pm-vishwakarma-scheme',
        shortDescription: 'Holistic support for traditional artisans and craftspeople including recognition, skill training, ₹15,000 toolkit incentive, and collateral-free loans at 5%.',
        fullDescription:
          'PM Vishwakarma is a Central Sector scheme to provide end-to-end support to artisans and craftspeople who work with their hands and tools. Covered trades include carpenters, blacksmiths, goldsmiths, potters, sculptors, cobblers, tailors, and weavers. Benefits include PM Vishwakarma Certificate & ID card, basic/advanced training with ₹500/day stipend, ₹15,000 toolkit grant, and enterprise credit up to ₹3 lakh at concessional 5% interest.',
        objectives: [
          'Enable traditional craftspersons to scale operations and modernize tooling',
          'Integrate traditional artisans into domestic and global supply chains',
          'Provide subsidized enterprise credit without requiring mortgage collateral',
        ],
        benefits: [
          {
            title: 'Toolkit Grant',
            description: 'Financial incentive of ₹15,000 provided via e-voucher for modern tools.',
            amount: '₹15,000 toolkit grant',
          },
          {
            title: 'Concessional Enterprise Loans',
            description: 'Up to ₹3,00,000 in two tranches (₹1 Lakh + ₹2 Lakh) at 5% interest rate.',
            amount: 'Up to ₹3,00,000 loan',
          },
        ],
        category: 'Skill & Livelihood',
        schemeLevel: 'Central',
        applicableStates: ['All India'],
        ministry: 'Ministry of Micro, Small and Medium Enterprises',
        departmentId: deptMap['ministry-of-msme'],
        targetBeneficiaries: ['Traditional Artisans', 'Craftspeople', 'Carpenters', 'Masons', 'Barbers', 'Tailors'],
        eligibilitySummary: 'Artisan or craftsperson working in one of the 18 recognized traditional trades, minimum age 18 years, engaged in self-employment, family not in government service.',
        requiredDocuments: [
          { name: 'Aadhaar Card', mandatory: true, notes: 'Biometric verification required' },
          { name: 'Active Bank Passbook', mandatory: true, notes: 'Aadhaar seeded bank account' },
          { name: 'Ration Card', mandatory: true, notes: 'To verify family unit' },
        ],
        applicationProcedure: [
          'Visit nearest CSC center or apply via pmvishwakarma.gov.in.',
          'Complete Aadhaar biometric authentication.',
          'Select your traditional trade from the list of 18 trades.',
          'Application undergoes 3-stage verification (Gram Panchayat / ULB, District Committee, Screening Committee).',
        ],
        officialWebsite: 'https://pmvishwakarma.gov.in',
        officialApplicationUrl: 'https://pmvishwakarma.gov.in/Home/Registration',
        officialStatusUrl: 'https://pmvishwakarma.gov.in/Home/TrackStatus',
        sourceUrls: [
          { title: 'PM Vishwakarma Official Portal', url: 'https://pmvishwakarma.gov.in', verified: true },
        ],
        verificationStatus: 'VERIFIED',
        lastVerifiedAt: new Date('2026-09-20'),
        isActive: true,
      },
    ];

    const insertedSchemes = await Scheme.insertMany(schemesData);
    console.log(`[Seed] Created ${insertedSchemes.length} authentic schemes`);

    const schemeMap = {};
    insertedSchemes.forEach((s) => {
      schemeMap[s.slug] = s._id;
    });

    // 4. Create Eligibility Rules for schemes
    // Supported operators: ==, !=, >, >=, <, <=, IN, NOT_IN, BETWEEN, EXISTS
    const rulesData = [
      // PM-KISAN Rules
      {
        schemeId: schemeMap['pm-kisan-samman-nidhi'],
        ruleName: 'Farmer Occupation Check',
        field: 'occupation',
        operator: '==',
        expectedValue: 'Farmer',
        description: 'Beneficiary must be a landholding agricultural cultivator',
        isMandatory: true,
        isActive: true,
      },
      {
        schemeId: schemeMap['pm-kisan-samman-nidhi'],
        ruleName: 'Minimum Age Requirement',
        field: 'age',
        operator: '>=',
        expectedValue: 18,
        description: 'Applicant must be an adult aged 18 years or above',
        isMandatory: true,
        isActive: true,
      },

      // Ayushman Bharat Rules
      {
        schemeId: schemeMap['ayushman-bharat-pm-jay'],
        ruleName: 'Income Ceiling for Healthcare Cover',
        field: 'annualFamilyIncome',
        operator: '<=',
        expectedValue: 300000,
        description: 'Annual family income must be ₹3,00,000 or lower to qualify for full government health cover',
        isMandatory: true,
        isActive: true,
      },
      {
        schemeId: schemeMap['ayushman-bharat-pm-jay'],
        ruleName: 'State Jurisdiction',
        field: 'state',
        operator: 'IN',
        expectedValue: ['All India'],
        description: 'Applicable in all participating states and Union Territories',
        isMandatory: false,
        isActive: true,
      },

      // PMAY-U Rules
      {
        schemeId: schemeMap['pradhan-mantri-awas-yojana-urban'],
        ruleName: 'Annual Income Ceiling (EWS/LIG)',
        field: 'annualFamilyIncome',
        operator: '<=',
        expectedValue: 600000,
        description: 'Annual household income must be within EWS/LIG limits (up to ₹6 Lakhs)',
        isMandatory: true,
        isActive: true,
      },
      {
        schemeId: schemeMap['pradhan-mantri-awas-yojana-urban'],
        ruleName: 'Age Requirement',
        field: 'age',
        operator: '>=',
        expectedValue: 21,
        description: 'Primary applicant must be at least 21 years of age',
        isMandatory: true,
        isActive: true,
      },

      // Post-Matric Scholarship Rules
      {
        schemeId: schemeMap['post-matric-scholarship-scheme'],
        ruleName: 'Community Eligibility',
        field: 'community',
        operator: 'IN',
        expectedValue: ['SC', 'OBC', 'ST'],
        description: 'Candidate must belong to Scheduled Caste, Scheduled Tribe, or Other Backward Class',
        isMandatory: true,
        isActive: true,
      },
      {
        schemeId: schemeMap['post-matric-scholarship-scheme'],
        ruleName: 'Income Limit for Scholarship',
        field: 'annualFamilyIncome',
        operator: '<=',
        expectedValue: 250000,
        description: 'Annual family income from all sources must not exceed ₹2,50,000',
        isMandatory: true,
        isActive: true,
      },
      {
        schemeId: schemeMap['post-matric-scholarship-scheme'],
        ruleName: 'Student Status Check',
        field: 'employmentStatus',
        operator: 'IN',
        expectedValue: ['Student', 'Unemployed'],
        description: 'Applicant must be enrolled as a student or not employed in full-time government/corporate job',
        isMandatory: false,
        isActive: true,
      },

      // PM Vishwakarma Rules
      {
        schemeId: schemeMap['pm-vishwakarma-scheme'],
        ruleName: 'Eligible Artisan Age Range',
        field: 'age',
        operator: 'BETWEEN',
        expectedValue: [18, 75],
        description: 'Artisan must be between 18 and 75 years of age',
        isMandatory: true,
        isActive: true,
      },
      {
        schemeId: schemeMap['pm-vishwakarma-scheme'],
        ruleName: 'Artisan / Self-Employed Status',
        field: 'employmentStatus',
        operator: 'IN',
        expectedValue: ['Self-Employed', 'Daily Wage Worker', 'Farmer'],
        description: 'Must be actively working as an independent artisan or self-employed worker',
        isMandatory: true,
        isActive: true,
      },
    ];

    await EligibilityRule.insertMany(rulesData);
    console.log(`[Seed] Created ${rulesData.length} eligibility rules`);

    // 5. Create Sample Bookmark with Reminder for Citizen
    const sampleDate = new Date();
    sampleDate.setDate(sampleDate.getDate() + 5);

    await Bookmark.create({
      userId: citizenUser._id,
      schemeId: schemeMap['pm-kisan-samman-nidhi'],
      reminder: {
        enabled: true,
        reminderDate: sampleDate,
        timezone: 'Asia/Kolkata',
        message: 'Check e-KYC status before next 17th installment disbursement',
        status: 'UPCOMING',
      },
    });

    await Bookmark.create({
      userId: citizenUser._id,
      schemeId: schemeMap['ayushman-bharat-pm-jay'],
      reminder: {
        enabled: false,
        status: 'UPCOMING',
      },
    });

    // 6. Create Initial Notifications
    await Notification.create({
      userId: citizenUser._id,
      title: 'Welcome to Scheme Eligibility Engine',
      message: 'Your profile has been initialized. Complete your profile fields to check your accurate eligibility across all central and state schemes.',
      notificationType: 'SYSTEM',
      isRead: false,
    });

    await Notification.create({
      userId: citizenUser._id,
      title: 'PM-KISAN e-KYC Verification',
      message: 'Ensure your Aadhaar is linked to your bank account for uninterrupted PM-KISAN benefits.',
      notificationType: 'SCHEME_UPDATE',
      relatedSchemeId: schemeMap['pm-kisan-samman-nidhi'],
      isRead: false,
    });

    // 7. Create Sample Feedback
    await Feedback.create({
      userId: citizenUser._id,
      schemeId: schemeMap['pm-kisan-samman-nidhi'],
      feedbackType: 'GENERAL',
      subject: 'Inquiry regarding 7/12 land extract upload',
      message: 'Can I upload the digital digitally signed 7/12 extract from Mahabhumi portal for PM-KISAN registration?',
      status: 'RESOLVED',
      adminResponse: 'Yes, digitally signed 7/12 extracts obtained from Mahabhumi portal with QR code verification are accepted across all CSC centers.',
    });

    // 8. Create System Notifications
    await SystemNotification.create({
      eventType: 'SYSTEM_STARTUP',
      title: 'Portal Database Initialized',
      description: 'Government Scheme Eligibility Engine successfully seeded with verified department and scheme datasets.',
    });

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
