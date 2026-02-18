'use client';
import { useState } from 'react';
import { AppLayout } from '@/app/components/layouts/AppLayout';
import { HeroHeader } from '@/app/components/ui/HeroHeader';
import { Tabs } from '@/app/components/ui/base';
import { ProfileTab } from '@/app/features/profile/components/ProfileTab';
import { SecurityTab } from '@/app/features/profile/components/SecurityTab';
import { UserCircle, User, ShieldCheck } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Perfil', icon: <User size={18} /> },
  { id: 'security', label: 'Seguridad', icon: <ShieldCheck size={18} /> },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <AppLayout>
      <HeroHeader
        title="Mi Perfil"
        subtitle="Administra tu información personal y configuración de seguridad."
        icon={UserCircle}
      />

      <div className="mb-6">
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'security' && <SecurityTab />}
    </AppLayout>
  );
}
