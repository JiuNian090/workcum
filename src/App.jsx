import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TimeEntryPage from './pages/TimeEntryPage';
import SchedulePage from './pages/SchedulePage';
import DataPage from './pages/DataPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<TimeEntryPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="data" element={<DataPage />} />
      </Route>
    </Routes>
  );
}

export default App;