'use client';

import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  error?: string;
  helper?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, error, helper, required, children }: FieldProps) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {error && <p className="error-text">{error}</p>}
      {helper && !error && <p className="helper">{helper}</p>}
    </div>
  );
}
