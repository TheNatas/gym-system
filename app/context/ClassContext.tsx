'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { Class } from "@/app/api/modules/class/dtos/Class";
import { getClassesByDay } from "@/app/api/modules/class";

type ClassContextType = {
  classes: Class[];
  total: number;
  page: number;
  hasMore: boolean;
  loading: boolean;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  fetchClasses: (pageToFetch?: number, size?: number, append?: boolean) => Promise<void>;
  setClasses: React.Dispatch<React.SetStateAction<Class[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>;
  selectedClass: Class | undefined;
  setSelectedClass: React.Dispatch<React.SetStateAction<Class | undefined>>;
};

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export function ClassProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<Class | undefined>(undefined);
  const selectedClassRef = useRef<Class | undefined>(undefined);

  useEffect(() => {
    selectedClassRef.current = selectedClass;
  }, [selectedClass]);

  const fetchClasses = useCallback(async (pageToFetch: number = 1, size: number = 10, append: boolean = false) => {
    setLoading(true);
    try {
      const localDate = selectedDate;
      const fetchedData = await getClassesByDay({ date: localDate, page: pageToFetch, pageSize: size });
      
      setClasses(prev => append ? [...prev, ...fetchedData.items] : fetchedData.items);
      setTotal(fetchedData.total);
      setHasMore(fetchedData.items.length === size);
      
      // Update selected class if it's open
      const currentSelected = selectedClassRef.current;
      if (currentSelected) {
          const updated = fetchedData.items.find(c => c.id === currentSelected.id);
          if (updated) setSelectedClass(updated);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  return (
    <ClassContext.Provider value={{ 
      classes, 
      total, 
      page, 
      hasMore, 
      loading, 
      selectedDate, 
      setSelectedDate, 
      fetchClasses, 
      setClasses, 
      setPage, 
      setHasMore,
      selectedClass,
      setSelectedClass
    }}>
      {children}
    </ClassContext.Provider>
  );
}

export function useClassContext() {
  const context = useContext(ClassContext);
  if (context === undefined) {
    throw new Error('useClassContext must be used within a ClassProvider');
  }
  return context;
}
