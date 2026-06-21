"use client";

import React from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { User, Mail, Shield, Bell, LogOut } from 'lucide-react';

const Settings = () => {
  const { user, signOut } = useAuth();

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h1 className="text-3xl font-black text-primary tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-secondary overflow-hidden">
          <div className="p-8 flex flex-col items-center text-center border-b bg-secondary/10">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 border-4 border-white shadow-lg">
              <User size={48} />
            </div>
            <h2 className="text-2xl font-bold text-primary">{user?.user_metadata?.full_name || 'Agent'}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/20 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="font-bold text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive daily collection summaries</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-secondary rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-primary rounded-full shadow-sm"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/20 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-bold text-foreground">Security</p>
                  <p className="text-xs text-muted-foreground">Manage your account security</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/20 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <div>
                  <p className="font-bold text-foreground">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Get alerts for pending collections</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-secondary/5 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-center text-destructive hover:bg-destructive/10 hover:text-destructive font-bold h-12 rounded-xl"
              onClick={signOut}
            >
              <LogOut size={20} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">AgentKisht v1.0.0</p>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;