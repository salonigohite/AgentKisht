"use client";

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, CheckCircle2, Search, AlertCircle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { format } from 'date-fns';

interface Customer {
  id: string;
  name: string;
  default_amount: number;
  collected_today?: boolean;
}

const QuickCollect = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      // Fetch customers
      const { data: custData, error: custError } = await supabase
        .from('customers')
        .select('id, name, default_amount')
        .eq('agent_id', user.id)
        .order('name');
      
      if (custError) throw custError;

      // Fetch today's transactions
      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('customer_id')
        .eq('agent_id', user.id)
        .eq('date', today);

      if (transError) throw transError;

      const collectedIds = new Set(transData?.map(t => t.customer_id));
      
      const enrichedCustomers = custData?.map(c => ({
        ...c,
        collected_today: collectedIds.has(c.id)
      })) || [];

      setCustomers(enrichedCustomers);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async (customer: Customer) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .insert([{
          customer_id: customer.id,
          agent_id: user.id,
          amount: customer.default_amount,
          date: today,
          payment_method: 'Cash',
          collection_type: 'quick_collect'
        }]);

      if (error) throw error;

      showSuccess(`Collected ₹${customer.default_amount} from ${customer.name}`);
      
      setCustomers(prev => prev.map(c => 
        c.id === customer.id ? { ...c, collected_today: true } : c
      ));
    } catch (error: any) {
      showError(error.message);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const collectedCount = customers.filter(c => c.collected_today).length;
  const totalCount = customers.length;
  const progress = totalCount > 0 ? (collectedCount / totalCount) * 100 : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">Quick Collect</h1>
            <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM do, yyyy')}</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl border border-secondary shadow-sm flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Progress</p>
              <p className="text-xl font-black text-primary">{collectedCount} / {totalCount}</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-secondary flex items-center justify-center relative">
              <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={175.9}
                  strokeDashoffset={175.9 - (175.9 * progress) / 100}
                  className="text-primary transition-all duration-500"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input 
            placeholder="Search customer..." 
            className="pl-12 h-14 rounded-2xl border-secondary bg-white shadow-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-secondary overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/30">
                    <th className="px-6 py-4 text-sm font-bold text-primary uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-sm font-bold text-primary uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-sm font-bold text-primary uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">{customer.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-muted-foreground">₹{customer.default_amount}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {customer.collected_today ? (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-600 rounded-xl font-bold text-sm">
                            <CheckCircle2 size={16} />
                            Collected
                          </div>
                        ) : (
                          <Button 
                            onClick={() => handleCollect(customer)}
                            className="rounded-xl font-bold shadow-md shadow-primary/10"
                            size="sm"
                          >
                            <Zap size={16} className="mr-2" />
                            Collect
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default QuickCollect;