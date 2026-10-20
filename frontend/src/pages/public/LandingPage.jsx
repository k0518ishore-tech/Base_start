import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
  Users,
  Layers,
  HelpCircle,
  FileCheck2,
  BellRing,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import SchemeCard from '../../components/cards/SchemeCard';
import DepartmentCard from '../../components/cards/DepartmentCard';
import api from '../../services/api';

const CATEGORIES = [
  { name: 'Agriculture', icon: '🌾', count: 'Direct Farmer Support', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { name: 'Healthcare', icon: '🏥', count: 'Cashless Medical Cover', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { name: 'Housing', icon: '🏠', count: 'Pucca Housing Subsidy', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { name: 'Finance & Loans', icon: '💳', count: 'MUDRA & Micro-Credit', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { name: 'Education', icon: '🎓', count: 'Scholarships & Stipends', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { name: 'Social Welfare', icon: '🤝', count: 'Pensions & Women Welfare', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { name: 'Skill & Livelihood', icon: '🛠️', count: 'Artisans & PM Vishwakarma', color: 'bg-teal-50 text-teal-800 border-teal-200' },
];

const FAQS = [
  {
    q: 'How does the Government Scheme Eligibility Engine evaluate my eligibility?',
    a: 'The engine compares your demographic, economic, and occupational profile against verified eligibility rules established by respective government ministries using boolean and threshold logic (income limits, age thresholds, occupational classifications, and regional criteria).',
  },
  {
    q: 'Is my personal information submitted directly to government portals?',
    a: 'No. The engine conducts advisory preliminary evaluations in this portal. To actually avail scheme benefits, we direct you with verified links to the official portal (such as PM-KISAN, NHA Ayushman Bharat, or NSP) where your formal application is securely submitted to the government.',
  },
  {
    q: 'What should I do if my eligibility result displays "INCOMPLETE"?',
    a: 'An "INCOMPLETE" status indicates that one or more required data points (such as family income, occupation, or community category) have not been filled in your profile. Once you complete those fields, the engine instantly re-evaluates and displays your status.',
  },
  {
    q: 'How do date-based scheme reminders work?',
    a: 'When you bookmark any government scheme, you can set a reminder date and custom note. Our backend scheduled cron job monitors upcoming dates and triggers in-portal notifications so you never miss an application deadline or e-KYC requirement.',
  },
];

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({ schemes: 8, departments: 8, rules: 11 });
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch featured schemes
    api
      .get('/schemes?limit=6')
      .then((res) => {
        if (res.data.success) {
          setFeaturedSchemes(res.data.data);
          setStats((prev) => ({ ...prev, schemes: res.data.pagination.total }));
        }
      })
      .catch(() => {});

    // Fetch departments preview
    api
      .get('/departments')
      .then((res) => {
        if (res.data.success) {
          setDepartments(res.data.data.slice(0, 4));
          setStats((prev) => ({ ...prev, departments: res.data.count }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/schemes');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-linear-to-b from-blue-50/60 via-slate-50 to-gov-bg border-b border-gov-border pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-gov-primary text-xs font-semibold mb-6">
              <ShieldCheck className="w-4 h-4 text-gov-secondary" />
              <span>National Scheme Eligibility & Discovery Engine</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gov-primary tracking-tight leading-tight mb-6">
              Discover Government Schemes You Are{' '}
              <span className="text-gov-secondary underline decoration-blue-300 underline-offset-4">
                Actually Eligible
              </span>{' '}
              For
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gov-muted leading-relaxed mb-8 max-w-2xl mx-auto">
              Transparent, rule-based scheme assessment for Indian citizens. Explore verified welfare initiatives across departments, evaluate criteria instantly, and receive deadline reminders.
            </p>

            {/* Live Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative max-w-2xl mx-auto flex items-center shadow-card rounded-2xl bg-white border border-gov-border p-2 mb-8 focus-within:ring-2 focus-within:ring-gov-secondary transition-all"
            >
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by scheme name, keyword, or beneficiary (e.g. Kisan, Housing, Ayushman, Student)..."
                className="w-full px-3 py-2 text-sm text-gov-text placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              <Button type="submit" variant="primary" size="md" className="shrink-0 rounded-xl px-5">
                Search
              </Button>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/eligibility">
                <Button variant="primary" size="lg" className="shadow-md gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-300" />
                  <span>Check Your Eligibility</span>
                </Button>
              </Link>
              <Link to="/schemes">
                <Button variant="outline" size="lg">
                  Browse All Schemes
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gov-border shadow-subtle text-center">
              <div className="text-2xl font-extrabold text-gov-primary">{stats.schemes}+</div>
              <div className="text-xs text-gov-muted font-medium mt-0.5">Verified Schemes</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gov-border shadow-subtle text-center">
              <div className="text-2xl font-extrabold text-gov-secondary">{stats.departments}</div>
              <div className="text-xs text-gov-muted font-medium mt-0.5">Ministries & Depts</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gov-border shadow-subtle text-center">
              <div className="text-2xl font-extrabold text-emerald-700">100%</div>
              <div className="text-xs text-gov-muted font-medium mt-0.5">Official Sources</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gov-border shadow-subtle text-center">
              <div className="text-2xl font-extrabold text-amber-600">Rule-Based</div>
              <div className="text-xs text-gov-muted font-medium mt-0.5">Evaluation Engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gov-primary tracking-tight">
              Explore Schemes by Category
            </h2>
            <p className="text-sm text-gov-muted mt-1">
              Find schemes tailored to your specific trade, education, and livelihood requirements.
            </p>
          </div>
          <Link
            to="/schemes"
            className="text-sm font-semibold text-gov-secondary hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/schemes?category=${encodeURIComponent(cat.name)}`}
              className="group block"
            >
              <div className="p-4 rounded-xl border border-gov-border bg-white hover:border-gov-secondary hover:shadow-card transition-all duration-200">
                <div className="text-3xl mb-3">{cat.icon}</div>
                <h3 className="font-bold text-sm text-gov-primary group-hover:text-gov-secondary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gov-muted mt-1">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white border-y border-gov-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gov-primary tracking-tight">
              How the Scheme Engine Works
            </h2>
            <p className="text-sm text-gov-muted mt-2">
              Three streamlined steps to discover benefits, check exact eligibility, and apply safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative bg-slate-50/80 rounded-2xl p-6 border border-gov-border">
              <div className="w-10 h-10 rounded-xl bg-gov-primary text-white flex items-center justify-center font-bold text-base mb-4 shadow-sm">
                1
              </div>
              <h3 className="text-base font-bold text-gov-primary mb-2">
                1. Browse Schemes or Departments
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter by ministry, state, beneficiary group, or financial benefits. Access verified overviews and requirements without cluttered advertisements.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-slate-50/80 rounded-2xl p-6 border border-gov-border">
              <div className="w-10 h-10 rounded-xl bg-gov-secondary text-white flex items-center justify-center font-bold text-base mb-4 shadow-sm">
                2
              </div>
              <h3 className="text-base font-bold text-gov-primary mb-2">
                2. Automated Rule Evaluation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Input your profile demographics or test against specific scheme criteria. The rule engine checks income ceilings, age brackets, and eligibility conditions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-slate-50/80 rounded-2xl p-6 border border-gov-border">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base mb-4 shadow-sm">
                3
              </div>
              <h3 className="text-base font-bold text-gov-primary mb-2">
                3. Save, Set Reminders & Apply
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive clear breakdowns of passed, failed, and missing conditions. Set personalized reminders for deadlines and jump directly to official portals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Schemes Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-gov-secondary" />
              <span className="text-xs font-bold text-gov-secondary uppercase tracking-wider">
                High Impact Welfare
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gov-primary tracking-tight">
              Featured Government Schemes
            </h2>
          </div>
          <Link
            to="/schemes"
            className="text-sm font-semibold text-gov-secondary hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Schemes ({stats.schemes})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredSchemes.map((scheme) => (
            <SchemeCard key={scheme._id} scheme={scheme} />
          ))}
        </div>
      </section>

      {/* Departments Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gov-primary tracking-tight">
              Explore by Ministry & Department
            </h2>
            <p className="text-sm text-gov-muted mt-1">
              Every scheme belongs to an official government department portfolio.
            </p>
          </div>
          <Link
            to="/departments"
            className="text-sm font-semibold text-gov-secondary hover:text-blue-800 flex items-center gap-1"
          >
            <span>Full Department Directory</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {departments.map((dept) => (
            <DepartmentCard key={dept._id} department={dept} />
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gov-primary tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gov-muted mt-2">
            Answers to common questions about government scheme eligibility and portal verification.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-gov-border bg-white overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-gov-primary hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-90 text-gov-secondary' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-gov-primary to-[#1e4b85] rounded-3xl p-8 sm:p-12 text-white text-center shadow-elevated">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
            Ready to Check Your Scheme Eligibility?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto mb-8 leading-relaxed">
            Create your citizen profile in under 2 minutes and evaluate your eligibility across all central and state welfare initiatives.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="bg-white text-gov-primary hover:bg-blue-50 font-bold">
                Create Free Citizen Account
              </Button>
            </Link>
            <Link to="/eligibility">
              <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10">
                Quick Eligibility Check
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
