import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmOverrideModal from '../components/modals/ConfirmOverrideModal';
import Modal from '../components/modals/Modal';

const DataPage = () => {
  const { t, i18n } = useTranslation();
  const [exportStatus, setExportStatus] = useState('');
  const [importStatus, setImportStatus] = useState('');
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState(null);
  const [isExportFileNameModalOpen, setIsExportFileNameModalOpen] = useState(false);
  const [exportFileName, setExportFileName] = useState('');

  // Export all data to JSON - 只导出本地存储数据为JSON格式
  const handleExportAllData = () => {
    // 设置默认文件名
    const defaultFileName = `time-tracker-backup-${new Date().toISOString().split('T')[0]}`;
    setExportFileName(defaultFileName);
    setIsExportFileNameModalOpen(true);
  };

  // Handle export with custom file name
  const handleExportWithFileName = () => {
    try {
      // Get all data from localStorage
      const timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
      const schedules = JSON.parse(localStorage.getItem('schedules') || '[]');
      const customShifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
      
      // Create data object - 只包含本地存储的数据
      const data = {
        timeEntries,
        schedules,
        customShifts,
        exportDate: new Date().toISOString()
      };
      
      // Create file
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      // 使用自定义文件名
      const exportFileDefaultName = `${exportFileName || `time-tracker-backup-${new Date().toISOString().split('T')[0]}`}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setIsExportFileNameModalOpen(false);
      setExportStatus(t('data.export.success'));
      setTimeout(() => setExportStatus(''), 3000);
    } catch (error) {
      setExportStatus(t('data.export.error') + error.message);
      setTimeout(() => setExportStatus(''), 3000);
    }
  };

  // Import data
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if there's existing data
    const existingTimeEntries = localStorage.getItem('timeEntries');
    const existingSchedules = localStorage.getItem('schedules');
    const existingCustomShifts = localStorage.getItem('customShifts');

    const hasExistingData = 
      (existingTimeEntries && JSON.parse(existingTimeEntries).length > 0) ||
      (existingSchedules && JSON.parse(existingSchedules).length > 0) ||
      (existingCustomShifts && JSON.parse(existingCustomShifts).length > 0);

    if (hasExistingData) {
      // Show confirmation modal if there's existing data
      setPendingImportFile(file);
      setIsOverrideModalOpen(true);
      // Reset file input
      event.target.value = '';
    } else {
      // No existing data, proceed with import
      processImportData(file);
    }
  };

  // Process the actual import
  const processImportData = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validate data structure
        if (!data.timeEntries || !data.schedules) {
          throw new Error(t('data.import.invalid_format'));
        }
        
        // Save to localStorage
        localStorage.setItem('timeEntries', JSON.stringify(data.timeEntries));
        localStorage.setItem('schedules', JSON.stringify(data.schedules));
        // Check if customShifts exists in the imported data, if not, keep existing data
        if (data.customShifts !== undefined) {
          localStorage.setItem('customShifts', JSON.stringify(data.customShifts));
        }
        
        setImportStatus(t('data.import.success'));
        setTimeout(() => setImportStatus(''), 3000);
      } catch (error) {
        setImportStatus(t('data.import.error') + error.message);
        setTimeout(() => setImportStatus(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  // Clear all data
  const handleClearAllData = () => {
    if (window.confirm(t('data.clear_confirm'))) {
      localStorage.removeItem('timeEntries');
      localStorage.removeItem('schedules');
      localStorage.removeItem('customShifts');
      setImportStatus(t('data.clear_success'));
      setTimeout(() => setImportStatus(''), 3000);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4">
      <ConfirmOverrideModal
        isOpen={isOverrideModalOpen}
        onClose={() => {
          setIsOverrideModalOpen(false);
          setPendingImportFile(null);
        }}
        onConfirm={() => {
          setIsOverrideModalOpen(false);
          if (pendingImportFile) {
            processImportData(pendingImportFile);
            setPendingImportFile(null);
          }
        }}
        title={t('data.import_override.title')}
        message={t('data.import_override.message')}
      />
      
      {/* 自定义文件名弹窗 */}
      <Modal
        isOpen={isExportFileNameModalOpen}
        onClose={() => setIsExportFileNameModalOpen(false)}
        title={t('data.export_modal.title')}
        size="sm"
      >
        <Modal.Body>
          <div className="mb-4">
            <label htmlFor="exportFileName" className="block text-gray-700 text-sm font-medium mb-2">
              {t('data.export_modal.filename')}
            </label>
            <div className="relative">
              <input
                type="text"
                id="exportFileName"
                value={exportFileName}
                onChange={(e) => setExportFileName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 pr-10"
                placeholder={t('data.export_modal.placeholder')}
                autoFocus
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {t('data.export_modal.extension')}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 w-full">
            <button
              onClick={() => setIsExportFileNameModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors duration-200 text-base"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleExportWithFileName}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow transition-all duration-200 text-base flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t('common.export')}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
      
      <div className="flex justify-between items-center">
        <h1 className="page-heading my-0 text-xl md:text-2xl">{t('data.title')}</h1>
        <button 
          onClick={toggleLanguage}
          className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-1 px-3 rounded-full text-sm transition-colors self-start mt-2"
        >
          {i18n.language === 'zh' ? 'EN' : '中文'}
        </button>
      </div>
      
      {/* Project Information Section - Data Management Style */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-md overflow-hidden">
        <div className="p-1 bg-gradient-to-r from-purple-500 to-indigo-600"></div>
        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('project.title')}
            </h2>
            <div className="w-16 h-0.5 bg-purple-300 mx-auto"></div>
          </div>
          
          <div className="space-y-6 mb-8 max-w-3xl mx-auto">
            <div className="text-center">
              <p className="text-gray-700 leading-relaxed text-base md:text-lg">
                {t('project.introduction.part1')}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {t('project.introduction.part2')}
              </p>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-block bg-purple-100 rounded-lg px-4 py-3 border border-purple-200">
              <p className="text-purple-700 text-sm">
                {t('project.support.text')}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a 
              href="https://github.com/JiuNian090/workcum/blob/main/public/%E5%B0%8F%E7%A8%8B%E5%BA%8F.jpg" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 001 1zm0 4h2a1 1 0 001-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 001 1zm0 4h2a1 1 0 001-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 001 1zM9 5h.01M5 20h.01M9 20h.01M5 16h.01"
                />
              </svg>
              SY工时记录小程序
            </a>
            <a 
              href="https://github.com/JiuNian090/workcum" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-sm"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="currentColor" 
                viewBox="0 0 24 24" 
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" 
                  clipRule="evenodd"
                />
              </svg>
              {t('project.support.github')}
            </a>
            <button
              onClick={() => window.location.href = 'mailto:jiunian929@gmail.com'}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium text-sm"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {t('project.support.contact')}
            </button>
            <a 
              href="https://gongyi.qq.com/succor/project_list.htm" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium text-sm"
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t('project.support.donate')}
            </a>
          </div>
        </div>
      </div>
      
      {/* Data Management Section */}
      <div className="mt-6">
        <h2 className="text-base font-bold text-gray-800 mb-3 md:text-xl md:mb-4">{t('data.management')}</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mt-8">
        {/* Export Data Card - 只保留JSON导出功能 */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl shadow-md overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
          <div className="p-4 md:p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-800 mb-2 md:text-xl">{t('data.export.title')}</h2>
                <p className="text-gray-600 mb-4 text-xs md:text-sm lg:text-base">
                  {t('data.export.description')}
                </p>
                <div className="relative">
                  <button
                    onClick={handleExportAllData}
                    className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 shadow hover:shadow-md cursor-pointer"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    {t('data.export.json_button')}
                  </button>
                </div>
                {exportStatus && (
                  <div className="mt-4 p-3 bg-emerald-100 text-emerald-700 rounded-lg">
                    {exportStatus}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Import Data Card */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-md overflow-hidden relative z-0">
          <div className="p-1 bg-gradient-to-r from-indigo-500 to-blue-600"></div>
          <div className="p-4 md:p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-800 mb-2 md:text-xl">{t('data.import.title')}</h2>
                <p className="text-gray-600 mb-4 text-xs md:text-sm lg:text-base">
                  {t('data.import.description')}
                </p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="fileInput"
                  />
                  <label
                    htmlFor="fileInput"
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-all duration-200 shadow hover:shadow-md cursor-pointer"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                    </svg>
                    {t('data.import.button')}
                  </label>
                </div>
                {importStatus && (
                  <div className="mt-4 p-3 bg-indigo-100 text-indigo-700 rounded-lg">
                    {importStatus}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Danger Zone Card */}
      <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-md overflow-hidden">
        <div className="p-1 bg-gradient-to-r from-red-500 to-orange-600"></div>
        <div className="p-4 md:p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-gray-800 mb-2 md:text-xl">{t('data.danger_zone.title')}</h2>
                <p className="text-gray-600 mb-4 text-xs md:text-sm lg:text-base">
                  {t('data.danger_zone.description')}
                </p>
              <button
                onClick={handleClearAllData}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 shadow hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                {t('data.danger_zone.button')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer Section -独立模块框 */}
      <div className="mt-6 bg-red-50 rounded-lg shadow-sm overflow-hidden">
        <div className="p-1 bg-red-500"></div>
        <div className="p-4 md:p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800 mb-3 md:text-xl">{t('disclaimer.title')}</h2>
              <p className="text-red-700 font-medium text-xs md:text-sm lg:text-base">
                {t('disclaimer.content')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPage;