import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import Department from '../models/Department.js';
import Scheme from '../models/Scheme.js';
import EligibilityRule from '../models/EligibilityRule.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/government_scheme_db';

export const DEPARTMENTS_DATA = [
  {
    departmentName: 'Department of Agriculture & Farmers Welfare',
    slug: 'department-of-agriculture-and-farmers-welfare',
    description: 'Formulates and implements national policies and programs for agricultural growth, farmers welfare, credit, and food security.',
    ministryName: 'Ministry of Agriculture and Farmers Welfare',
    officialWebsite: 'https://agricoop.gov.in',
  },
  {
    departmentName: 'Department of Health & Family Welfare',
    slug: 'department-of-health-and-family-welfare',
    description: 'Responsible for public health infrastructure, family planning, medical education, and national universal health protection programs.',
    ministryName: 'Ministry of Health and Family Welfare',
    officialWebsite: 'https://mohfw.gov.in',
  },
  {
    departmentName: 'Department of Housing and Urban Affairs',
    slug: 'department-of-housing-and-urban-affairs',
    description: 'Apex authority for formulating policies, sponsoring programs and coordinating urban development and affordable housing schemes.',
    ministryName: 'Ministry of Housing and Urban Affairs',
    officialWebsite: 'https://mohua.gov.in',
  },
  {
    departmentName: 'Department of Financial Services',
    slug: 'department-of-financial-services',
    description: 'Oversees banking services, financial inclusion initiatives, credit facilitation, pension architecture, and micro-enterprise lending.',
    ministryName: 'Ministry of Finance',
    officialWebsite: 'https://financialservices.gov.in',
  },
  {
    departmentName: 'Department of Higher Education',
    slug: 'department-of-higher-education',
    description: 'Supports higher education access, research grants, scholarships, equity initiatives, and institutional development across India.',
    ministryName: 'Ministry of Education',
    officialWebsite: 'https://education.gov.in',
  },
  {
    departmentName: 'Ministry of Women and Child Development',
    slug: 'ministry-of-women-and-child-development',
    description: 'Spearheads women empowerment, gender budget initiatives, child rights, nutrition programs, and protection of vulnerable groups.',
    ministryName: 'Ministry of Women and Child Development',
    officialWebsite: 'https://wcd.nic.in',
  },
  {
    departmentName: 'Ministry of Micro, Small and Medium Enterprises',
    slug: 'ministry-of-msme',
    description: 'Promotes growth and development of micro, small and medium enterprises including artisans, handicrafts, and village industries.',
    ministryName: 'Ministry of Micro, Small and Medium Enterprises',
    officialWebsite: 'https://msme.gov.in',
  },
  {
    departmentName: 'Department of Social Justice and Empowerment',
    slug: 'department-of-social-justice-and-empowerment',
    description: 'Ensures equitable welfare, scholarships, and social protection for SC, OBC, EWS, senior citizens, and persons with disabilities.',
    ministryName: 'Ministry of Social Justice and Empowerment',
    officialWebsite: 'https://socialjustice.gov.in',
  },
  {
    departmentName: 'Ministry of Rural Development',
    slug: 'ministry-of-rural-development',
    description: 'Coordinates national rural development, employment generation, self-help groups, rural housing, and infrastructure.',
    ministryName: 'Ministry of Rural Development',
    officialWebsite: 'https://rural.gov.in',
  },
  {
    departmentName: 'Ministry of Skill Development and Entrepreneurship',
    slug: 'ministry-of-skill-development-and-entrepreneurship',
    description: 'Nodal ministry for coordinating all skill development efforts across India, industrial training, and youth apprenticeship.',
    ministryName: 'Ministry of Skill Development and Entrepreneurship',
    officialWebsite: 'https://msde.gov.in',
  },
  {
    departmentName: 'Ministry of Labour and Employment',
    slug: 'ministry-of-labour-and-employment',
    description: 'Protects workers rights, social security for organized and unorganized laborers, e-Shram portal, and occupational welfare.',
    ministryName: 'Ministry of Labour and Employment',
    officialWebsite: 'https://labour.gov.in',
  },
  {
    departmentName: 'Ministry of New and Renewable Energy',
    slug: 'ministry-of-new-and-renewable-energy',
    description: 'Coordinates national solar, wind, and green energy initiatives, PM Surya Ghar, and solar pump programs.',
    ministryName: 'Ministry of New and Renewable Energy',
    officialWebsite: 'https://mnre.gov.in',
  },
  {
    departmentName: 'Ministry of Jal Shakti',
    slug: 'ministry-of-jal-shakti',
    description: 'Responsible for drinking water mission (Jal Jeevan Mission), sanitation, river conservation, and irrigation.',
    ministryName: 'Ministry of Jal Shakti',
    officialWebsite: 'https://jalshakti-dowr.gov.in',
  },
  {
    departmentName: 'Ministry of Tribal Affairs',
    slug: 'ministry-of-tribal-affairs',
    description: 'Oversees overall socio-economic advancement of Scheduled Tribes, forest rights, and tribal development schemes.',
    ministryName: 'Ministry of Tribal Affairs',
    officialWebsite: 'https://tribal.nic.in',
  },
  {
    departmentName: 'Ministry of Minority Affairs',
    slug: 'ministry-of-minority-affairs',
    description: 'Facilitates targeted scholarships, leadership development, infrastructure, and financial welfare for notified minority communities.',
    ministryName: 'Ministry of Minority Affairs',
    officialWebsite: 'https://minorityaffairs.gov.in',
  },
  {
    departmentName: 'Ministry of Fisheries, Animal Husbandry and Dairying',
    slug: 'ministry-of-fisheries-animal-husbandry-and-dairying',
    description: 'Supports dairy infrastructure, livestock development, blue revolution, and aquaculture enhancement.',
    ministryName: 'Ministry of Fisheries, Animal Husbandry and Dairying',
    officialWebsite: 'https://dahd.nic.in',
  },
  {
    departmentName: 'State Government Social Welfare & Development Department',
    slug: 'state-government-social-welfare-and-development',
    description: 'Nodal state-level administrative departments managing state flagship cash transfers, housing, health, and welfare benefits.',
    ministryName: 'State Government Administration',
    officialWebsite: 'https://myscheme.gov.in',
  },
];
