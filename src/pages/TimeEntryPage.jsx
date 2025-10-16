import React, { useState, useRef, useEffect } from 'react';
import CustomShiftManager from '../components/manager/CustomShiftManager';
import { useTranslation } from 'react-i18next';

const TimeEntryPage = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [shifts, setShifts] = useState([]);

  const editSectionRef = useRef(null);

  // Load entries, schedules and shifts from localStorage on component mount
  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const savedSchedules = JSON.parse(localStorage.getItem('schedules') || '[]');
    const savedShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
    
    setEntries(savedEntries);
    setSchedules(savedSchedules);
    setShifts(savedShifts);
  }, []);

  // Function to scroll to edit section
  const scrollToEditSection = () => {
    if (editSectionRef.current) {
      editSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };



  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-3">
        <h1 className="page-heading">{t('navigation.time_entry')}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-3 mt-2">
          <CustomShiftManager scrollToEditSection={scrollToEditSection} />
        </div>
      </div>
      

    </div>
  );
};

export default TimeEntryPage;