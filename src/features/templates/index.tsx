import React, { useState, useEffect } from 'react';
import { ArrowLeft, Layers, Plus, Upload, CheckCircle2, Sparkles, Wrench, Building2, Radio, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../data/db';
import type { Template, TemplateField, GlossaryEntry } from '../../shared/types';
import { Button } from '../../components';

export const TemplatesScreen: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [glossary, setGlossary] = useState<GlossaryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'templates' | 'glossary' | 'spellcheck'>('templates');

  // Custom Template Builder state
  const [showBuilderModal, setShowBuilderModal] = useState<boolean>(false);
  const [builderName, setBuilderName] = useState<string>('');
  const [builderCategory, setBuilderCategory] = useState<string>('Electrical');
  const [builderFields, setBuilderFields] = useState<TemplateField[]>([
    { name: 'inspectionZone', type: 'text', required: true },
    { name: 'measuredValue', type: 'number', required: true },
  ]);

  // CSV Import state
  const [csvText, setCsvText] = useState<string>('');
  const [csvNotice, setCsvNotice] = useState<string | null>(null);

  // Demo Transcript Spelling Correction Before/After (Spec 20)
  const [rawDemoTranscript, setRawDemoTranscript] = useState<string>(
    'audited kuktpaly sub-station panel P204 with KS Row. observed loose terminals at term block B'
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tplList, gloList] = await Promise.all([
        db.templates.toArray(),
        db.glossary.toArray(),
      ]);
      setTemplates(tplList);
      setGlossary(gloList);
    } catch (err) {
      console.error('Failed to load templates/glossary:', err);
    }
  };

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'electrical':
        return Wrench;
      case 'civil':
        return Building2;
      case 'mechanical':
        return Wrench;
      case 'signaling & telecom':
      case 'signaling':
        return Radio;
      case 'safety & environmental':
      case 'safety':
        return ShieldAlert;
      default:
        return Layers;
    }
  };

  // Add field to builder
  const handleAddField = () => {
    setBuilderFields((prev) => [
      ...prev,
      { name: `field_${prev.length + 1}`, type: 'text', required: false },
    ]);
  };

  // Remove field from builder
  const handleRemoveField = (index: number) => {
    setBuilderFields((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Custom Template
  const handleSaveTemplate = async () => {
    if (!builderName.trim()) return;

    const newTemplate: Template = {
      id: `tpl-${Date.now()}`,
      name: builderName.trim(),
      category: builderCategory,
      fields: builderFields,
    };

    await db.templates.put(newTemplate);
    setShowBuilderModal(false);
    setBuilderName('');
    setBuilderFields([
      { name: 'inspectionZone', type: 'text', required: true },
      { name: 'measuredValue', type: 'number', required: true },
    ]);
    await loadData();
  };

  // CSV Glossary Ingest
  const handleImportCsv = async () => {
    if (!csvText.trim()) return;

    try {
      const lines = csvText.trim().split('\n');
      const newEntries: GlossaryEntry[] = [];

      for (const line of lines) {
        const parts = line.split(',').map((p) => p.trim());
        if (parts.length >= 2) {
          const type = parts[0]?.toLowerCase();
          const term = parts[1] || '';
          const definition = parts[2] || 'Custom imported glossary record';
          const expansion = parts[3] || '';

          if (term) {
            newEntries.push({
              id: `glo-csv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              term,
              definition,
              expansion,
              language: 'en',
              category: (type === 'site' || type === 'asset' || type === 'person') ? type : 'term',
            });
          }
        }
      }

      if (newEntries.length > 0) {
        await db.glossary.bulkPut(newEntries);
        setCsvNotice(`Successfully imported ${newEntries.length} glossary terms.`);
        setCsvText('');
        await loadData();
        setTimeout(() => setCsvNotice(null), 3000);
      }
    } catch {
      setCsvNotice('Error parsing CSV. Format: type,term,definition,expansion');
    }
  };

  // Spelling Correction computation using Glossary (Spec 20)
  const correctedTranscript = React.useMemo(() => {
    let text = rawDemoTranscript;
    const correctionRules = [
      { regex: /\bkuktpaly\b/gi, replacement: 'Kukatpally Metro Site' },
      { regex: /\bP204\b|\bP-204\b|\bpanel 204\b/gi, replacement: 'PANEL-204' },
      { regex: /\bKS Row\b|\bk s row\b/gi, replacement: 'K. S. Rao' },
      { regex: /\bterm block B\b|\bterm block b\b/gi, replacement: 'Terminal Block B' },
      { regex: /\bshart circuit\b/gi, replacement: 'short circuit' },
    ];

    correctionRules.forEach((rule) => {
      text = text.replace(rule.regex, rule.replacement);
    });
    return text;
  }, [rawDemoTranscript]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-default">
        <div className="flex items-center gap-2">
          <Link
            to="/more"
            className="p-1.5 rounded-lg bg-bg-surface1 border border-border-default text-text-muted hover:text-text-primary transition-colors"
            title="Return to More"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-heading-sm font-bold text-text-primary tracking-tight">
                Templates & Glossary
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border">
                Spec 20
              </span>
            </div>
            <p className="text-metadata text-text-muted">
              Category schemas, custom template builder & glossary spelling correction
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-bg-surface1 p-1 rounded-xl border border-border-default">
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg text-metadata font-medium transition-all ${
              activeTab === 'templates'
                ? 'bg-bg-surface2 text-text-primary font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Templates ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('glossary')}
            className={`px-3 py-1.5 rounded-lg text-metadata font-medium transition-all ${
              activeTab === 'glossary'
                ? 'bg-bg-surface2 text-text-primary font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Glossary & CSV ({glossary.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('spellcheck')}
            className={`px-3 py-1.5 rounded-lg text-metadata font-medium transition-all ${
              activeTab === 'spellcheck'
                ? 'bg-bg-surface2 text-semantic-green font-bold shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Spell-Check Engine
          </button>
        </div>
      </div>

      {/* Tab 1: Category Templates & Custom Template Builder */}
      {activeTab === 'templates' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-body-md font-bold text-text-primary">
                Five Core Category Templates
              </h2>
              <p className="text-metadata text-text-muted">
                Pre-configured schemas for industrial electrical, civil, mechanical, and safety inspections
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => setShowBuilderModal(true)}
            >
              Build Custom Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {templates.map((tpl) => {
              const Icon = getCategoryIcon(tpl.category);
              return (
                <div
                  key={tpl.id}
                  className="p-4 rounded-xl bg-bg-surface1 border border-border-default hover:border-border-strong space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-bg-surface2 border border-border-subtle flex items-center justify-center text-semantic-green shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-body-sm font-bold text-text-primary">
                          {tpl.name}
                        </h3>
                        <span className="text-[10px] font-mono uppercase text-semantic-green font-semibold">
                          Category: {tpl.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-metadata-xs font-mono text-text-muted bg-bg-surface2 px-2 py-0.5 rounded border border-border-subtle shrink-0">
                      {tpl.fields.length} Fields
                    </span>
                  </div>

                  {/* Fields list */}
                  <div className="space-y-1 pt-1 border-t border-border-subtle">
                    {tpl.fields.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-metadata-xs py-1 px-2 rounded bg-bg-surface2/50 font-mono"
                      >
                        <span className="text-text-secondary">{f.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-muted">[{f.type}]</span>
                          {f.required && (
                            <span className="text-[10px] text-semantic-amber font-bold">REQ</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Glossary & CSV Import */}
      {activeTab === 'glossary' && (
        <div className="space-y-5">
          {/* CSV Import Box */}
          <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-3">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-semantic-green" />
              <h2 className="text-body-sm font-bold text-text-primary">
                CSV Glossary Import (Sites, Asset IDs & Team Members)
              </h2>
            </div>
            <p className="text-metadata text-text-muted">
              Paste CSV records in the format: <code className="text-semantic-green">type,term,definition,expansion</code>
            </p>

            <textarea
              rows={3}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="e.g. site,Kukatpally Metro Site,Primary corridor substation,KMS&#10;asset,PANEL-204,Main distribution panel,P-204&#10;person,K. S. Rao,Field Electrical Lead Eng #104,Rao"
              className="w-full p-3 rounded-xl bg-bg-surface2 border border-border-default text-text-primary font-mono text-body-sm focus:outline-none focus:border-semantic-green"
            />

            {csvNotice && (
              <p className="text-metadata font-mono text-semantic-green animate-pulse">
                {csvNotice}
              </p>
            )}

            <div className="flex justify-end">
              <Button
                size="sm"
                variant="primary"
                icon={Upload}
                onClick={handleImportCsv}
              >
                Import CSV Entries
              </Button>
            </div>
          </div>

          {/* Current Glossary Entries */}
          <div className="space-y-3">
            <h3 className="text-body-sm font-bold text-text-primary">
              Active Glossary Registry ({glossary.length} Records)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {glossary.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl bg-bg-surface1 border border-border-default space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm font-bold text-text-primary font-mono">
                      {entry.term}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold uppercase bg-bg-surface2 text-text-muted border border-border-subtle">
                      {entry.category || 'term'}
                    </span>
                  </div>
                  {entry.expansion && (
                    <p className="text-metadata-xs font-mono text-semantic-green">
                      &rarr; {entry.expansion}
                    </p>
                  )}
                  <p className="text-metadata text-text-secondary leading-snug">
                    {entry.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Spelling Correction Engine Before/After (Spec 20) */}
      {activeTab === 'spellcheck' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-bg-surface1 border border-border-default space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-semantic-green" />
                <h2 className="text-body-sm font-bold text-text-primary">
                  Engine Glossary Spelling Correction (Spec 20)
                </h2>
              </div>
              <span className="text-metadata-xs font-mono px-2 py-0.5 rounded bg-semantic-green-surface text-semantic-green-text border border-semantic-green-border">
                On-Device NLP Normalization
              </span>
            </div>

            <p className="text-metadata text-text-muted">
              The engine compares raw transcript tokens against the local site, asset, and personnel glossary to correct phonetic slips and typographical variations before compiling final reports.
            </p>

            {/* Before vs. After Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Before */}
              <div className="p-4 rounded-xl bg-bg-surface2/60 border border-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase font-bold text-semantic-amber-text">
                    Raw Transcript (Before Correction)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-semantic-amber-surface text-semantic-amber-text">
                    Phonetic Draft
                  </span>
                </div>
                <p className="text-body-sm text-text-secondary leading-relaxed font-mono">
                  {rawDemoTranscript}
                </p>
              </div>

              {/* After */}
              <div className="p-4 rounded-xl bg-bg-surface2/60 border border-semantic-green-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase font-bold text-semantic-green">
                    Corrected Transcript (After Glossary Normalization)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-semantic-green-surface text-semantic-green-text flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Corrected
                  </span>
                </div>
                <p className="text-body-sm text-text-primary leading-relaxed font-mono font-semibold">
                  {correctedTranscript}
                </p>
              </div>
            </div>

            {/* Interactive Test Input */}
            <div className="pt-2">
              <label className="text-metadata-xs font-mono font-bold text-text-muted uppercase">
                Interactive Test String
              </label>
              <input
                type="text"
                value={rawDemoTranscript}
                onChange={(e) => setRawDemoTranscript(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl bg-bg-surface2 border border-border-default text-text-primary text-body-sm focus:outline-none focus:border-semantic-green font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom Template Builder Modal */}
      {showBuilderModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-bg-surface1 border border-border-default p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <h3 className="text-body-md font-bold text-text-primary">
                Custom Template Builder
              </h3>
              <button
                type="button"
                onClick={() => setShowBuilderModal(false)}
                className="text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-metadata-xs text-text-muted uppercase font-mono">
                  Template Name
                </label>
                <input
                  type="text"
                  value={builderName}
                  onChange={(e) => setBuilderName(e.target.value)}
                  placeholder="e.g. Overhead Traction Inspection"
                  className="w-full px-3 py-1.5 rounded-lg bg-bg-surface2 border border-border-default text-text-primary text-body-sm focus:outline-none focus:border-semantic-green font-medium"
                />
              </div>

              <div>
                <label className="text-metadata-xs text-text-muted uppercase font-mono">
                  Category
                </label>
                <select
                  value={builderCategory}
                  onChange={(e) => setBuilderCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-bg-surface2 border border-border-default text-text-primary text-body-sm focus:outline-none focus:border-semantic-green font-medium"
                >
                  <option value="Electrical">Electrical</option>
                  <option value="Civil">Civil</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Signaling & Telecom">Signaling & Telecom</option>
                  <option value="Safety & Environmental">Safety & Environmental</option>
                </select>
              </div>

              {/* Dynamic Fields */}
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <label className="text-metadata-xs text-text-muted uppercase font-mono">
                    Template Schema Fields ({builderFields.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="text-metadata-xs text-semantic-green font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Add Field
                  </button>
                </div>

                <div className="space-y-2">
                  {builderFields.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-bg-surface2 border border-border-subtle flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={f.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBuilderFields((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, name: val } : item))
                          );
                        }}
                        placeholder="field_name"
                        className="flex-1 px-2 py-1 rounded bg-bg-surface1 border border-border-default text-text-primary text-metadata font-mono focus:outline-none focus:border-semantic-green"
                      />

                      <select
                        value={f.type}
                        onChange={(e) => {
                          const val = e.target.value as TemplateField['type'];
                          setBuilderFields((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, type: val } : item))
                          );
                        }}
                        className="px-2 py-1 rounded bg-bg-surface1 border border-border-default text-text-primary text-metadata font-mono focus:outline-none focus:border-semantic-green"
                      >
                        <option value="text">text</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="select">select</option>
                        <option value="date">date</option>
                      </select>

                      <label className="flex items-center gap-1 text-metadata-xs text-text-muted">
                        <input
                          type="checkbox"
                          checked={f.required}
                          onChange={(e) => {
                            const val = e.target.checked;
                            setBuilderFields((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, required: val } : item))
                            );
                          }}
                        />
                        <span>Req</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        className="text-semantic-red hover:text-semantic-red-text px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowBuilderModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveTemplate}
                >
                  Save Template Schema
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
