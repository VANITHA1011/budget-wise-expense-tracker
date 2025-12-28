
import { Link } from 'react-router-dom';
import { 
  Wallet, TrendingUp, DollarSign, ArrowRight, 
  Target, Shield, BarChart3, Sparkles, PieChart, Zap 
} from 'lucide-react';

import heroVisualImage from '../img/ai.jpg';

const Home = () => {
  const FeatureCard = ({ icon: Icon, title, description, color }) => {
    const colorMap = {
      blue: { iconBg: 'bg-indigo-600', border: 'border-indigo-200' },
      green: { iconBg: 'bg-teal-600', border: 'border-teal-200' },
      purple: { iconBg: 'bg-purple-600', border: 'border-purple-200' },
      orange: { iconBg: 'bg-orange-600', border: 'border-orange-200' },
      pink: { iconBg: 'bg-pink-600', border: 'border-pink-200' },
      indigo: { iconBg: 'bg-gray-700', border: 'border-gray-300' },
    };
    const colors = colorMap[color] || colorMap.green;

    return (
      <div className={`bg-white p-8 rounded-xl shadow-md transition-all border ${colors.border} hover:shadow-xl`}>
        <div className={`${colors.iconBg} w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-md`}>
          <Icon className="text-white" size={28} />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-50">

      {/* HEADER */}
      <header className="w-full bg-gray-900 text-white p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-xl font-bold text-teal-400">Budget AI Driven Expense Tracker</div>
          <div className="flex space-x-4">
            <Link to="/login" className="text-gray-300 hover:text-white transition">Sign In</Link>
            <Link to="/signup" className="bg-teal-500 px-3 py-1 rounded hover:bg-teal-600 transition font-semibold">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="px-4 py-20 md:py-32 text-white border-b-8 border-teal-500 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-stretch min-h-[550px]">

            {/* LEFT CONTENT */}
            <div className="text-center lg:text-left space-y-6 z-10 flex flex-col justify-center">
              
              {/* Badge (emerald) */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 rounded-full text-white font-medium shadow-lg max-w-max">
                <Zap size={20} />
                <span>AI-Powered Financial Intelligence</span>
              </div>

              {/* Title — two lines with different colors for contrast */}
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
                <span className="block text-teal-400">Budget AI Driven</span>
                <span className="block text-white">Expense Tracker & Advisor</span>
              </h1>

              {/* Short attractive quote / subtitle (subtle accent color) */}
              <p className="text-xl text-teal-200 leading-relaxed max-w-lg lg:mx-0 mx-auto">
                Smart budgets. Brighter tomorrows.
              </p>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link 
                  to="/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-bold text-lg transition-all shadow-xl"
                >
                  Start Tracking Today
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>

            {/* RIGHT IMAGE — FULL COLUMN COVER */}
            <div className="relative flex justify-center lg:justify-end z-10 lg:w-full">
              <div className="w-full h-full min-h-[550px] relative overflow-hidden rounded-xl shadow-2xl border-2 border-teal-500/50">
                <img 
                  src={heroVisualImage} 
                  alt="AI-driven finance dashboard visualization" 
                  className="w-full h-full object-cover absolute inset-0"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-4 py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900">Core Features</h2>
            <p className="text-xl text-gray-600 mt-2">
              AI-Powered tools to manage your money with minimal effort.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={DollarSign} title="Expense Tracking" description="Record, categorize, and verify all your spending with smart input suggestions." color="blue" />
            <FeatureCard icon={TrendingUp} title="Budget Advisory" description="Receive personalized recommendations and warnings to keep spending on track." color="green" />
            <FeatureCard icon={Target} title="Savings Goals" description="Set and monitor custom savings goals with automatic allocation tracking." color="purple" />
            <FeatureCard icon={PieChart} title="Visual Analytics" description="Instantly view your financial health via intuitive charts and spending breakdowns." color="orange" />
            <FeatureCard icon={BarChart3} title="Smart Reports" description="Generate detailed, customizable reports for tax or personal review." color="pink" />
            <FeatureCard icon={Shield} title="Data Security" description="Your financial data is encrypted and secured using industry-standard protocols." color="indigo" />
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
