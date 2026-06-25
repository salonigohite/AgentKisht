import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { 
  Zap, Users, Receipt, BarChart3, 
  TrendingUp, CheckCircle2, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-primary tracking-tighter">AgentKisht</h1>
            <p className="text-muted-foreground text-lg">Manage your daily collections with ease.</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-secondary space-y-6">
            <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto text-primary">
              <Zap size={40} fill="currentColor" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-sm text-muted-foreground">Sign in with your Google account to access your dashboard.</p>
            </div>
            <Button 
              onClick={signInWithGoogle} 
              className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20"
            >
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-primary tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.user_metadata?.full_name || 'Agent'}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/quick-collect">
              <Button className="rounded-xl font-bold shadow-lg shadow-primary/20">
                <Zap size={18} className="mr-2" />
                Quick Collect
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-secondary flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Today's Total</p>
              <p className="text-2xl font-black text-primary">₹0.00</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-secondary flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Collected</p>
              <p className="text-2xl font-black text-green-600">0</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-secondary flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Pending</p>
              <p className="text-2xl font-black text-orange-600">0</p>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/quick-collect" className="group">
            <div className="bg-primary text-white p-8 rounded-3xl shadow-xl shadow-primary/20 transition-transform group-hover:-translate-y-1 h-full flex flex-col justify-between">
              <Zap size={32} fill="white" />
              <div className="mt-8">
                <h3 className="text-xl font-bold">Quick Collect</h3>
                <p className="text-primary-foreground/80 text-sm">One-tap daily collection</p>
              </div>
            </div>
          </Link>
          <Link to="/customers" className="group">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-secondary transition-transform group-hover:-translate-y-1 h-full flex flex-col justify-between">
              <Users size={32} className="text-primary" />
              <div className="mt-8">
                <h3 className="text-xl font-bold text-primary">Customers</h3>
                <p className="text-muted-foreground text-sm">Manage your client list</p>
              </div>
            </div>
          </Link>
          <Link to="/transactions" className="group">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-secondary transition-transform group-hover:-translate-y-1 h-full flex flex-col justify-between">
              <Receipt size={32} className="text-primary" />
              <div className="mt-8">
                <h3 className="text-xl font-bold text-primary">Transactions</h3>
                <p className="text-muted-foreground text-sm">View payment history</p>
              </div>
            </div>
          </Link>
          <Link to="/reports" className="group">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-secondary transition-transform group-hover:-translate-y-1 h-full flex flex-col justify-between">
              <BarChart3 size={32} className="text-primary" />
              <div className="mt-8">
                <h3 className="text-xl font-bold text-primary">Reports</h3>
                <p className="text-muted-foreground text-sm">Monthly performance</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Transactions Placeholder */}
        <div className="bg-white rounded-3xl shadow-sm border border-secondary overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-xl font-bold text-primary">Recent Transactions</h3>
            <Link to="/transactions" className="text-sm font-bold text-primary hover:underline">View All</Link>
          </div>
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-primary/40">
              <Receipt size={32} />
            </div>
            <p className="text-muted-foreground">No transactions recorded today yet.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
