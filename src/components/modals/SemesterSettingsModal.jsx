import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';

const SemesterSettingsModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [semesterStart, setSemesterStart] = useState('');
  const [semesterEnd, setSemesterEnd] = useState('');

  // Load semester settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem('semesterSettings') || '{}');
    if (savedSettings.startDate) {
      setSemesterStart(savedSettings.startDate);
    }
    if (savedSettings.endDate) {
      setSemesterEnd(savedSettings.endDate);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!semesterStart || !semesterEnd) {
      alert('请设置学期开始和结束日期');
      return;
    }
    
    const startDate = new Date(semesterStart);
    const endDate = new Date(semesterEnd);
    
    if (startDate >= endDate) {
      alert('学期开始日期必须早于结束日期');
      return;
    }
    
    // Save semester settings to localStorage
    const semesterSettings = {
      startDate: semesterStart,
      endDate: semesterEnd
    };
    
    localStorage.setItem('semesterSettings', JSON.stringify(semesterSettings));
    
    // Trigger a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'semesterSettings',
      newValue: JSON.stringify(semesterSettings)
    }));
    
    onClose();
  };

  const handleReset = () => {
    setSemesterStart('');
    setSemesterEnd('');
    localStorage.removeItem('semesterSettings');
    
    // Trigger a storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'semesterSettings',
      newValue: null
    }));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="md"
      title="学期设置"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="semesterStart">
            学期开始日期
          </label>
          <input
            type="date"
            id="semesterStart"
            value={semesterStart}
            onChange={(e) => setSemesterStart(e.target.value)}
            className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="semesterEnd">
            学期结束日期
          </label>
          <input
            type="date"
            id="semesterEnd"
            value={semesterEnd}
            onChange={(e) => setSemesterEnd(e.target.value)}
            className="shadow appearance-none border rounded-xl w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
          >
            重置
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
            >
              取消
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
            >
              保存
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default SemesterSettingsModal;