import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/general-settings');
      setSettings(response.data);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      // Fallback to default settings if the API call fails
      setSettings({
        systemName: "企業認證資料整合系統",
        systemLanguage: "繁體中文",
        timezone: "Asia/Taipei",
        dateFormat: "YYYY-MM-DD"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const value = {
    settings,
    loading,
    refreshSettings: fetchSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {!loading ? children : null /* Or a loading spinner */}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;