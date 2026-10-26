import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, PhoneIncoming, UserRound, ArrowRight, RefreshCw } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function InboundDeskView({ employees = [], onNavigate }) {
  const [numbers, setNumbers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadNumbers = useCallback(async (signal) => {
    setIsLoading(true);
    setLoadError('');
    try {
      const response = await apiFetch('/api/phone-numbers', { signal });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Phone line status could not be loaded.');
      if (!Array.isArray(data)) throw new Error('Phone line status returned an invalid response.');
      setNumbers(data);
    } catch (error) {
      if (error.name === 'AbortError') return;
      setNumbers([]);
      setLoadError(error.message || 'Phone line status could not be loaded.');
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadNumbers(controller.signal);
    return () => controller.abort();
  }, [loadNumbers]);

  const publishedEmployees = employees.filter(employee => ['active', 'ready'].includes(employee.status));
  const activeNumbers = numbers.filter(number => number.status === 'active');

  return (
    <main className="mx-auto max-w-[1160px] space-y-6 p-4 font-sans text-[#0f0e17] sm:p-8">
      <header className="border-b border-[#e2e4ed] pb-5">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#6c6b7e]">Channels · Inbound</div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Inbound desk</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#6c6b7e]">
          Prepare a multilingual receptionist and verify your phone-line setup. An employee draft or an unconnected carrier cannot answer real calls.
        </p>
      </header>

      <section role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-bold text-amber-950">Inbound carrier routing is not connected in this app yet</h2>
            <p className="mt-1 text-sm text-amber-900">
              The workspace can prepare an employee, but this deployment does not yet connect a carrier inbound webhook to the voice session. Do not advertise 24/7 live answering until carrier routing is integrated and tested.
            </p>
          </div>
        </div>
      </section>

      {loadError && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => loadNumbers()}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-300 px-3 py-2 font-semibold hover:bg-red-100 disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      <section aria-labelledby="inbound-setup-heading">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="inbound-setup-heading" className="text-sm font-bold">Setup checklist</h2>
          {isLoading && <span className="text-xs text-[#6c6b7e]">Checking workspace…</span>}
        </div>
        <div className="divide-y divide-[#e2e4ed] rounded-2xl border border-[#e2e4ed] bg-white px-4">
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <PhoneIncoming className="mt-0.5 h-5 w-5 shrink-0 text-[#3a3f5c]" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-semibold">Provision a business phone line</h3>
                <p className="mt-1 text-xs text-[#6c6b7e]">
                  {isLoading ? 'Loading provisioned line status.' : loadError ? 'Line status could not be verified.' : `${activeNumbers.length} active line${activeNumbers.length === 1 ? '' : 's'} found in this workspace.`}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => onNavigate?.('phone-numbers')} className="inline-flex items-center gap-2 self-start rounded-lg border border-[#d4d7e0] px-3 py-2 text-xs font-semibold hover:bg-[#f6f7fb] sm:self-center">
              View phone lines <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-[#3a3f5c]" aria-hidden="true" />
              <div>
                <h3 className="text-sm font-semibold">Create and publish an inbound employee</h3>
                <p className="mt-1 text-xs text-[#6c6b7e]">
                  {publishedEmployees.length} published employee{publishedEmployees.length === 1 ? '' : 's'} available. Drafts need review before use.
                </p>
              </div>
            </div>
            {publishedEmployees.length ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-800" aria-label="Published employee available" />
            ) : (
              <button type="button" onClick={() => onNavigate?.(employees.some(employee => employee.status === 'draft') ? 'my-employees' : 'new-employee')} className="inline-flex items-center gap-2 self-start rounded-lg border border-[#d4d7e0] px-3 py-2 text-xs font-semibold hover:bg-[#f6f7fb] sm:self-center">
                {employees.some(employee => employee.status === 'draft') ? 'Review employee draft' : 'Create employee'}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex items-start gap-3 py-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-800" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-semibold">Connect and test carrier routing</h3>
              <p className="mt-1 text-xs text-[#6c6b7e]">
                Not configured here. A visible phone number alone does not confirm an inbound route, answer coverage, failover, or emergency handling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {activeNumbers.length > 0 && (
        <section aria-labelledby="lines-heading" className="rounded-2xl border border-[#e2e4ed] bg-white p-4 sm:p-5">
          <h2 id="lines-heading" className="text-sm font-bold">Provisioned line records</h2>
          <p className="mt-1 text-xs text-[#6c6b7e]">Inventory records only; these do not verify working inbound carrier routing.</p>
          <ul className="mt-3 divide-y divide-[#e2e4ed]">
            {activeNumbers.map(number => (
              <li key={number.id || number.number} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="font-mono font-semibold">{number.number}</span>
                <span className="text-xs text-[#6c6b7e]">
                  Assigned employee: {employees.find(employee => employee.id === number.employee_id)?.name || 'Not assigned'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
