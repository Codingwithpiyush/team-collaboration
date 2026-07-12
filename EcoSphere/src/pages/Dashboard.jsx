import React from 'react';
import ScoreCard from '../components/ScoreCard';
import EmissionChart from '../components/EmissionChart';
import DepartmentChart from '../components/DepartmentChart';
import RecentActivity from '../components/RecentActivity';
import QuickActions from '../components/QuickActions';
import { Leaf, Users, Briefcase, Activity } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
        <p className="text-sm text-slate-500 mt-1">Monitor your company's ESG performance and sustainability goals.</p>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScoreCard 
          title="Environmental Score" 
          score={82} 
          total={100} 
          subtitle="Top 15% in Industry"
          icon={Leaf}
          theme="green"
        />
        <ScoreCard 
          title="Social Score" 
          score={74} 
          total={100} 
          subtitle="Needs Improvement"
          icon={Users}
          theme="blue"
        />
        <ScoreCard 
          title="Governance Score" 
          score={88} 
          total={100} 
          subtitle="Excellent Compliance"
          icon={Briefcase}
          theme="purple"
        />
        <ScoreCard 
          title="Overall ESG Score" 
          score={81} 
          total={100} 
          subtitle="On track for 2024 target"
          icon={Activity}
          theme="darkblue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmissionChart />
        </div>
        <div className="lg:col-span-1">
          <DepartmentChart />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
