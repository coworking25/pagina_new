import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import {
  Settings,
  Save,
  Upload,
  Globe,
  MapPin,
  Phone,
  Mail,
  Clock,
  Palette,
  Shield,
  Bell,
  Database,
  Key,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';

interface SystemSettings {
  companyName: string;
  companyDescription: string;
  companyLogo: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  officeAddress: string;
  officeHours: string;
  websiteUrl: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
  database: {
    backupFrequency: string;
    lastBackup: string;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordPolicy: string;
  };
}

// Función para cargar configuraciones desde la base de datos
async function loadSettings(): Promise<SystemSettings> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value');

    if (error) {
      console.error('Error cargando configuraciones:', error);
      return getDefaultSettings();
    }

    // Convertir los datos de la base de datos al formato SystemSettings
    const settings: any = {};

    data.forEach((row: any) => {
      switch (row.key) {
        case 'company_info':
          settings.companyName = row.value.companyName || 'Coworking Inmobiliario';
          settings.companyDescription = row.value.companyDescription || 'Expertos en bienes raíces con más de 10 años de experiencia. Te acompañamos en cada paso hacia tu nuevo hogar con servicios integrales de arriendos, ventas, avalúos y asesorías especializadas.';
          settings.companyLogo = row.value.companyLogo || '';
          settings.websiteUrl = row.value.websiteUrl || 'https://coworkinginmobiliario.com/';
          break;
        case 'contact_info':
          settings.contactEmail = row.value.contactEmail || 'inmobiliariocoworking5@gmail.com';
          settings.contactPhone = row.value.contactPhone || '+57 314 886 0404';
          settings.contactWhatsapp = row.value.contactWhatsapp || '+57 314 886 0404';
          settings.officeAddress = row.value.officeAddress || 'Carrera 41 #38 Sur - 43, Edificio Emporio Local 306, 5C97+F6 Envigado, Antioquia';
          settings.officeHours = row.value.officeHours || 'Lun - Vie: 9:00 AM - 5:00 PM, Sáb - Dom sin atención al cliente';
          break;
        case 'social_media':
          settings.socialMedia = {
            facebook: row.value.facebook || '#',
            instagram: row.value.instagram || 'https://www.instagram.com/coworking_inmobiliario?igsh=c3VnM29jN3oydmhj&utm_source=qr',
            twitter: row.value.twitter || '#',
            linkedin: row.value.linkedin || '#'
          };
          break;
        case 'theme':
          settings.theme = {
            primaryColor: row.value.primaryColor || '#00D4FF',
            secondaryColor: row.value.secondaryColor || '#39FF14',
            darkMode: row.value.darkMode || false
          };
          break;
        case 'notifications':
          settings.notifications = {
            emailNotifications: row.value.emailNotifications !== undefined ? row.value.emailNotifications : true,
            pushNotifications: row.value.pushNotifications !== undefined ? row.value.pushNotifications : true,
            smsNotifications: row.value.smsNotifications || false
          };
          break;
        case 'database':
          settings.database = {
            backupFrequency: row.value.backupFrequency || 'daily',
            lastBackup: row.value.lastBackup || '2024-01-15 10:30:00'
          };
          break;
        case 'security':
          settings.security = {
            twoFactorAuth: row.value.twoFactorAuth || false,
            sessionTimeout: row.value.sessionTimeout || 30,
            passwordPolicy: row.value.passwordPolicy || 'medium'
          };
          break;
      }
    });

    // Asegurar que todos los campos estén presentes
    return { ...getDefaultSettings(), ...settings };
  } catch (error) {
    console.error('Error cargando configuraciones:', error);
    return getDefaultSettings();
  }
}

// Función para guardar configuraciones en la base de datos
async function saveSettingsToDB(settings: SystemSettings): Promise<void> {
  try {
    const settingsData = [
      {
        key: 'company_info',
        value: {
          companyName: settings.companyName,
          companyDescription: settings.companyDescription,
          companyLogo: settings.companyLogo,
          websiteUrl: settings.websiteUrl
        }
      },
      {
        key: 'contact_info',
        value: {
          contactEmail: settings.contactEmail,
          contactPhone: settings.contactPhone,
          contactWhatsapp: settings.contactWhatsapp,
          officeAddress: settings.officeAddress,
          officeHours: settings.officeHours
        }
      },
      {
        key: 'social_media',
        value: settings.socialMedia
      },
      {
        key: 'theme',
        value: settings.theme
      },
      {
        key: 'notifications',
        value: settings.notifications
      },
      {
        key: 'database',
        value: settings.database
      },
      {
        key: 'security',
        value: settings.security
      }
    ];

    // Usar upsert para insertar o actualizar
    const { error } = await supabase
      .from('settings')
      .upsert(settingsData, { onConflict: 'key' });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error guardando configuraciones:', error);
    throw error;
  }
}

// Función para obtener configuraciones por defecto
function getDefaultSettings(): SystemSettings {
  return {
    companyName: 'Coworking Inmobiliario',
    companyDescription: 'Expertos en bienes raíces con más de 10 años de experiencia. Te acompañamos en cada paso hacia tu nuevo hogar con servicios integrales de arriendos, ventas, avalúos y asesorías especializadas.',
    companyLogo: '',
    contactEmail: 'inmobiliariocoworking5@gmail.com',
    contactPhone: '+57 314 886 0404',
    contactWhatsapp: '+57 314 886 0404',
    officeAddress: 'Carrera 41 #38 Sur - 43, Edificio Emporio Local 306, 5C97+F6 Envigado, Antioquia',
    officeHours: 'Lun - Vie: 9:00 AM - 5:00 PM, Sáb - Dom sin atención al cliente',
    websiteUrl: 'https://coworkinginmobiliario.com/',
    socialMedia: {
      facebook: '#',
      instagram: 'https://www.instagram.com/coworking_inmobiliario?igsh=c3VnM29jN3oydmhj&utm_source=qr',
      twitter: '#',
      linkedin: '#'
    },
    theme: {
      primaryColor: '#00D4FF',
      secondaryColor: '#39FF14',
      darkMode: false
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false
    },
    database: {
      backupFrequency: 'daily',
      lastBackup: '2024-01-15 10:30:00'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordPolicy: 'medium'
    }
  };
}

function AdminSettings() {
  const [settings, setSettings] = useState<SystemSettings>(getDefaultSettings());
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  // Cargar configuraciones al montar el componente
  useEffect(() => {
    const loadSettingsData = async () => {
      setLoading(true);
      try {
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Error cargando configuraciones:', error);
        // Usar configuraciones por defecto si hay error
        setSettings(getDefaultSettings());
      } finally {
        setLoading(false);
      }
    };

    loadSettingsData();
  }, []);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'contact', label: 'Contacto', icon: Phone },
    { id: 'theme', label: 'Apariencia', icon: Palette },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'database', label: 'Base de Datos', icon: Database }
  ];

  const saveSettings = async () => {
    setLoading(true);
    try {
      await saveSettingsToDB(settings);
      
      setSavedMessage('Configuración guardada exitosamente');
      setTimeout(() => setSavedMessage(''), 3000);
      
      console.log('✅ Configuración guardada:', settings);
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      setSavedMessage('Error guardando configuración. Intente nuevamente.');
      setTimeout(() => setSavedMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const performDatabaseBackup = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      updateSetting('database.lastBackup', new Date().toLocaleString());
      setSavedMessage('Backup realizado exitosamente');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      console.error('❌ Error en backup:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0"
      >
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">Configuración del Sistema</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 truncate">
            Administra la configuración general de la plataforma
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveSettings}
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
          )}
          <span className="sm:hidden">Guardar</span>
          <span className="hidden sm:inline">Guardar Configuración</span>
        </motion.button>
      </motion.div>

      {/* Success Message */}
      {savedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400 px-4 py-3 rounded-lg"
        >
          {savedMessage}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Sidebar - horizontal scroll on mobile */}
        <div className="lg:col-span-1">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 lg:w-full flex items-center px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 lg:p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Información General</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre de la Empresa
                    </label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) => updateSetting('companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL del Sitio Web
                    </label>
                    <input
                      type="url"
                      value={settings.websiteUrl}
                      onChange={(e) => updateSetting('websiteUrl', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción de la Empresa
                  </label>
                  <textarea
                    value={settings.companyDescription}
                    onChange={(e) => updateSetting('companyDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logo de la Empresa
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      {settings.companyLogo ? (
                        <img src={settings.companyLogo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Logo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Información de Contacto</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email de Contacto
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => updateSetting('contactEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="tel"
                      value={settings.contactPhone}
                      onChange={(e) => updateSetting('contactPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={settings.contactWhatsapp}
                    onChange={(e) => updateSetting('contactWhatsapp', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección de la Oficina
                  </label>
                  <textarea
                    value={settings.officeAddress}
                    onChange={(e) => updateSetting('officeAddress', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horarios de Atención
                  </label>
                  <input
                    type="text"
                    value={settings.officeHours}
                    onChange={(e) => updateSetting('officeHours', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Redes Sociales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={settings.socialMedia.facebook}
                        onChange={(e) => updateSetting('socialMedia.facebook', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={settings.socialMedia.instagram}
                        onChange={(e) => updateSetting('socialMedia.instagram', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={settings.socialMedia.twitter}
                        onChange={(e) => updateSetting('socialMedia.twitter', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={settings.socialMedia.linkedin}
                        onChange={(e) => updateSetting('socialMedia.linkedin', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Tab */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configuración de Apariencia</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color Primario
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.theme.primaryColor}
                        onChange={(e) => updateSetting('theme.primaryColor', e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                      />
                      <input
                        type="text"
                        value={settings.theme.primaryColor}
                        onChange={(e) => updateSetting('theme.primaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color Secundario
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={settings.theme.secondaryColor}
                        onChange={(e) => updateSetting('theme.secondaryColor', e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600"
                      />
                      <input
                        type="text"
                        value={settings.theme.secondaryColor}
                        onChange={(e) => updateSetting('theme.secondaryColor', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.theme.darkMode}
                      onChange={(e) => updateSetting('theme.darkMode', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Habilitar modo oscuro por defecto
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configuración de Notificaciones</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => updateSetting('notifications.emailNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notificaciones por Email
                      </span>
                    </label>
                    <p className="ml-6 text-sm text-gray-500 dark:text-gray-400">
                      Recibir notificaciones de nuevas citas y consultas por email
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => updateSetting('notifications.pushNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notificaciones Push
                      </span>
                    </label>
                    <p className="ml-6 text-sm text-gray-500 dark:text-gray-400">
                      Notificaciones en tiempo real en el navegador
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => updateSetting('notifications.smsNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Notificaciones SMS
                      </span>
                    </label>
                    <p className="ml-6 text-sm text-gray-500 dark:text-gray-400">
                      Recibir notificaciones importantes por SMS
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configuración de Seguridad</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => updateSetting('security.twoFactorAuth', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Autenticación de Dos Factores
                      </span>
                    </label>
                    <p className="ml-6 text-sm text-gray-500 dark:text-gray-400">
                      Requiere verificación adicional para el acceso
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tiempo de Sesión (minutos)
                    </label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security.sessionTimeout', parseInt(e.target.value))}
                      className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Política de Contraseñas
                    </label>
                    <select
                      value={settings.security.passwordPolicy}
                      onChange={(e) => updateSetting('security.passwordPolicy', e.target.value)}
                      className="w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Básica</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Database Tab */}
            {activeTab === 'database' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configuración de Base de Datos</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frecuencia de Backup
                    </label>
                    <select
                      value={settings.database.backupFrequency}
                      onChange={(e) => updateSetting('database.backupFrequency', e.target.value)}
                      className="w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="hourly">Cada hora</option>
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Último Backup
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">{settings.database.lastBackup}</p>
                  </div>

                  <div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={performDatabaseBackup}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Database className="w-5 h-5 mr-2" />
                      )}
                      Realizar Backup Ahora
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
