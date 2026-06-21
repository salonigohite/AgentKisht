"use client";

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, Search, MoreVertical, Edit2, 
  Trash2, Phone, Mail, MapPin, Download
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { showSuccess, showError } from '@/utils/toast';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  default_amount: number;
  notes: string;
}

const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    default_amount: 100,
    notes: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, [user]);

  const fetchCustomers = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('agent_id', user.id)
        .order('name');
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('customers')
        .insert([{ ...newCustomer, agent_id: user.id }]);

      if (error) throw error;

      showSuccess('Customer added successfully');
      setIsAddDialogOpen(false);
      setNewCustomer({ name: '', phone: '', email: '', address: '', default_amount: 100, notes: '' });
      fetchCustomers();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showSuccess('Customer deleted');
      fetchCustomers();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Address', 'Default Amount', 'Notes'];
    const rows = customers.map(c => [
      c.name, c.phone, c.email, c.address, c.default_amount, c.notes
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">Customers</h1>
            <p className="text-muted-foreground">Manage your {customers.length} clients</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV} className="rounded-xl border-secondary">
              <Download size={18} className="mr-2" />
              Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl font-bold shadow-lg shadow-primary/20">
                  <Plus size={18} className="mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-primary">New Customer</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddCustomer} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Full Name</label>
                    <Input 
                      required
                      placeholder="John Doe" 
                      value={newCustomer.name}
                      onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                      className="rounded-xl border-secondary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Phone</label>
                      <Input 
                        required
                        placeholder="1234567890" 
                        value={newCustomer.phone}
                        onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                        className="rounded-xl border-secondary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold">Daily Amount</label>
                      <Input 
                        type="number"
                        required
                        value={newCustomer.default_amount}
                        onChange={e => setNewCustomer({...newCustomer, default_amount: Number(e.target.value)})}
                        className="rounded-xl border-secondary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Email (Optional)</label>
                    <Input 
                      type="email"
                      placeholder="john@example.com" 
                      value={newCustomer.email}
                      onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                      className="rounded-xl border-secondary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Address</label>
                    <Input 
                      placeholder="123 Street, City" 
                      value={newCustomer.address}
                      onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
                      className="rounded-xl border-secondary"
                    />
                  </div>
                  <Button type="submit" className="w-full rounded-xl font-bold h-12 mt-4">
                    Save Customer
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input 
            placeholder="Search by name or phone..." 
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white p-6 rounded-3xl shadow-sm border border-secondary hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary">{customer.name}</h3>
                    <p className="text-sm font-bold text-muted-foreground">₹{customer.default_amount} / day</p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteCustomer(customer.id)}>
                    <Trash2 size={18} className="text-destructive" />
                  </Button>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Customers;