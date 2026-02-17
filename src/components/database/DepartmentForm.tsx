"use client";

import { useState } from "react";
import type { Vendor } from "@/types";

interface DepartmentFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    budget: number;
    primaryVendor: Vendor;
  }) => void;
  onCancel: () => void;
}

export function DepartmentForm({ onSubmit, onCancel }: DepartmentFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState(0);
  const [primaryVendor, setPrimaryVendor] = useState<Vendor>("anthropic");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSubmit({ name, description, budget, primaryVendor });
  };

  const inputClass = "w-full rounded border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-slate-900 p-6 border border-slate-700">
        <h2 className="mb-4 text-lg font-bold text-white">Add Department</h2>

        <div className="flex flex-col gap-3">
          <div>
            <label className={labelClass}>Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Budget ($)</label>
              <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className={inputClass} min={0} />
            </div>
            <div>
              <label className={labelClass}>Primary Vendor</label>
              <select value={primaryVendor} onChange={(e) => setPrimaryVendor(e.target.value as Vendor)} className={inputClass}>
                <option value="anthropic">Anthropic</option>
                <option value="openai">OpenAI</option>
                <option value="google">Google</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded px-4 py-2 text-sm text-slate-400 hover:text-white">
            Cancel
          </button>
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
            Create Department
          </button>
        </div>
      </form>
    </div>
  );
}
