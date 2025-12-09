'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import UserView from './pages/user/UserView';
import ClassView from './pages/class/ClassView';

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  currentTab: number;
}

function CurrentTabContent(props: TabPanelProps) {
  const { children, currentTab, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={currentTab !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {currentTab === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Home() {
  const [currentTab, setCurrentTab] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-white">
      <h1 className="text-2xl md:text-4xl font-bold mb-8 text-black">Sistema de Academia</h1>
      
      <Box sx={{ width: '100%', maxWidth: 800 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleChange} aria-label="gym system tabs" centered>
            <Tab 
              label="Aulas" 
              id='simple-tab-0' 
              aria-controls='simple-tabpanel-0' 
            />
            <Tab 
              label="Usuários" 
              id='simple-tab-1' 
              aria-controls='simple-tabpanel-1' 
            />
          </Tabs>
        </Box>
        <CurrentTabContent currentTab={currentTab} index={0}>
          <ClassView />
        </CurrentTabContent>
        <CurrentTabContent currentTab={currentTab} index={1}>
          <UserView />
        </CurrentTabContent>
      </Box>
    </main>
  );
}
