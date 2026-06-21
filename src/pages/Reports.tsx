"use client";

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { BarChart3, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showError } from '@/utils/toast';

interface ReportData {
  customer_name: string;
  total_amount: number;
  collection_count: number;
}

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));

  const months = [
    { value: '01', label: 'January' }, { value: '02', label: 'February' },
    { value: '03', label: 'March' }, { value: '04', label: 'April' },
    { value: '05', label: 'May' }, { value: '06', label: 'June' },
    { value: '07', label: 'July' }, { value: '08', label: 'August' },
    { value: '09', label: 'September' }, { value: '10', label: 'October' },
    { value: '11', label: 'November' }, { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => {
    fetchReport();
  }, [user, selectedMonth, selectedYear]);

  const fetchReport = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const lastDay = new Date(parseInt(selectedYear), parseInt(selectedMonth), 0).getDate();
      const endDate = `${selectedYear}-${selectedMonth}-${lastDay}`;

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          amount,
          customers ( name )
        `)
        .eq('agent_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      // Aggregate data by customer
      const aggregation: Record<string, ReportData> = {};
      data?.forEach((t: any) => {
        const name = t.customers.name;
        if (!aggregation[name]) {
          aggregation[name] = { customer_name: name, total_amount: 0, collection_count: 0 };
        }
        aggregation[name].total_amount += t.amount;
        aggregation[name].collection_count += 1;
      });

      setReportData(Object.values(aggregation).sort((a, b) => b.total_amount - a.total_amount));
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = reportData.reduce((sum, item) => sum + item.total_amount, 0);

  const exportToCSV = () => {
    const headers = ['Customer Name', 'Total Amount', 'Collections Count'];
    const rows = reportData.map(r => [r.customer_name, r.total_amount, r.collection_count]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `report_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">Monthly Reports</h1>
            <p className="text-muted-foreground">Performance summary for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
          </div>
          <Button variant="outline" onClick={exportToCSV} className="rounded-xl border-secondary">
            <Download size={18} className="mr-2" />
            Export Report
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 bg-white p-4 rounded-2xl border border-secondary shadow-sm">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Month</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="rounded-xl border-secondary">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Year</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="rounded-xl border-secondary">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-primary text-white p-8 rounded-3xl shadow-xl shadow-primary/20 flex flex-col justify-center">
            <p className="text-primary-foreground/80 font-bold uppercase tracking-wider text-sm">Total Collected</p>
            <p className="text-4xl font-black mt-2">₹{totalCollected.toLocaleString()}</p>
            <div className="mt-6 flex items-center gap-2 text-primary-foreground/60">
              <BarChart3 size={20} />
              <span className="text-sm font-medium">{reportData.length} active customers</span>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-secondary overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-primary">Customer Summary</h3>
            </div>
            <div className="overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Customer</th>
                      <th className="px-6 py-4 text-xs font-bold text-primary uppercase">Collections</th>
                      <th className="px-6 py-4 text-xs font-bold text-primary uppercase text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary">
                    {reportData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">{item.customer_name}</td>
                        <td className="px-6 py-4 text-muted-foreground">{item.collection_count} times</td>
                        <td className="px-6 py-4 text-right font-black text-primary">₹{item.total_amount}</td>
                      </tr>
                    ))}
                    {reportData.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                          No data for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;