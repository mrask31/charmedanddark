'use client';

import { useState, useEffect } from 'react';
import type { ProductInput } from '@/lib/narrative-engine/types';

interface NarrativeBundle {
  short_description: string;
  long_ritual_description: string;
  ritual_intention_prompt: string;
  care_use_note: string;
  alt_text: string;
  one_line_drop_tagline: string;
}

interface SavedNarrative {
  id: string;
  product_name: string;
  narrative_bundle: NarrativeBundle;
  locked_at: string;
  version: string;
}

interface APIResponse {
  success: boolean;
  data?: NarrativeBundle;
  error?: {
    type: 'validation' | 'style_violation' | 'generation';
    message: string;
    details?: any[];
  };
}

export default function NarrativeStudioPage() {
  const [formData, setFormData] = useState<Partial<ProductInput>>({
    item_name: '',
    item_type: undefined,
    primary_symbol: undefined,
    emotional_core: undefined,
    energy_tone: undefined,
    drop_name: '',
    limited: undefined,
    intended_use: undefined,
  });
  const [avoidListText, setAvoidListText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NarrativeBundle | null>(null);
  const [error, setError] = useState<APIResponse['error'] | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [editedResult, setEditedResult] = useState<NarrativeBundle | null>(null);
  const [savedNarratives, setSavedNarratives] = useState<SavedNarrative[]>([]);
  const [viewMode, setViewMode] = useState<'generate' | 'list' | 'view'>('generate');
  const [selectedNarrative, setSelectedNarrative] = useState<SavedNarrative | null>(null);
  const [lockWarning, setLockWarning] = useState<string | null>(null);

  // Load saved narratives from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('saved_narratives');
    if (saved) {
      try {
        setSavedNarratives(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load saved narratives:', err);
      }
    }
  }, []);

  // Save narratives to localStorage whenever they change
  useEffect(() => {
    if (savedNarratives.length > 0) {
      localStorage.setItem('saved_narratives', JSON.stringify(savedNarratives));
    }
  }, [savedNarratives]);

  const handleInputChange = (field: keyof ProductInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData({
      item_name: '',
      item_type: undefined,
      primary_symbol: undefined,
      emotional_core: undefined,
      energy_tone: undefined,
      drop_name: '',
      limited: undefined,
      intended_use: undefined,
    });
    setAvoidListText('');
    setResult(null);
    setEditedResult(null);
    setError(null);
    setCopyFeedback(null);
    setIsLocked(false);
    setViewMode('generate');
    setSelectedNarrative(null);
    setLockWarning(null);
  };

  const handleViewSaved = () => {
    setViewMode('list');
  };

  const handleBackToGenerate = () => {
    setViewMode('generate');
    setSelectedNarrative(null);
  };

  const handleSelectNarrative = (narrative: SavedNarrative) => {
    setSelectedNarrative(narrative);
    setViewMode('view');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setEditedResult(null);
    setCopyFeedback(null);
    setIsLocked(false);

    try {
      // Build payload
      const payload: any = {
        item_name: formData.item_name,
        item_type: formData.item_type,
        primary_symbol: formData.primary_symbol,
        emotional_core: formData.emotional_core,
        energy_tone: formData.energy_tone,
      };

      // Add optional fields only if they have values
      if (formData.drop_name?.trim()) {
        payload.drop_name = formData.drop_name.trim();
      }
      if (formData.limited) {
        payload.limited = formData.limited;
      }
      if (formData.intended_use) {
        payload.intended_use = formData.intended_use;
      }

      // Parse avoid_list from textarea
      if (avoidListText.trim()) {
        const avoidList = avoidListText
          .split(',')
          .map(word => word.trim())
          .filter(word => word.length > 0);
        if (avoidList.length > 0) {
          payload.avoid_list = avoidList;
        }
      }

      const response = await fetch('/api/generate-narrative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: APIResponse = await response.json();

      if (data.success && data.data) {
        setResult(data.data);
        setEditedResult(data.data);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError({
        type: 'generation',
        message: 'Generation error. Please try again.',
        details: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`Copied: ${label}`);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      setCopyFeedback('Copy failed');
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  const handleEditField = (field: keyof NarrativeBundle, value: string) => {
    if (!isLocked && editedResult) {
      setEditedResult({
        ...editedResult,
        [field]: value,
      });
      // Clear lock warning when user edits a field
      setLockWarning(null);
    }
  };

  const handleLock = () => {
    if (!editedResult || !formData.item_name) return;

    // Validate all sections are non-empty
    const emptySections: string[] = [];
    
    if (!editedResult.short_description?.trim()) {
      emptySections.push('Short Description');
    }
    if (!editedResult.long_ritual_description?.trim()) {
      emptySections.push('Long Ritual Description');
    }
    if (!editedResult.ritual_intention_prompt?.trim()) {
      emptySections.push('Ritual Intention Prompt');
    }
    if (!editedResult.care_use_note?.trim()) {
      emptySections.push('Care & Use Note');
    }
    if (!editedResult.alt_text?.trim()) {
      emptySections.push('Alt Text');
    }
    // Note: one_line_drop_tagline is optional, so we don't validate it

    // If there are empty sections, show warning and prevent lock
    if (emptySections.length > 0) {
      const sectionList = emptySections.join(', ');
      setLockWarning(`Please complete the following sections before locking: ${sectionList}`);
      return;
    }

    // Clear any previous warnings
    setLockWarning(null);

    // Create saved narrative record
    const savedNarrative: SavedNarrative = {
      id: `narrative_${Date.now()}`,
      product_name: formData.item_name,
      narrative_bundle: editedResult,
      locked_at: new Date().toISOString(),
      version: 'v1',
    };

    // Add to saved narratives
    setSavedNarratives(prev => [...prev, savedNarrative]);

    // Lock the current narrative
    setIsLocked(true);
    setCopyFeedback('Narrative locked and saved');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const exportJSON = () => {
    if (editedResult) {
      copyToClipboard(JSON.stringify(editedResult, null, 2), 'JSON');
    }
  };

  const exportMarkdown = () => {
    if (editedResult) {
      const markdown = `# ${formData.item_name}

## Short Description

${editedResult.short_description}

## Long Ritual Description

${editedResult.long_ritual_description}

## Ritual Prompt

${editedResult.ritual_intention_prompt}

## Care & Use Note

${editedResult.care_use_note}

## Alt Text

${editedResult.alt_text}

## Tagline

${editedResult.one_line_drop_tagline || '(none)'}`;
      copyToClipboard(markdown, 'Markdown');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '400', marginBottom: '12px', color: '#0A0A0A' }}>
              Narrative Studio
            </h1>
            <p style={{ color: '#666', fontSize: '16px' }}>
              Internal tool for generating product narrative bundles.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {viewMode !== 'generate' && (
              <button
                onClick={handleBackToGenerate}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#0A0A0A',
                  border: '1px solid #0A0A0A',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                ← Back to Generate
              </button>
            )}
            {viewMode === 'generate' && (
              <button
                onClick={handleViewSaved}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#0A0A0A',
                  border: '1px solid #0A0A0A',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Saved Narratives ({savedNarratives.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Saved Narratives List View */}
      {viewMode === 'list' && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '400', marginBottom: '24px' }}>
            Saved Narratives
          </h2>
          {savedNarratives.length === 0 ? (
            <p style={{ color: '#666', fontSize: '16px' }}>
              No saved narratives yet. Lock a narrative to save it as canonical brand copy.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {savedNarratives.map((narrative) => (
                <div
                  key={narrative.id}
                  onClick={() => handleSelectNarrative(narrative)}
                  style={{
                    border: '1px solid #ddd',
                    padding: '24px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '400', marginBottom: '8px', color: '#0A0A0A' }}>
                        {narrative.product_name}
                      </h3>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Locked: {new Date(narrative.locked_at).toLocaleDateString()} at {new Date(narrative.locked_at).toLocaleTimeString()}
                        {' • '}
                        Version: {narrative.version}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#0A0A0A' }}>
                      View →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View Saved Narrative */}
      {viewMode === 'view' && selectedNarrative && (
        <div>
          <div style={{
            padding: '12px 24px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #0A0A0A',
            marginBottom: '24px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#0A0A0A',
          }}>
            🔒 Locked - Canonical brand copy saved on {new Date(selectedNarrative.locked_at).toLocaleDateString()}
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '400', marginBottom: '24px' }}>
            {selectedNarrative.product_name}
          </h2>

          <div style={{ display: 'grid', gap: '24px', marginBottom: '24px' }}>
            <ReadOnlyNarrativeCard
              title="Short Description"
              content={selectedNarrative.narrative_bundle.short_description}
              onCopy={() => copyToClipboard(selectedNarrative.narrative_bundle.short_description, 'Short Description')}
            />
            <ReadOnlyNarrativeCard
              title="Long Ritual Description"
              content={selectedNarrative.narrative_bundle.long_ritual_description}
              onCopy={() => copyToClipboard(selectedNarrative.narrative_bundle.long_ritual_description, 'Long Ritual Description')}
            />
            <ReadOnlyNarrativeCard
              title="Ritual Intention Prompt"
              content={selectedNarrative.narrative_bundle.ritual_intention_prompt}
              onCopy={() => copyToClipboard(selectedNarrative.narrative_bundle.ritual_intention_prompt, 'Ritual Intention Prompt')}
            />
            <ReadOnlyNarrativeCard
              title="Care & Use Note"
              content={selectedNarrative.narrative_bundle.care_use_note}
              onCopy={() => copyToClipboard(selectedNarrative.narrative_bundle.care_use_note, 'Care & Use Note')}
            />
            <ReadOnlyNarrativeCard
              title="Alt Text"
              content={selectedNarrative.narrative_bundle.alt_text}
              onCopy={() => copyToClipboard(selectedNarrative.narrative_bundle.alt_text, 'Alt Text')}
            />
            <ReadOnlyNarrativeCard
              title="One-Line Drop Tagline"
              content={selectedNarrative.narrative_bundle.one_line_drop_tagline || '(none)'}
              onCopy={() => copyToClipboard(selectedNarrative.narrative_bundle.one_line_drop_tagline || '', 'One-Line Drop Tagline')}
            />
          </div>

          {/* Export Buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid #ddd' }}>
            <button
              onClick={() => copyToClipboard(JSON.stringify(selectedNarrative.narrative_bundle, null, 2), 'JSON')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#0A0A0A',
                border: '1px solid #0A0A0A',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Copy JSON
            </button>
            <button
              onClick={() => {
                const markdown = `# ${selectedNarrative.product_name}

## Short Description

${selectedNarrative.narrative_bundle.short_description}

## Long Ritual Description

${selectedNarrative.narrative_bundle.long_ritual_description}

## Ritual Prompt

${selectedNarrative.narrative_bundle.ritual_intention_prompt}

## Care & Use Note

${selectedNarrative.narrative_bundle.care_use_note}

## Alt Text

${selectedNarrative.narrative_bundle.alt_text}

## Tagline

${selectedNarrative.narrative_bundle.one_line_drop_tagline || '(none)'}`;
                copyToClipboard(markdown, 'Markdown');
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: 'white',
                color: '#0A0A0A',
                border: '1px solid #0A0A0A',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Copy Markdown
            </button>
          </div>
        </div>
      )}

      {/* Generate View */}
      {viewMode === 'generate' && (
        <>
          {/* Form */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Item Name */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
              Item Name *
            </label>
            <input
              type="text"
              value={formData.item_name}
              onChange={(e) => handleInputChange('item_name', e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                fontSize: '16px',
                backgroundColor: loading ? '#f5f5f5' : 'white',
              }}
            />
          </div>

          {/* Item Type */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
              Item Type *
            </label>
            <select
              value={formData.item_type || ''}
              onChange={(e) => handleInputChange('item_type', e.target.value || undefined)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                fontSize: '16px',
                backgroundColor: loading ? '#f5f5f5' : 'white',
              }}
            >
              <option value="">Select...</option>
              <option value="jewelry">jewelry</option>
              <option value="apparel">apparel</option>
              <option value="home_object">home_object</option>
              <option value="altar_piece">altar_piece</option>
              <option value="wearable_symbol">wearable_symbol</option>
            </select>
          </div>

          {/* Primary Symbol */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
              Primary Symbol *
            </label>
            <select
              value={formData.primary_symbol || ''}
              onChange={(e) => handleInputChange('primary_symbol', e.target.value || undefined)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                fontSize: '16px',
                backgroundColor: loading ? '#f5f5f5' : 'white',
              }}
            >
              <option value="">Select...</option>
              <option value="moon">moon</option>
              <option value="rose">rose</option>
              <option value="heart">heart</option>
              <option value="blade">blade</option>
              <option value="bone">bone</option>
              <option value="mirror">mirror</option>
              <option value="candle">candle</option>
            </select>
          </div>

          {/* Emotional Core */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
              Emotional Core *
            </label>
            <select
              value={formData.emotional_core || ''}
              onChange={(e) => handleInputChange('emotional_core', e.target.value || undefined)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                fontSize: '16px',
                backgroundColor: loading ? '#f5f5f5' : 'white',
              }}
            >
              <option value="">Select...</option>
              <option value="devotion">devotion</option>
              <option value="grief">grief</option>
              <option value="protection">protection</option>
              <option value="longing">longing</option>
              <option value="transformation">transformation</option>
              <option value="memory">memory</option>
              <option value="power">power</option>
            </select>
          </div>

          {/* Energy Tone */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
              Energy Tone *
            </label>
            <select
              value={formData.energy_tone || ''}
              onChange={(e) => handleInputChange('energy_tone', e.target.value || undefined)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                fontSize: '16px',
                backgroundColor: loading ? '#f5f5f5' : 'white',
              }}
            >
              <option value="">Select...</option>
              <option value="soft_whispered">soft_whispered</option>
              <option value="balanced_reverent">balanced_reverent</option>
              <option value="dark_commanding">dark_commanding</option>
            </select>
          </div>

          {/* Drop Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
              Drop Name (optional)
            </label>
            <input
              type="text"
              value={formData.drop_name}
              onChange={(e) => handleInputChange('drop_name', e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                fontSize: '16px',
                backgroundColor: loading ? '#f5f5f5' : 'white',
              }}
            />
          </div>

          {/* Limited */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
              Limited (optional)
            </label>
            <select
              value={formData.limited || ''}
              onChange={(e) => handleInputChange('limited', e.target.value || undefined)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                fontSize: '16px',
                backgroundColor: loading ? '#f5f5f5' : 'white',
              }}
            >
              <option value="">Select...</option>
              <option value="yes">yes</option>
              <option value="no">no</option>
              <option value="numbered">numbered</option>
            </select>
          </div>

          {/* Intended Use */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
              Intended Use (optional)
            </label>
            <select
              value={formData.intended_use || ''}
              onChange={(e) => handleInputChange('intended_use', e.target.value || undefined)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                fontSize: '16px',
                backgroundColor: loading ? '#f5f5f5' : 'white',
              }}
            >
              <option value="">Select...</option>
              <option value="worn_daily">worn_daily</option>
              <option value="worn_intentionally">worn_intentionally</option>
              <option value="displayed">displayed</option>
              <option value="gifted">gifted</option>
            </select>
          </div>

          {/* Avoid List */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#0A0A0A' }}>
              Avoid List (optional, comma-separated)
            </label>
            <textarea
              value={avoidListText}
              onChange={(e) => setAvoidListText(e.target.value)}
              disabled={loading}
              placeholder="eternal, forever, timeless"
              rows={2}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                fontSize: '16px',
                fontFamily: 'inherit',
                backgroundColor: loading ? '#f5f5f5' : 'white',
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleGenerate}
            disabled={loading || isLocked}
            style={{
              padding: '12px 24px',
              backgroundColor: (loading || isLocked) ? '#ccc' : '#0A0A0A',
              color: 'white',
              border: 'none',
              fontSize: '16px',
              cursor: (loading || isLocked) ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Generating...' : isLocked ? 'Locked' : 'Generate'}
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: 'white',
              color: '#0A0A0A',
              border: '1px solid #0A0A0A',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Copy Feedback */}
      {copyFeedback && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f0f0f0',
          marginBottom: '24px',
          fontSize: '14px',
        }}>
          {copyFeedback}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '24px',
          backgroundColor: '#fee',
          border: '1px solid #c00',
          marginBottom: '24px',
        }}>
          <h3 style={{ marginBottom: '12px', fontSize: '18px', color: '#c00' }}>
            {error.type === 'validation' && 'Validation Error'}
            {error.type === 'style_violation' && 'Style Violation'}
            {error.type === 'generation' && 'Generation Error'}
          </h3>
          <p style={{ marginBottom: '12px' }}>{error.message}</p>
          {error.details && error.details.length > 0 && (
            <ul style={{ marginLeft: '20px' }}>
              {error.details.map((detail: any, idx: number) => (
                <li key={idx} style={{ marginBottom: '4px' }}>
                  {detail.field && `${detail.field}: ${detail.message}`}
                  {detail.section && `${detail.section}: ${detail.violation_type} (${detail.matched_pattern})`}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Result Display */}
      {result && editedResult && (
        <div>
          {/* Locked Indicator */}
          {isLocked && (
            <div style={{
              padding: '12px 24px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #0A0A0A',
              marginBottom: '24px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#0A0A0A',
            }}>
              🔒 Locked - This narrative is finalized and cannot be edited or regenerated
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '400', marginBottom: '24px' }}>
              Generated Narrative
            </h2>

            {/* Cards */}
            <div style={{ display: 'grid', gap: '24px' }}>
              <EditableNarrativeCard
                title="Short Description"
                content={editedResult.short_description}
                field="short_description"
                isLocked={isLocked}
                onEdit={handleEditField}
                onCopy={() => copyToClipboard(editedResult.short_description, 'Short Description')}
              />
              <EditableNarrativeCard
                title="Long Ritual Description"
                content={editedResult.long_ritual_description}
                field="long_ritual_description"
                isLocked={isLocked}
                onEdit={handleEditField}
                onCopy={() => copyToClipboard(editedResult.long_ritual_description, 'Long Ritual Description')}
              />
              <EditableNarrativeCard
                title="Ritual Intention Prompt"
                content={editedResult.ritual_intention_prompt}
                field="ritual_intention_prompt"
                isLocked={isLocked}
                onEdit={handleEditField}
                onCopy={() => copyToClipboard(editedResult.ritual_intention_prompt, 'Ritual Intention Prompt')}
              />
              <EditableNarrativeCard
                title="Care & Use Note"
                content={editedResult.care_use_note}
                field="care_use_note"
                isLocked={isLocked}
                onEdit={handleEditField}
                onCopy={() => copyToClipboard(editedResult.care_use_note, 'Care & Use Note')}
              />
              <EditableNarrativeCard
                title="Alt Text"
                content={editedResult.alt_text}
                field="alt_text"
                isLocked={isLocked}
                onEdit={handleEditField}
                onCopy={() => copyToClipboard(editedResult.alt_text, 'Alt Text')}
              />
              <EditableNarrativeCard
                title="One-Line Drop Tagline"
                content={editedResult.one_line_drop_tagline || '(none)'}
                field="one_line_drop_tagline"
                isLocked={isLocked}
                onEdit={handleEditField}
                onCopy={() => copyToClipboard(editedResult.one_line_drop_tagline || '', 'One-Line Drop Tagline')}
              />
            </div>
          </div>

          {/* Lock Button */}
          {!isLocked && (
            <div style={{ paddingTop: '24px', borderTop: '1px solid #ddd', marginBottom: '24px' }}>
              {/* Lock Warning */}
              {lockWarning && (
                <div style={{
                  padding: '12px 18px',
                  backgroundColor: '#fff8e1',
                  border: '1px solid #f9a825',
                  marginBottom: '18px',
                  fontSize: '14px',
                  color: '#5d4037',
                  lineHeight: '1.5',
                }}>
                  {lockWarning}
                </div>
              )}
              
              <button
                onClick={handleLock}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0A0A0A',
                  color: 'white',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Lock Narrative
              </button>
              <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                Locking will finalize this narrative as canonical brand copy. This action cannot be undone.
              </p>
            </div>
          )}

          {/* Export Buttons - Only shown when locked */}
          {isLocked && (
            <div style={{ display: 'flex', gap: '12px', paddingTop: '24px', borderTop: '1px solid #ddd' }}>
              <button
                onClick={exportJSON}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#0A0A0A',
                  border: '1px solid #0A0A0A',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Copy JSON
              </button>
              <button
                onClick={exportMarkdown}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#0A0A0A',
                  border: '1px solid #0A0A0A',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Copy Markdown
              </button>
            </div>
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
}

function ReadOnlyNarrativeCard({ title, content, onCopy }: { title: string; content: string; onCopy: () => void }) {
  return (
    <div style={{
      border: '1px solid #ddd',
      padding: '24px',
      backgroundColor: '#f9f9f9',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '400', color: '#0A0A0A' }}>
          {title}
        </h3>
        <button
          onClick={onCopy}
          style={{
            padding: '6px 12px',
            backgroundColor: 'white',
            color: '#0A0A0A',
            border: '1px solid #0A0A0A',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Copy
        </button>
      </div>
      <div style={{
        whiteSpace: 'pre-wrap',
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#555',
      }}>
        {content}
      </div>
    </div>
  );
}

function EditableNarrativeCard({ 
  title, 
  content, 
  field,
  isLocked,
  onEdit, 
  onCopy 
}: { 
  title: string; 
  content: string; 
  field: keyof NarrativeBundle;
  isLocked: boolean;
  onEdit: (field: keyof NarrativeBundle, value: string) => void;
  onCopy: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);

  const handleSave = () => {
    onEdit(field, editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(content);
    setIsEditing(false);
  };

  // Update editValue when content changes (e.g., new generation)
  if (content !== editValue && !isEditing) {
    setEditValue(content);
  }

  return (
    <div style={{
      border: '1px solid #ddd',
      padding: '24px',
      backgroundColor: isLocked ? '#f9f9f9' : 'white',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '400', color: '#0A0A0A' }}>
          {title}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isLocked && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: 'white',
                color: '#0A0A0A',
                border: '1px solid #0A0A0A',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleSave}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#0A0A0A',
                  color: 'white',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'white',
                  color: '#0A0A0A',
                  border: '1px solid #0A0A0A',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </>
          )}
          <button
            onClick={onCopy}
            style={{
              padding: '6px 12px',
              backgroundColor: 'white',
              color: '#0A0A0A',
              border: '1px solid #0A0A0A',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Copy
          </button>
        </div>
      </div>
      {isEditing ? (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          rows={field === 'long_ritual_description' ? 10 : field === 'short_description' ? 3 : 2}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ddd',
            fontSize: '16px',
            lineHeight: '1.6',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      ) : (
        <div style={{
          whiteSpace: 'pre-wrap',
          fontSize: '16px',
          lineHeight: '1.6',
          color: isLocked ? '#555' : '#333',
        }}>
          {content}
        </div>
      )}
    </div>
  );
}
