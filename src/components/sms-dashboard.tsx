'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';

interface SMSTemplate {
  name: string;
  description: string;
  sample: string;
}

interface SMSLog {
  id: string;
  recipient: string;
  messageBody: string;
  status: string;
  createdAt: string;
  type: string;
}

export default function SMSDashboard() {
  const [templates, setTemplates] = useState<Record<string, SMSTemplate>>({});
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [testData, setTestData] = useState({
    invoiceId: '',
    ticketId: '',
    transactionId: '',
    solarUnits: { today: 45, mtd: 1350, ytd: 16200 }
  });

  useEffect(() => {
    loadTemplates();
    loadRecentLogs();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/sms/templates');
      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadRecentLogs = async () => {
    try {
      // This would need to be implemented in the API
      // const response = await fetch('/api/sms/logs?limit=20');
      // const data = await response.json();
      // setLogs(data.logs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

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

      // Add additional required fields based on template type
      switch (selectedTemplate) {
        case 'INVOICE':
          if (!testData.invoiceId) {
            setError('Invoice ID is required for invoice SMS');
            return;
          }
          payload.invoiceId = testData.invoiceId;
          break;
        case 'DUE_REMINDER':
          if (!testData.invoiceId) {
            setError('Invoice ID is required for due reminder SMS');
            return;
          }
          payload.invoiceId = testData.invoiceId;
          break;
        case 'PAYMENT_RECEIVED':
          if (!testData.transactionId) {
            setError('Transaction ID is required for payment received SMS');
            return;
          }
          payload.transactionId = testData.transactionId;
          break;
        case 'COMPLAINT_REGISTERED':
        case 'COMPLAINT_RESOLVED':
          if (!testData.ticketId) {
            setError('Ticket ID is required for complaint SMS');
            return;
          }
          payload.ticketId = testData.ticketId;
          break;
        case 'SOLAR_REPORT':
          payload.solarData = testData.solarUnits;
          break;
        case 'CUSTOM':
          if (!customMessage) {
            setError('Custom message is required');
            return;
          }
          payload.message = customMessage;
          break;
      }

      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('SMS sent successfully!');
        loadRecentLogs();
      } else {
        setError(result.error || 'Failed to send SMS');
      }
    } catch (error) {
      setError('Failed to send SMS: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const sendBulkReminders = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/sms/bulk-reminders', {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(`Bulk reminders sent: ${result.sent} sent, ${result.failed} failed`);
      } else {
        setError('Failed to send bulk reminders');
      }
    } catch (error) {
      setError('Failed to send bulk reminders: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SMS Dashboard</h1>
          <p className="text-gray-600">Manage and test SMS notifications</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={sendBulkReminders} 
            variant="outline"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Bulk Reminders
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="test" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="test">Test SMS</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">SMS Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Test SMS</CardTitle>
              <CardDescription>
                Test SMS notifications with sample data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template">SMS Template</Label>
                  <Select value={selectedTemplate} onValueChange={(val) => val && setSelectedTemplate(val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REGISTRATION">Registration Complete</SelectItem>
                      <SelectItem value="INVOICE">Invoice Generated</SelectItem>
                      <SelectItem value="DUE_REMINDER">Payment Due Reminder</SelectItem>
                      <SelectItem value="PAYMENT_RECEIVED">Payment Received</SelectItem>
                      <SelectItem value="COMPLAINT_REGISTERED">Complaint Registered</SelectItem>
                      <SelectItem value="COMPLAINT_RESOLVED">Complaint Resolved</SelectItem>
                      <SelectItem value="SOLAR_REPORT">Daily Solar Report</SelectItem>
                      <SelectItem value="CUSTOM">Custom Message</SelectItem>
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
                    placeholder="Enter your custom message"
                    rows={3}
                  />
                </div>
              )}

              {(selectedTemplate === 'INVOICE' || selectedTemplate === 'DUE_REMINDER') && (
                <div>
                  <Label htmlFor="invoiceId">Invoice ID</Label>
                  <Input
                    id="invoiceId"
                    value={testData.invoiceId}
                    onChange={(e) => setTestData({...testData, invoiceId: e.target.value})}
                    placeholder="Enter invoice ID"
                  />
                </div>
              )}

              {selectedTemplate === 'PAYMENT_RECEIVED' && (
                <div>
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    value={testData.transactionId}
                    onChange={(e) => setTestData({...testData, transactionId: e.target.value})}
                    placeholder="Enter transaction ID"
                  />
                </div>
              )}

              {(selectedTemplate === 'COMPLAINT_REGISTERED' || selectedTemplate === 'COMPLAINT_RESOLVED') && (
                <div>
                  <Label htmlFor="ticketId">Ticket ID</Label>
                  <Input
                    id="ticketId"
                    value={testData.ticketId}
                    onChange={(e) => setTestData({...testData, ticketId: e.target.value})}
                    placeholder="Enter ticket ID"
                  />
                </div>
              )}

              {selectedTemplate === 'SOLAR_REPORT' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Today Units</Label>
                    <Input
                      type="number"
                      value={testData.solarUnits.today}
                      onChange={(e) => setTestData({
                        ...testData, 
                        solarUnits: {...testData.solarUnits, today: Number(e.target.value)}
                      })}
                    />
                  </div>
                  <div>
                    <Label>MTD Units</Label>
                    <Input
                      type="number"
                      value={testData.solarUnits.mtd}
                      onChange={(e) => setTestData({
                        ...testData, 
                        solarUnits: {...testData.solarUnits, mtd: Number(e.target.value)}
                      })}
                    />
                  </div>
                  <div>
                    <Label>YTD Units</Label>
                    <Input
                      type="number"
                      value={testData.solarUnits.ytd}
                      onChange={(e) => setTestData({
                        ...testData, 
                        solarUnits: {...testData.solarUnits, ytd: Number(e.target.value)}
                      })}
                    />
                  </div>
                </div>
              )}

              <Button 
                onClick={sendTestSMS} 
                disabled={loading || !selectedTemplate || !customerId}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Test SMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(templates).map(([key, template]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">{template.sample}</pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent SMS Logs</CardTitle>
              <CardDescription>
                View recent SMS notifications sent from the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No SMS logs available. Send some test messages to see logs here.
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <div className="font-medium">{log.recipient}</div>
                          <div className="text-sm text-gray-600 truncate max-w-md">
                            {log.messageBody}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusBadgeColor(log.status)}>
                          {log.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
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