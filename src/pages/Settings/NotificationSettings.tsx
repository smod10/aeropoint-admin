import { useState } from 'react';
import type { FormEvent } from 'react';
import { Mail, MessageSquare, Phone, Play, Save } from 'lucide-react';

type NotificationConfig = {
  emailEnabled: boolean;
  emailProvider: string;
  senderName: string;
  senderEmail: string;
  bookingEmail: string;
  emailHost: string;
  emailPort: string;
  emailUsername: string;
  emailPassword: string;
  emailSecurity: string;
  smsEnabled: boolean;
  smsProvider: string;
  smsAccountSid: string;
  smsAuthToken: string;
  smsFromNumber: string;
  whatsappEnabled: boolean;
  whatsappProvider: string;
  whatsappInstanceId: string;
  whatsappToken: string;
};

const initialConfig: NotificationConfig = {
  emailEnabled: true,
  emailProvider: 'SMTP',
  senderName: '',
  senderEmail: '',
  bookingEmail: '',
  emailHost: '',
  emailPort: '',
  emailUsername: '',
  emailPassword: '',
  emailSecurity: 'SSL',
  smsEnabled: false,
  smsProvider: 'Twilio',
  smsAccountSid: '',
  smsAuthToken: '',
  smsFromNumber: '',
  whatsappEnabled: false,
  whatsappProvider: 'Green API',
  whatsappInstanceId: '',
  whatsappToken: '',
};

function readConfig(): NotificationConfig {
  const saved = JSON.parse(localStorage.getItem('aeropoint-notification-settings') || '{}') as Partial<NotificationConfig>;
  return { ...initialConfig, ...saved, emailPassword: '', smsAuthToken: '', whatsappToken: '' };
}

const fieldClass = 'mt-1.5 w-full rounded-sm border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100';

export default function NotificationSettings() {
  const [config, setConfig] = useState<NotificationConfig>(readConfig);
  const [feedback, setFeedback] = useState('');

  const update = <K extends keyof NotificationConfig>(key: K, value: NotificationConfig[K]) => {
    setConfig(current => ({ ...current, [key]: value }));
    setFeedback('');
  };

  const testProvider = (channel: string) => {
    setFeedback(`Test ${channel} is not connected to a delivery service in this workspace.`);
  };

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { emailPassword, smsAuthToken, whatsappToken, ...nonSecretConfig } = config;
    localStorage.setItem('aeropoint-notification-settings', JSON.stringify(nonSecretConfig));
    setFeedback('Notification settings saved. Provider credentials are kept in this session only.');
  };

  const channelHeader = (title: string, icon: typeof Mail, color: string, enabled: boolean, onToggle: (value: boolean) => void, testLabel: string) => {
    const Icon = icon;
    return (
      <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <span className={`flex h-8 w-8 items-center justify-center rounded-sm ${color}`}><Icon size={16} /></span>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700">
            <span>Enable for Bookings</span>
            <input type="checkbox" checked={enabled} onChange={event => onToggle(event.target.checked)} className="peer sr-only" />
            <span aria-hidden="true" className={`relative h-5 w-9 rounded-full transition-colors ${enabled ? 'bg-primary-500' : 'bg-gray-200'} after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform ${enabled ? 'after:translate-x-4' : ''}`} />
          </label>
          <button type="button" onClick={() => testProvider(testLabel)} className="inline-flex items-center gap-2 border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50">
            <Play size={14} /> Test {testLabel}
          </button>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={saveSettings} className="space-y-6">
      <section className="border border-gray-200 bg-white">
        {channelHeader('Email Notifications', Mail, 'bg-blue-50 text-blue-600', config.emailEnabled, value => update('emailEnabled', value), 'Email')}
        <div className="grid gap-x-4 gap-y-4 p-5 xl:grid-cols-3">
          <label className="text-xs font-semibold text-gray-800">Email Provider<select value={config.emailProvider} onChange={event => update('emailProvider', event.target.value)} className={fieldClass}><option>SMTP</option><option>SendGrid</option><option>Amazon SES</option></select></label>
          <label className="text-xs font-semibold text-gray-800">Sender Name<input value={config.senderName} onChange={event => update('senderName', event.target.value)} placeholder="Sender name" className={fieldClass} /></label>
          <label className="text-xs font-semibold text-gray-800">Sender Email<input type="email" value={config.senderEmail} onChange={event => update('senderEmail', event.target.value)} placeholder="user@sender.com" className={fieldClass} /></label>
          <label className="text-xs font-semibold text-gray-800">Booking Notification Email<input type="email" value={config.bookingEmail} onChange={event => update('bookingEmail', event.target.value)} placeholder="e.g. bookings@yourcompany.com" className={fieldClass} /><span className="mt-1 block font-normal leading-4 text-gray-500">Leave blank to notify all admin users.</span></label>
          <label className="text-xs font-semibold text-gray-800">Host<input value={config.emailHost} onChange={event => update('emailHost', event.target.value)} placeholder="Enter host" className={fieldClass} /></label>
          <label className="text-xs font-semibold text-gray-800">Port<input inputMode="numeric" value={config.emailPort} onChange={event => update('emailPort', event.target.value)} placeholder="Enter port" className={fieldClass} /></label>
          <label className="text-xs font-semibold text-gray-800">Username<input value={config.emailUsername} onChange={event => update('emailUsername', event.target.value)} placeholder="Enter username" className={fieldClass} /></label>
          <label className="text-xs font-semibold text-gray-800">Password<input type="password" value={config.emailPassword} onChange={event => update('emailPassword', event.target.value)} placeholder="Enter password" className={fieldClass} /></label>
          <label className="text-xs font-semibold text-gray-800">Security<select value={config.emailSecurity} onChange={event => update('emailSecurity', event.target.value)} className={fieldClass}><option>SSL</option><option>TLS</option><option>None</option></select></label>
        </div>
      </section>

      <section className="border border-gray-200 bg-white">
        {channelHeader('SMS Notifications', MessageSquare, 'bg-purple-50 text-purple-600', config.smsEnabled, value => update('smsEnabled', value), 'SMS')}
        <div className="grid gap-x-4 gap-y-4 p-5 xl:grid-cols-3">
          <label className="text-xs font-semibold text-gray-800 md:col-span-3">SMS Provider<select value={config.smsProvider} onChange={event => update('smsProvider', event.target.value)} className={fieldClass}><option>Twilio</option><option>Termii</option><option>Vonage</option></select></label>
          <label className="text-xs font-semibold text-gray-800">Account SID<input value={config.smsAccountSid} onChange={event => update('smsAccountSid', event.target.value)} placeholder="Enter account sid" className={fieldClass} /></label>
          <label className="text-xs font-semibold text-gray-800">Auth Token<input type="password" value={config.smsAuthToken} onChange={event => update('smsAuthToken', event.target.value)} placeholder="Enter auth token" className={fieldClass} /></label>
          <label className="text-xs font-semibold text-gray-800">From Number<input value={config.smsFromNumber} onChange={event => update('smsFromNumber', event.target.value)} placeholder="Enter from number" className={fieldClass} /></label>
        </div>
      </section>

      <section className="border border-gray-200 bg-white">
        {channelHeader('WhatsApp Notifications', Phone, 'bg-emerald-50 text-emerald-600', config.whatsappEnabled, value => update('whatsappEnabled', value), 'WhatsApp')}
        <div className="grid gap-x-4 gap-y-4 p-5 xl:grid-cols-3">
          <label className="text-xs font-semibold text-gray-800 md:col-span-3">WhatsApp Provider<select value={config.whatsappProvider} onChange={event => update('whatsappProvider', event.target.value)} className={fieldClass}><option>Green API</option><option>Meta Cloud API</option></select></label>
          <label className="text-xs font-semibold text-gray-800">Instance ID<input value={config.whatsappInstanceId} onChange={event => update('whatsappInstanceId', event.target.value)} placeholder="Enter instance id" className={fieldClass} /></label>
          <label className="text-xs font-semibold text-gray-800">Token<input type="password" value={config.whatsappToken} onChange={event => update('whatsappToken', event.target.value)} placeholder="Enter token" className={fieldClass} /></label>
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" aria-live="polite" className="text-sm text-gray-600">{feedback}</p>
        <button type="submit" className="inline-flex items-center justify-center gap-2 bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"><Save size={16} /> Save Settings</button>
      </div>
    </form>
  );
}
