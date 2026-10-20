import React from 'react';
import { Link } from 'react-router-dom';
import { Landmark, Shield, ExternalLink, Mail, Phone, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gov-secondary flex items-center justify-center text-white">
                <Landmark className="w-5 h-5 text-amber-300" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                Government Scheme Eligibility Engine
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed max-w-sm">
              An intelligent, transparent public-service platform enabling citizens across India to discover central and state government schemes, check personalized eligibility, and track application deadlines.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Official Government Scheme Database & Rule Engine</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Explore Portal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/schemes" className="hover:text-white transition-colors">
                  All Schemes Directory
                </Link>
              </li>
              <li>
                <Link to="/departments" className="hover:text-white transition-colors">
                  Department Directory
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="hover:text-white transition-colors">
                  Eligibility Checker
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-white transition-colors">
                  Scheme Discovery
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-white transition-colors">
                  Scheme Assistant (Preview)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Departments */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Key Sectors
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/schemes?category=Agriculture" className="hover:text-white transition-colors">
                  Agriculture & Farmers
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=Healthcare" className="hover:text-white transition-colors">
                  Healthcare & Medical
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=Housing" className="hover:text-white transition-colors">
                  Housing & Urban Affairs
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=Finance %26 Loans" className="hover:text-white transition-colors">
                  Finance & MSME Loans
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=Education" className="hover:text-white transition-colors">
                  Education & Scholarships
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Citizen Support */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Support & Help
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-gov-secondary" />
                <span>support@schemegov.in</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>1800-11-0000 (Toll Free)</span>
              </li>
              <li className="pt-2">
                <Link
                  to="/dashboard/feedback"
                  className="inline-flex items-center text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  Submit Citizen Feedback &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 text-xs text-slate-400 leading-relaxed mb-8">
          <strong className="text-slate-300">Disclaimer: </strong>
          Information provided on this portal is compiled from verified central and state ministries for citizen discovery. Eligibility evaluations performed by the engine are preliminary advisory assessments. Final verification, sanction, and subsidy disbursal remain under the sole jurisdiction of the respective administering government authorities.
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-800 pt-6">
          <p>&copy; {new Date().getFullYear()} Government Scheme Eligibility Engine. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span>Inter Typography</span>
            <span>Digital India Initiative</span>
            <span>RESTful Microservices</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
