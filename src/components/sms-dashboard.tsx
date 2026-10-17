'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Send, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Upload, 
  FileText, 
  Megaphone, 
  Users, 
  Image as ImageIcon, 
  Sparkles, 
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';

interface SMSTemplate {
  name: string;
  description: string;
  sample: string;
  metaTemplateName?: string;
  category?: 'UTILITY' | 'MARKETING';
  headerType?: string;
  trigger?: string;
}

interface SMSLog {
  id: string;
  recipient: string;
  messageBody: string;
  status: string;
  createdAt: string;
  type: string;
}

interface BroadcastResultItem {
  phone: string;
  status: 'SENT' | 'FAILED';
  error?: string;
  timestamp: string;
}

// Pakistani mobile number cleaner & normalizer
function cleanAndFormatPakistaniPhone(raw: string): string | null {
  if (!raw) return null;
  let clean = raw.trim().replace(/\D/g, '');
  if (!clean) return null;

  // Local 03XXXXXXXXX (11 digits) -> 923XXXXXXXXX
  if (clean.startsWith('0') && clean.length === 11) {
    clean = '92' + clean.slice(1);
  } else if (clean.length === 10 && clean.startsWith('3')) {
    clean = '92' + clean;
  } else if (clean.startsWith('0092')) {
    clean = clean.slice(2);
  }

  // Must match valid Pakistani mobile: 92 + 3 + 9 digits = 12 digits
  if (/^923\d{9}$/.test(clean)) {
    return clean;
  }
  return null;
}

export default function SMSDashboard() {
  const [templates, setTemplates] = useState<Record<string, SMSTemplate>>({});
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states for Test SMS
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [testData, setTestData] = useState({
    invoiceId: '',
    ticketId: '',
    transactionId: '',
    solarUnits: { today: 45, mtd: 1350, ytd: 16200 }
  });

  // Marketing Broadcast Campaign States
  const [broadcastInputType, setBroadcastInputType] = useState<'paste' | 'file'>('paste');
  const [rawNumbersText, setRawNumbersText] = useState('');
  const [parsedRecipients, setParsedRecipients] = useState<string[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);

  const [campaignName, setCampaignName] = useState('Energy Gurus Solar Monitoring & O&M');
  const [broadcastTemplate, setBroadcastTemplate] = useState('solar_promotional_offer');
  const [pamphletUrl, setPamphletUrl] = useState('https://crm.energygurus.online/solar_flyer.png');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastBodyText, setBroadcastBodyText] = useState(
`Protect Your Solar Investment!

Dear Customer,

Your solar system is a valuable investment. Keep it performing efficiently with professional solar monitoring, operations, and maintenance services from EnergyGurusOnline.
Give your solar system the care it deserves!

Contact us today to learn more.
Regards,
Team – EnergyGurusOnline
WhatsApp +923009433303
Info@energygurus.online
www.energygurus.online`
  );
  const [isUploadingFlyer, setIsUploadingFlyer] = useState(false);
  const flyerInputRef = useRef<HTMLInputElement>(null);
  const cancelBroadcastRef = useRef(false);

  const handleFlyerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }

    setIsUploadingFlyer(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'marketing_flyers');

      const res = await fetch('/api/upload/r2', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to upload flyer');
      }

      setPamphletUrl(data.url);
      setSuccess('Flyer uploaded successfully!');
    } catch (err: any) {
      console.error('Flyer upload error:', err);
      setError('Failed to upload flyer: ' + err.message);
    } finally {
      setIsUploadingFlyer(false);
      if (flyerInputRef.current) flyerInputRef.current.value = '';
    }
  };

  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [broadcastStats, setBroadcastStats] = useState({ sent: 0, failed: 0, total: 0 });
  const [broadcastLogs, setBroadcastLogs] = useState<BroadcastResultItem[]>([]);

  useEffect(() => {
    loadTemplates();
    loadRecentLogs();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/sms/templates');
      const data = await response.json();
      setTemplates(data.templates || {});
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const loadRecentLogs = async () => {
    try {
      // Future log query
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  // Live parser for pasted / uploaded phone numbers
  const parseNumbers = (text: string) => {
    if (!text.trim()) {
      setParsedRecipients([]);
      setDuplicateCount(0);
      setInvalidCount(0);
      return;
    }

    const tokens = text.split(/[\r\n,;\t ]+/).map(t => t.trim()).filter(Boolean);
    const validSet = new Set<string>();
    let duplicates = 0;
    let invalids = 0;

    for (const token of tokens) {
      const formatted = cleanAndFormatPakistaniPhone(token);
      if (formatted) {
        if (validSet.has(formatted)) {
          duplicates++;
        } else {
          validSet.add(formatted);
        }
      } else {
        invalids++;
      }
    }

    const uniqueList = Array.from(validSet);
    setParsedRecipients(uniqueList);
    setDuplicateCount(duplicates);
    setInvalidCount(invalids);
  };

  const handleRawTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawNumbersText(val);
    parseNumbers(val);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawNumbersText(content);
        parseNumbers(content);
      }
    };
    reader.readAsText(file);
  };

  // Launch the campaign in paced batches of 25 numbers
  const handleStartCampaign = async () => {
    if (parsedRecipients.length === 0) {
      setError('Please add at least one valid phone number before starting campaign.');
      return;
    }

    const confirmed = window.confirm(
      `Confirm Launch: Send marketing WhatsApp campaign to ${parsedRecipients.length} recipients?\nEstimated Meta Cost: ~${(parsedRecipients.length * 13).toLocaleString()} PKR`
    );
    if (!confirmed) return;

    setIsBroadcasting(true);
    setError('');
    setSuccess('');
    cancelBroadcastRef.current = false;
    setBroadcastStats({ sent: 0, failed: 0, total: parsedRecipients.length });
    setBroadcastProgress(0);
    setBroadcastLogs([]);

    const batchSize = 25;
    const total = parsedRecipients.length;
    let sentAcc = 0;
    let failedAcc = 0;

    for (let i = 0; i < total; i += batchSize) {
      if (cancelBroadcastRef.current) {
        setError('Broadcast campaign was cancelled by user.');
        break;
      }

      const chunk = parsedRecipients.slice(i, i + batchSize);

      try {
        const response = await fetch('/api/sms/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipients: chunk,
            templateName: broadcastTemplate,
            headerImage: pamphletUrl || undefined,
            campaignName
          })
        });

        const data = await response.json();

        if (data.results) {
          sentAcc += (data.sentCount || 0);
          failedAcc += (data.failedCount || 0);

          const nowTime = new Date().toLocaleTimeString();
          const mappedLogs: BroadcastResultItem[] = data.results.map((r: any) => ({
            phone: r.phone,
            status: r.status,
            error: r.error,
            timestamp: nowTime
          }));

          setBroadcastLogs(prev => [...mappedLogs, ...prev]);
        } else {
          failedAcc += chunk.length;
          const nowTime = new Date().toLocaleTimeString();
          const errorLogs: BroadcastResultItem[] = chunk.map(phone => ({
            phone,
            status: 'FAILED',
            error: data.error || 'Server rejected request',
            timestamp: nowTime
          }));
          setBroadcastLogs(prev => [...errorLogs, ...prev]);
        }
      } catch (err: any) {
        failedAcc += chunk.length;
        const nowTime = new Date().toLocaleTimeString();
        const errorLogs: BroadcastResultItem[] = chunk.map(phone => ({
          phone,
          status: 'FAILED',
          error: err.message || 'Network / connection error',
          timestamp: nowTime
        }));
        setBroadcastLogs(prev => [...errorLogs, ...prev]);
      }

      const processedSoFar = Math.min(i + batchSize, total);
      setBroadcastProgress(Math.round((processedSoFar / total) * 100));
      setBroadcastStats({ sent: sentAcc, failed: failedAcc, total });

      // Slight pacing delay between batches
      if (i + batchSize < total) {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }

    setIsBroadcasting(false);
    setSuccess(`Campaign completed! Sent: ${sentAcc}, Failed: ${failedAcc} out of ${total} recipients.`);
  };

  const handleStopCampaign = () => {
    cancelBroadcastRef.current = true;
  };

  // Test SMS sender
  const sendTestSMS = async () => {
    if (!selectedTemplate || !customerId) {
      setError('Please select a template and enter a customer ID');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload: any = {
        type: selectedTemplate,
        customerId
      };

      if (selectedTemplate === 'INVOICE' || selectedTemplate === 'DUE_REMINDER') {
        if (!testData.invoiceId) {
          setError('Invoice ID is required for invoice SMS');
          setLoading(false);
          return;
        }
        payload.invoiceId = testData.invoiceId;
      } else if (selectedTemplate === 'PAYMENT_RECEIVED') {
        if (!testData.transactionId) {
          setError('Transaction ID is required for payment received SMS');
          setLoading(false);
          return;
        }
        payload.transactionId = testData.transactionId;
      } else if (selectedTemplate === 'COMPLAINT_REGISTERED' || selectedTemplate === 'COMPLAINT_RESOLVED') {
        if (!testData.ticketId) {
          setError('Ticket ID is required for complaint SMS');
          setLoading(false);
          return;
        }
        payload.ticketId = testData.ticketId;
      } else if (selectedTemplate === 'SOLAR_REPORT') {
        payload.solarData = testData.solarUnits;
      } else if (selectedTemplate === 'CUSTOM') {
        if (!customMessage) {
          setError('Custom message is required');
          setLoading(false);
          return;
        }
        payload.message = customMessage;
      }

      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      const nowTime = new Date().toLocaleTimeString();
      if (result.success) {
        setSuccess('WhatsApp message sent successfully!');
        setBroadcastLogs(prev => [
          {
            phone: `Customer: ${customerId}`,
            status: 'SENT',
            timestamp: nowTime
          },
          ...prev
        ]);
      } else {
        const errorMsg = result.error || 'Failed to send WhatsApp message';
        setError(errorMsg);
        setBroadcastLogs(prev => [
          {
            phone: `Customer: ${customerId}`,
            status: 'FAILED',
            error: errorMsg,
            timestamp: nowTime
          },
          ...prev
        ]);
      }
    } catch (err: any) {
      const errorMsg = 'Failed to send: ' + err.message;
      setError(errorMsg);
      const nowTime = new Date().toLocaleTimeString();
      setBroadcastLogs(prev => [
        {
          phone: `Customer: ${customerId}`,
          status: 'FAILED',
          error: errorMsg,
          timestamp: nowTime
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendBulkReminders = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/cron/reminders', { method: 'GET' });
      const result = await response.json();
      if (result.success) {
        setSuccess(`Bulk reminders processed: ${result.remindersSent} reminders sent.`);
      } else {
        setError('Failed to process bulk reminders');
      }
    } catch (err: any) {
      setError('Failed to process bulk reminders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const estimatedPKR = Math.round(parsedRecipients.length * 13);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-amber-500" />
            WhatsApp & SMS Communications
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Dispatch bulk marketing campaigns, automated utility alerts, and customer notifications.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={sendBulkReminders} 
            variant="outline"
            disabled={loading || isBroadcasting}
            className="text-xs font-semibold"
          >
            {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Trigger Monthly Due Reminders
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="font-medium">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="broadcast" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="broadcast" className="font-semibold text-xs sm:text-sm">
            📢 Marketing Broadcast
          </TabsTrigger>
          <TabsTrigger value="test" className="font-semibold text-xs sm:text-sm">
            ⚡ Single Test Send
          </TabsTrigger>
          <TabsTrigger value="templates" className="font-semibold text-xs sm:text-sm">
            📋 Templates (14)
          </TabsTrigger>
          <TabsTrigger value="logs" className="font-semibold text-xs sm:text-sm">
            📜 Activity Logs
          </TabsTrigger>
        </TabsList>

        {/* 1. MARKETING BROADCAST TAB */}
        <TabsContent value="broadcast" className="space-y-6 pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Number Input & Campaign Config */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Card 1: Target Mobile Numbers */}
              <Card className="border shadow-2xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Users className="h-4 w-4 text-amber-500" />
                        1. Target Contact Numbers (1,000 – 1,500 Leads)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Enter numbers with or without country code. Pakistani formats (0300..., +92300..., 92300...) are automatically normalized.
                      </CardDescription>
                    </div>
                    <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setBroadcastInputType('paste')}
                        className={`px-2.5 py-1 rounded-md transition-all ${broadcastInputType === 'paste' ? 'bg-white shadow-2xs text-gray-900 font-bold' : 'text-gray-500'}`}
                      >
                        Paste Numbers
                      </button>
                      <button
                        type="button"
                        onClick={() => setBroadcastInputType('file')}
                        className={`px-2.5 py-1 rounded-md transition-all ${broadcastInputType === 'file' ? 'bg-white shadow-2xs text-gray-900 font-bold' : 'text-gray-500'}`}
                      >
                        Upload CSV / File
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {broadcastInputType === 'paste' ? (
                    <div>
                      <Textarea
                        rows={6}
                        placeholder="Paste up to 1,500 mobile numbers here (separated by new line, commas, or spaces)&#10;Example:&#10;03001234567&#10;03264022002&#10;+923219876543&#10;923335551234"
                        value={rawNumbersText}
                        onChange={handleRawTextChange}
                        disabled={isBroadcasting}
                        className="font-mono text-xs leading-relaxed"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-amber-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-700">Upload CSV, Excel, or Text file</p>
                      <p className="text-xs text-gray-400 mt-0.5">Supports 1 column of Pakistani phone numbers</p>
                      <Input
                        type="file"
                        accept=".csv,.txt,.text"
                        onChange={handleFileUpload}
                        disabled={isBroadcasting}
                        className="mt-3 max-w-xs mx-auto text-xs"
                      />
                    </div>
                  )}

                  {/* Sanitization Stats Bar */}
                  <div className="bg-gray-50 border rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <span className="text-gray-500 block">Valid Unique</span>
                      <strong className="text-emerald-700 text-sm font-bold font-mono">{parsedRecipients.length}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Duplicates Removed</span>
                      <strong className="text-amber-700 text-sm font-bold font-mono">{duplicateCount}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Invalid Filtered</span>
                      <strong className="text-rose-700 text-sm font-bold font-mono">{invalidCount}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Estimated Meta Cost</span>
                      <strong className="text-blue-700 text-sm font-bold font-mono">~{estimatedPKR.toLocaleString()} PKR</strong>
                    </div>
                  </div>

                  {parsedRecipients.length > 0 && (
                    <p className="text-[11px] text-gray-500">
                      Sample preview of first numbers: <span className="font-mono font-semibold text-gray-700">{parsedRecipients.slice(0, 5).join(', ')}</span>
                      {parsedRecipients.length > 5 && ` (+${parsedRecipients.length - 5} more)`}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Card 2: Campaign & Flyer Configuration */}
              <Card className="border shadow-2xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    2. Campaign Message & Pamphlet Snapshot
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Configure the approved Meta marketing template and flyer snapshot.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold">Campaign Name</Label>
                      <Input
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        disabled={isBroadcasting}
                        placeholder="e.g. October Solar Discount Promotion"
                        className="text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Meta Template</Label>
                      <Select 
                        value={broadcastTemplate} 
                        onValueChange={(val) => val && setBroadcastTemplate(val)}
                        disabled={isBroadcasting}
                      >
                        <SelectTrigger className="text-xs mt-1">
                          <SelectValue placeholder="Select Marketing Template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solar_promotional_offer">
                            solar_promotional_offer (Image Flyer + Promo Offer)
                          </SelectItem>
                          <SelectItem value="operational_broadcast_alert">
                            operational_broadcast_alert (Operational Notice)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Flyer Upload & Snapshot Selection */}
                  <div className="space-y-2 p-3 bg-gray-50/70 rounded-lg border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                        Campaign Flyer / Pamphlet Image
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={flyerInputRef}
                          onChange={handleFlyerUpload}
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploadingFlyer || isBroadcasting}
                          onClick={() => flyerInputRef.current?.click()}
                          className="text-xs font-semibold h-7 px-2.5 bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          {isUploadingFlyer ? (
                            <>
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-1.5 h-3.5 w-3.5" />
                              Upload New Flyer
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isBroadcasting}
                          onClick={() => setPamphletUrl('https://crm.energygurus.online/solar_flyer.png')}
                          className="text-[11px] text-gray-600 h-7 px-2"
                        >
                          Use Default Flyer
                        </Button>
                      </div>
                    </div>

                    <Input
                      value={pamphletUrl}
                      onChange={(e) => setPamphletUrl(e.target.value)}
                      disabled={isBroadcasting}
                      placeholder="Public image URL (or upload a file using the button above)"
                      className="text-xs font-mono bg-white"
                    />
                    <p className="text-[11px] text-gray-500">
                      Upload any solar flyer snapshot (PNG, JPG) or specify a public image URL. Attached automatically to the top of each message.
                    </p>
                  </div>

                  {/* Body Text Editor */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-emerald-600" />
                        Promotional Message Body Text
                      </Label>
                      <span className="text-[11px] font-mono text-gray-500">
                        {broadcastBodyText.length} / 1024 chars
                      </span>
                    </div>
                    <Textarea
                      value={broadcastBodyText}
                      onChange={(e) => setBroadcastBodyText(e.target.value)}
                      disabled={isBroadcasting}
                      rows={7}
                      className="text-xs font-sans leading-relaxed resize-y"
                      placeholder="Enter promotional message content..."
                    />
                    <p className="text-[11px] text-gray-500">
                      This text matches your approved Meta Marketing template. Real-time changes appear in the live WhatsApp preview.
                    </p>
                  </div>

                  {/* Actions & Dispatch Trigger */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    {!isBroadcasting ? (
                      <Button
                        onClick={handleStartCampaign}
                        disabled={parsedRecipients.length === 0}
                        className="w-full sm:w-auto bg-[#002868] hover:bg-[#001d4a] text-white font-bold text-xs px-6 py-2.5 shadow-sm"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Launch Campaign to {parsedRecipients.length} Numbers
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStopCampaign}
                        variant="destructive"
                        className="w-full sm:w-auto font-bold text-xs px-6 py-2.5"
                      >
                        <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                        Pause / Stop Broadcast
                      </Button>
                    )}

                    <span className="text-xs text-gray-500">
                      Dispatched with automated rate pacing to ensure 100% Meta delivery compliance.
                    </span>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Column: Live WhatsApp Mobile Preview & Progress */}
            <div className="space-y-6">
              
              {/* WhatsApp Mock Preview */}
              <Card className="border shadow-2xs overflow-hidden">
                <div className="bg-[#075E54] text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    WhatsApp Message Preview
                  </span>
                  <span className="text-[10px] bg-emerald-700/60 px-2 py-0.5 rounded-full">Marketing Flyer</span>
                </div>
                <CardContent className="p-3 bg-[#E5DDD5]/40 space-y-3">
                  <div className="bg-white rounded-lg p-2.5 shadow-xs border border-gray-100 max-w-sm mx-auto space-y-2">
                    {/* Header Image */}
                    {pamphletUrl ? (
                      <div className="relative rounded-md overflow-hidden bg-gray-100 aspect-16/10 border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={pamphletUrl} 
                          alt="Flyer Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).src = 'https://crm.energygurus.online/solar_flyer.png';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-28 bg-gray-100 rounded-md border border-dashed flex items-center justify-center text-gray-400 text-xs">
                        [ Pamphlet Snapshot Header ]
                      </div>
                    )}

                    {/* Body Text */}
                    <div className="text-xs text-gray-800 leading-relaxed font-sans whitespace-pre-wrap">
                      {broadcastBodyText}
                    </div>

                    <div className="text-[10px] text-gray-400 text-right">
                      12:00 PM • Delivered
                    </div>

                    {/* Quick Reply Buttons */}
                    <div className="border-t pt-2 space-y-1.5">
                      <div className="w-full text-center py-1.5 rounded-md bg-gray-50 border text-blue-600 text-xs font-semibold">
                        💬 Talk to Sales
                      </div>
                      <div className="w-full text-center py-1.5 rounded-md bg-gray-50 border text-blue-600 text-xs font-semibold">
                        ⭐ Interested
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress & Live Activity Box */}
              {(isBroadcasting || broadcastLogs.length > 0) && (
                <Card className="border shadow-2xs">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold">Campaign Progress</CardTitle>
                      <span className="text-xs font-mono font-bold text-gray-600">{broadcastProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-1">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${broadcastProgress}%` }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                        <span className="text-gray-500 block text-[10px]">Delivered</span>
                        <strong className="text-emerald-700 font-bold font-mono text-sm">{broadcastStats.sent}</strong>
                      </div>
                      <div className="bg-rose-50 p-2 rounded border border-rose-100">
                        <span className="text-gray-500 block text-[10px]">Failed</span>
                        <strong className="text-rose-700 font-bold font-mono text-sm">{broadcastStats.failed}</strong>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs border rounded-md p-2 bg-gray-50/50">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Live Dispatch Feed</p>
                      {broadcastLogs.map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-none font-mono text-[11px]">
                          <span>{log.phone}</span>
                          <span className={log.status === 'SENT' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                            {log.status === 'SENT' ? '✓ Sent' : '✕ Failed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

          </div>
        </TabsContent>

        {/* 2. TEST SMS TAB */}
        <TabsContent value="test" className="space-y-6 pt-2">
          <Card>
            <CardHeader>
              <CardTitle>Send Single Test Message</CardTitle>
              <CardDescription>
                Test specific automated notification scenarios on individual customer numbers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template">Message Template</Label>
                  <Select value={selectedTemplate} onValueChange={(val) => val && setSelectedTemplate(val)}>
                    <SelectTrigger className="mt-1 text-xs">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REGISTRATION">1. Registration Complete (CRF)</SelectItem>
                      <SelectItem value="INVOICE">2. Monthly Invoice Generated</SelectItem>
                      <SelectItem value="DUE_REMINDER">3. Payment Due Reminder</SelectItem>
                      <SelectItem value="PAYMENT_RECEIVED">5. Payment Received</SelectItem>
                      <SelectItem value="COMPLAINT_REGISTERED">10. Support Ticket Registered</SelectItem>
                      <SelectItem value="COMPLAINT_RESOLVED">11. Ticket Resolved</SelectItem>
                      <SelectItem value="SOLAR_REPORT">12. Solar Performance Report</SelectItem>
                      <SelectItem value="CUSTOM">Custom Free-form Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="customerId">Customer ID</Label>
                  <Input
                    id="customerId"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="Enter customer ID"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {selectedTemplate === 'CUSTOM' && (
                <div>
                  <Label htmlFor="customMessage">Custom Message</Label>
                  <Textarea
                    id="customMessage"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter custom text message"
                    rows={3}
                    className="mt-1 text-xs"
                  />
                </div>
              )}

              <Button 
                onClick={sendTestSMS} 
                disabled={loading || !selectedTemplate || !customerId}
                className="w-full text-xs font-bold"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send Test Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. TEMPLATES TAB (Showing all 14 official templates) */}
        <TabsContent value="templates" className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing all <strong>14 WhatsApp templates</strong> configured for Energy Gurus CRM.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">12 UTILITY</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-medium">2 MARKETING</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(templates).map(([key, template]) => (
              <Card key={key} className="flex flex-col justify-between border shadow-2xs hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold leading-snug">{template.name}</CardTitle>
                    {template.category && (
                      <Badge className={template.category === 'UTILITY' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 shrink-0 text-xs' : 'bg-purple-100 text-purple-800 hover:bg-purple-100 shrink-0 text-xs'}>
                        {template.category}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs text-gray-500 mt-1">{template.description}</CardDescription>
                  <div className="flex flex-wrap gap-1.5 pt-2 text-[11px]">
                    {template.metaTemplateName && (
                      <span className="px-2 py-0.5 rounded bg-gray-100 font-mono text-gray-700 font-medium">
                        Meta: {template.metaTemplateName}
                      </span>
                    )}
                    {template.headerType && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                        Header: {template.headerType}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                    <pre className="whitespace-pre-wrap text-xs font-mono text-gray-800 leading-relaxed">{template.sample}</pre>
                  </div>
                  {template.trigger && (
                    <p className="text-[11px] text-gray-400 italic">
                      Trigger: {template.trigger}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 4. ACTIVITY LOGS TAB */}
        <TabsContent value="logs" className="space-y-6 pt-2">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                View delivery receipts and statuses for recent broadcasts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {broadcastLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-xs">
                  No recent broadcast logs. Launch a campaign from the Marketing Broadcast tab to see live activity here.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {broadcastLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 border rounded-lg text-xs font-mono">
                      <div className="flex items-center gap-2">
                        {log.status === 'SENT' ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-600" />
                        )}
                        <span className="font-bold">{log.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {log.error && <span className="text-rose-500 text-[11px] truncate max-w-xs">{log.error}</span>}
                        <span className="text-gray-400 text-[11px]">{log.timestamp}</span>
                        <Badge className={log.status === 'SENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}>
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}