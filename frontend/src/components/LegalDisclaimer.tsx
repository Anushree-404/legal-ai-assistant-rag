import { AlertTriangle } from 'lucide-react'

export function LegalDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
      <p>
        <strong>Legal Disclaimer:</strong> This tool provides general legal information only — not
        legal advice. It does not create an attorney-client relationship and cannot replace
        consultation with a licensed attorney. Do not rely on this information for time-sensitive
        legal matters.
      </p>
    </div>
  )
}
