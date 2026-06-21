"use client";

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { Receipt, Download, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { showError } from '@/utils/toast';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  payment_method: string;
  collection_type: string;
  customers: {
    name: string;
  };
}

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id, amount, date, payment_method, collection_type,
          customers ( name )
        `)
        .eq('agent_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTransactions(data as any || []);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Customer', 'Amount', 'Method', 'Type'];
    const rows = transactions.map(t => [
      t.date, t.customers.name, t.amount, t.payment_method, t.collection_type
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions.filter(t => 
    t.customers.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">History of all collections</p>
          </div>
          <Button variant="outline" onClick={exportToCSV} className="rounded-xl border-secondary">
            <Download size={18} className="mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input 
            placeholder="Search by customer name..." 
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
                    <th className="px-6 py-4 text-sm font-bold text-primary uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-sm font-bold text-primary uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-sm font-bold text-primary uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-sm font-bold text-primary uppercase tracking-wider">Method</th>
                    <th className="px-6 py-4 text-sm font-bold text-primary uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Calendar size={14} />
                          {format(new Date(t.date), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-foreground">{t.customers.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-black text-primary">₹{t.amount}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-secondary text-primary rounded-full text-xs font-bold">
                          {t.payment_method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-muted-foreground capitalize">
                          {t.collection_type.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        No transactions found.
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

export default Transactions;