import React, { useState } from 'react';
import {
  Megaphone,
  Upload,
  Play,
  Pause,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sliders,
  Plus
} from 'lucide-react';

export default function BulkCampaignsView({ campaigns = [], employees = [], onCreateCampaign, onNavigate }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [contacts, setContacts] = useState([]);
  const [invalidRows, setInvalidRows] = useState(0);
  const [importError, setImportError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [concurrency, setConcurrency] = useState(5);
  const [cpsPacing, setCpsPacing] = useState(2.5);
  const readyEmployees = employees.filter(employee => ['active', 'ready'].includes(employee.status));
  const openCreateModal = () => {
    setEmployeeId(readyEmployees[0]?.id || '');
    setShowCreateModal(true);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    setImportError('');
    setContacts([]);
    setInvalidRows(0);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportError('Choose a CSV file with Name and Phone columns.');
      return;
    }
    const rows = (await file.text()).split(/\r?\n/).filter(row => row.trim());
    if (rows.length < 2) {
      setImportError('The CSV needs a header row and at least one contact.');
      return;
    }
    const splitCsvRow = (row) => row.match(/("(?:[^"]|"")*"|[^,]*)(,|$)/g)
      ?.map(value => value.replace(/,$/, '').trim().replace(/^"|"$/g, '').replace(/""/g, '"')) || [];
    const headers = splitCsvRow(rows[0]).map(value => value.toLowerCase());
    const nameIndex = headers.findIndex(value => ['name', 'full name', 'contact name'].includes(value));
    const phoneIndex = headers.findIndex(value => ['phone', 'phone number', 'mobile', 'mobile number'].includes(value));
    if (nameIndex < 0 || phoneIndex < 0) {
      setImportError('CSV headers must include Name and Phone (or Mobile).');
      return;
    }
    const parsed = rows.slice(1).map(row => {
      const values = splitCsvRow(row);
      return { name: values[nameIndex] || '', phone: values[phoneIndex] || '' };
    });
    const valid = parsed.filter(contact => contact.name.trim() && /^\+?[0-9\s()-]{8,20}$/.test(contact.phone.trim()));
    setContacts(valid.map(contact => ({ name: contact.name.trim(), phone: contact.phone.trim() })));
    setInvalidRows(parsed.length - valid.length);
    if (!valid.length) setImportError('No valid contacts found. Check the name and phone values.');
  };

  const handleCreate = async () => {
    if (!campaignName.trim() || !readyEmployees.some(employee => employee.id === employeeId) || contacts.length === 0 || invalidRows > 0 || isSaving) return;
    setIsSaving(true);
    const saved = await onCreateCampaign({
      name: campaignName.trim(),
      employee_id: employeeId,
      leads: contacts,
      concurrency: Number(concurrency),
      pacing_cps: Number(cpsPacing)
    });
    setIsSaving(false);
    if (saved) {
      setShowCreateModal(false);
      setCampaignName('');
      setContacts([]);
      setInvalidRows(0);
    }
  };

  return (
    <div className="p-8 max-w-[1160px] mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e4ed] pb-5">
        <div>
          <div className="text-[11px] font-bold text-[#6c6b7e] uppercase tracking-wider mb-1 font-mono">
            Calling Channels · Bulk
          </div>
          <h1 className="text-2xl font-bold text-[#0f0e17] tracking-tight font-display">
            Bulk Campaigns
          </h1>
          <p className="text-sm text-[#6c6b7e] mt-1">
            Assign a published AI employee, import contacts, and save a paused draft for review.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-all"
        >
          <Plus className="w-4 h-4" /> Create Campaign
        </button>
      </div>

      {/* 3-Step Flow Diagram (Apple Liquid Glass) */}
      <div className="apple-glass rounded-2xl p-7 border border-[#e2e4ed]">
        <h2 className="text-xl font-bold text-[#0f0e17] text-center mb-1 font-display">
          Prepare and review calling drafts in one place.
        </h2>
        <p className="text-xs text-[#6c6b7e] text-center mb-8 max-w-lg mx-auto">
          Select an employee, validate contacts, and save a draft. This screen does not start calls.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="apple-glass rounded-xl p-5 text-center relative border border-[#e2e4ed]">
            <span className="text-[10px] font-bold text-[#6c6b7e] absolute top-3 right-3 font-mono">01</span>
            <div className="w-12 h-12 rounded-xl bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] flex items-center justify-center mx-auto mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="text-lg font-bold text-[#0f0e17] font-mono">{campaigns.reduce((total, campaign) => total + (campaign.total_leads || 0), 0)}</div>
            <div className="text-[11px] font-medium text-[#6c6b7e] mb-2 font-mono">contacts imported</div>
            <h4 className="text-xs font-bold text-[#0f0e17]">Upload a CSV list</h4>
            <p className="text-[11px] text-[#6c6b7e] mt-1">Required columns: Name, Phone.</p>
          </div>

          {/* Step 2 */}
          <div className="apple-glass rounded-xl p-5 text-center relative border border-[#e2e4ed]">
            <span className="text-[10px] font-bold text-[#6c6b7e] absolute top-3 right-3 font-mono">02</span>
            <div className="w-12 h-12 rounded-xl bg-[#f6f7fb] text-[#0f0e17] border border-[#e2e4ed] flex items-center justify-center mx-auto mb-3">
              <Megaphone className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-[#0f0e17] bg-[#f6f7fb] border border-[#e2e4ed] px-2 py-0.5 rounded-full inline-block mb-1">
              • Dialer not connected
            </div>
            <div className="text-xs text-[#3a3f5c] mb-2 font-medium">No calls are placed from this workspace</div>
            <h4 className="text-xs font-bold text-[#0f0e17]">Draft stays paused</h4>
            <p className="text-[11px] text-[#6c6b7e] mt-1">Connect a compliant dialer before launching.</p>
          </div>

          {/* Step 3 */}
          <div className="apple-glass rounded-xl p-5 text-center relative border border-[#e2e4ed]">
            <span className="text-[10px] font-bold text-[#6c6b7e] absolute top-3 right-3 font-mono">03</span>
            <div className="w-12 h-12 rounded-full border-4 border-[#0f0e17] border-t-[#e2e4ed] flex items-center justify-center mx-auto mb-3 text-xs font-bold text-[#0f0e17] font-mono">
              {campaigns.length}
            </div>
            <div className="text-xs text-[#6c6b7e] mb-2 font-medium font-mono">saved in this workspace</div>
            <h4 className="text-xs font-bold text-[#0f0e17]">Review campaign drafts</h4>
            <p className="text-[11px] text-[#6c6b7e] mt-1">Contact data is stored for setup and review.</p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={openCreateModal}
            className="bg-[#0f0e17] hover:bg-[#1f1e28] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer transition-all"
          >
            {campaigns.length > 0 ? 'Create another campaign' : 'Create your first campaign'}
          </button>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#6c6b7e] font-mono">Campaign drafts</h3>
        {campaigns.length > 0 ? (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="apple-glass rounded-xl p-4 flex items-center justify-between border border-[#e2e4ed]">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-[#0f0e17]">{c.name}</h4>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 uppercase font-mono">
                      {c.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#6c6b7e] mt-1 font-mono">
                    <span>{c.total_leads} contacts imported</span>
                    <span>·</span>
                    <span>Employee: {employees.find(employee => employee.id === c.employee_id)?.name || 'Unavailable'}</span>
                    <span>·</span>
                    <span>Pacing: {c.pacing_cps || 2.5} CPS</span>
                    <span>·</span>
                    <span>Window: {c.calling_window || '09:00-21:00'} IST (review required)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#0f0e17] font-mono">{c.called_leads || 0} / {c.total_leads}</div>
                    <div className="text-[10px] text-[#6c6b7e]">calls placed (draft: 0)</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="apple-glass rounded-xl p-6 text-center text-xs text-[#6c6b7e] border border-dashed border-[#e2e4ed]">
            No campaign drafts yet. Import a CSV to create the first draft.
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="apple-glass rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-white/80 bg-white/95 backdrop-blur-2xl">
            <h3 className="text-sm font-bold text-[#0f0e17]">Create Outbound Campaign</h3>
            <div>
              <label className="block text-xs font-bold text-[#0f0e17] mb-1">Campaign Name</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="apple-glass-input w-full p-2.5 text-xs font-medium text-[#0f0e17]"
              />
            </div>

            <div>
              <label htmlFor="campaign-employee" className="block text-xs font-bold text-[#0f0e17] mb-1">Published AI employee</label>
              {readyEmployees.length > 0 ? (
                <select
                  id="campaign-employee"
                  value={employeeId}
                  onChange={event => setEmployeeId(event.target.value)}
                  className="apple-glass-input w-full p-2.5 text-xs font-medium text-[#0f0e17]"
                >
                  {readyEmployees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              ) : (
                <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  Publish an employee before creating a campaign.
                  <button
                    type="button"
                    onClick={() => onNavigate?.('my-employees')}
                    className="ml-1 font-bold underline"
                  >
                    Review employees
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0f0e17] mb-1">Total Contacts</label>
              <input type="file" accept=".csv,text/csv" onChange={handleFileChange} className="block w-full text-xs text-[#3a3f5c] file:mr-3 file:rounded-lg file:border-0 file:bg-[#f0f1f6] file:px-3 file:py-2 file:text-xs file:font-semibold" />
              <p className="mt-1 text-[11px] text-[#6c6b7e]">CSV columns: Name, Phone. Maximum 5,000 contacts.</p>
              {contacts.length > 0 && <p className="mt-2 text-xs font-semibold text-emerald-700">{contacts.length} valid contacts ready to import.</p>}
              {invalidRows > 0 && <p className="mt-1 text-xs text-red-700">{invalidRows} invalid rows; fix the file before saving.</p>}
              {importError && <p role="alert" className="mt-1 text-xs text-red-700">{importError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0f0e17] mb-1">Concurrency (Lines)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={concurrency}
                  onChange={(e) => setConcurrency(e.target.value)}
                  className="apple-glass-input w-full p-2.5 text-xs font-medium text-[#0f0e17]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0f0e17] mb-1">Dial Pacing (CPS)</label>
                <input
                  type="number"
                  min="0.1"
                  max="10"
                  step="0.5"
                  value={cpsPacing}
                  onChange={(e) => setCpsPacing(e.target.value)}
                  className="apple-glass-input w-full p-2.5 text-xs font-medium text-[#0f0e17]"
                />
              </div>
            </div>

            <div className="bg-[#f8f9fc] border border-[#e2e4ed] rounded-xl p-3 text-[11px] text-[#3a3f5c] space-y-1">
              <div className="font-bold text-[#0f0e17]">Before any launch:</div>
              <p>• Saving creates a paused draft and does not place calls.</p>
              <p>• Confirm contact permission and complete applicable DND/compliance checks separately.</p>
              <p>• A connected dialer and launch review are required before calls can run.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 text-xs text-[#6c6b7e] hover:bg-[#f0f1f6] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSaving || readyEmployees.length === 0 || !readyEmployees.some(employee => employee.id === employeeId) || !campaignName.trim() || contacts.length === 0 || invalidRows > 0}
                className="px-4 py-2 text-xs bg-[#0f0e17] text-white font-bold rounded-xl hover:bg-[#1f1e28] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                {isSaving ? 'Saving…' : 'Save campaign draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
