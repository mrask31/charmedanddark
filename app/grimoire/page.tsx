'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getProductBySlug } from '@/lib/products';
import { getApparelBySlug } from '@/lib/apparel';

/**
 * Expected Supabase schema:
 * 
 * CREATE TABLE grimoire_entries (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   email TEXT NOT NULL,
 *   emotional_state TEXT NOT NULL,
 *   reading_id TEXT NOT NULL,
 *   validation TEXT NOT NULL,
 *   reflection TEXT NOT NULL,
 *   ritual_suggestion TEXT NOT NULL,
 *   object_type TEXT NOT NULL,
 *   object_slug TEXT NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * CREATE TABLE grimoire_notes (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   entry_id UUID NOT NULL REFERENCES grimoire_entries(id) ON DELETE CASCADE,
 *   note TEXT NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * CREATE INDEX idx_grimoire_entries_email ON grimoire_entries(email);
 * CREATE INDEX idx_grimoire_entries_created_at ON grimoire_entries(created_at DESC);
 * CREATE INDEX idx_grimoire_notes_entry_id ON grimoire_notes(entry_id);
 */

interface GrimoireEntry {
  id: string;
  email: string;
  emotional_state: string;
  reading_id: string;
  validation: string;
  reflection: string;
  ritual_suggestion: string;
  object_type: 'product' | 'apparel';
  object_slug: string;
  created_at: string;
}

interface GrimoireNote {
  id: string;
  entry_id: string;
  note: string;
  created_at: string;
}

// Map emotional states to poetic page titles
function getPageTitle(state: string): string {
  const titles: Record<string, string> = {
    overwhelmed: 'Too Much Light',
    tired: 'Low Candle',
    unseen: 'Behind Glass',
    restless: 'Unquiet Hands',
    heavy: 'Stone in the Chest',
    distant: 'Far Room',
    quiet: 'Soft Eclipse',
    uncertain: 'Unmarked Door'
  };
  return titles[state] || 'A Kept Moment';
}

// Random presence line
function getPresenceLine(): string {
  const lines = [
    'I kept this for you.',
    'You were here.',
    'Still here.',
    'I remember what you could not hold.'
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

function GateScreen() {
  return (
    <div className="grimoire-gate">
      <div className="grimoire-gate-content">
        <h1 className="grimoire-gate-title">The Grimoire is kept inside.</h1>
        <p className="grimoire-gate-description">
          Enter the Sanctuary to keep reflections.
        </p>
        <Link href="/join" className="grimoire-gate-button">
          Enter the Sanctuary →
        </Link>
      </div>
    </div>
  );
}

function PageCard({ entry, notes, onNoteAdded }: { 
  entry: GrimoireEntry; 
  notes: GrimoireNote[];
  onNoteAdded: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteMessage, setNoteMessage] = useState<string | null>(null);

  // Get object details
  const getObjectDetails = () => {
    if (entry.object_type === 'product') {
      const product = getProductBySlug(entry.object_slug);
      return product ? {
        name: product.name,
        link: `/product/${entry.object_slug}`
      } : null;
    } else {
      const apparel = getApparelBySlug(entry.object_slug);
      return apparel ? {
        name: apparel.name,
        link: `/uniform/${entry.object_slug}`
      } : null;
    }
  };

  const objectDetails = getObjectDetails();

  const handleSaveNote = async () => {
    if (!noteText.trim()) return;

    setIsSavingNote(true);
    setNoteMessage(null);

    try {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('grimoire_notes')
        .insert({
          entry_id: entry.id,
          note: noteText.trim()
        });

      if (error) {
        console.error('Note save error:', error);
        setNoteMessage('Something went quiet.');
        setIsSavingNote(false);
        return;
      }

      setNoteText('');
      setNoteMessage('Tucked in.');
      setIsSavingNote(false);
      onNoteAdded();
    } catch (err) {
      console.error('Note save error:', err);
      setNoteMessage('Something went quiet.');
      setIsSavingNote(false);
    }
  };

  return (
    <div className="grimoire-page-card">
      <button 
        className="grimoire-page-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="grimoire-page-title">{getPageTitle(entry.emotional_state)}</h3>
        <p className="grimoire-page-validation">{entry.validation}</p>
        {objectDetails && (
          <p className="grimoire-page-object">
            {objectDetails.name}
          </p>
        )}
        <span className="grimoire-page-toggle">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="grimoire-page-content">
          {/* Reflection */}
          <div className="grimoire-page-reflection">
            <p>{entry.reflection}</p>
          </div>

          {/* Ritual Suggestion */}
          <div className="grimoire-page-ritual">
            <p>{entry.ritual_suggestion}</p>
          </div>

          {/* Object Link */}
          {objectDetails ? (
            <div className="grimoire-page-object-link">
              <Link href={objectDetails.link}>
                {objectDetails.name} →
              </Link>
            </div>
          ) : (
            <div className="grimoire-page-object-gone">
              <p>An object that has gone quiet.</p>
            </div>
          )}

          {/* Timestamp */}
          <div className="grimoire-page-timestamp">
            <p>{new Date(entry.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}</p>
          </div>

          {/* Notes Section */}
          <div className="grimoire-notes-section">
            <label className="grimoire-notes-label">
              If you want, leave a note for me.
            </label>
            <textarea
              className="grimoire-notes-textarea"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder=""
            />
            <button
              className="grimoire-notes-button"
              onClick={handleSaveNote}
              disabled={!noteText.trim() || isSavingNote}
            >
              {isSavingNote ? 'Tucking...' : 'Tuck it in'}
            </button>
            {noteMessage && (
              <p className="grimoire-notes-message">{noteMessage}</p>
            )}

            {/* Existing Notes */}
            {notes.length > 0 && (
              <div className="grimoire-notes-list">
                {notes.map(note => (
                  <div key={note.id} className="grimoire-note">
                    <p>{note.note}</p>
                    <span className="grimoire-note-date">
                      {new Date(note.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GrimoirePage() {
  const [isSanctuary, setIsSanctuary] = useState(false);
  const [sanctuaryEmail, setSanctuaryEmail] = useState<string | null>(null);
  const [entries, setEntries] = useState<GrimoireEntry[]>([]);
  const [notesByEntry, setNotesByEntry] = useState<Record<string, GrimoireNote[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [presenceLine] = useState(getPresenceLine());

  useEffect(() => {
    // Check sanctuary status
    if (typeof window !== 'undefined') {
      const sanctuaryStatus = localStorage.getItem('sanctuary_preview') === 'true';
      const email = localStorage.getItem('sanctuary_email');
      setIsSanctuary(sanctuaryStatus);
      setSanctuaryEmail(email);

      if (sanctuaryStatus && email) {
        loadEntries(email);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const loadEntries = async (email: string) => {
    try {
      const supabase = getSupabaseClient();

      // Fetch entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('grimoire_entries')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false });

      if (entriesError) {
        console.error('Error loading entries:', entriesError);
        setIsLoading(false);
        return;
      }

      setEntries(entriesData || []);

      // Fetch notes for all entries
      if (entriesData && entriesData.length > 0) {
        const entryIds = entriesData.map(e => e.id);
        const { data: notesData, error: notesError } = await supabase
          .from('grimoire_notes')
          .select('*')
          .in('entry_id', entryIds)
          .order('created_at', { ascending: true });

        if (notesError) {
          console.error('Error loading notes:', notesError);
        } else if (notesData) {
          // Group notes by entry_id
          const grouped = notesData.reduce((acc, note) => {
            if (!acc[note.entry_id]) {
              acc[note.entry_id] = [];
            }
            acc[note.entry_id].push(note);
            return acc;
          }, {} as Record<string, GrimoireNote[]>);
          setNotesByEntry(grouped);
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error loading grimoire:', err);
      setIsLoading(false);
    }
  };

  const handleNoteAdded = () => {
    if (sanctuaryEmail) {
      loadEntries(sanctuaryEmail);
    }
  };

  // Gate screen if not in sanctuary
  if (!isSanctuary || !sanctuaryEmail) {
    return <GateScreen />;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="grimoire-page">
        <div className="grimoire-container">
          <div className="grimoire-loading">
            <p>Opening...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="grimoire-page">
        <div className="grimoire-container">
          <div className="grimoire-empty">
            <h1 className="grimoire-empty-title">Nothing kept yet.</h1>
            <p className="grimoire-empty-description">
              When you ask The Mirror, you may keep what you find.
            </p>
            <Link href="/mirror" className="grimoire-empty-link">
              Return to The Mirror →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main grimoire view
  return (
    <div className="grimoire-page">
      <div className="grimoire-container">
        <div className="grimoire-header">
          <h1 className="grimoire-title">The Grimoire</h1>
          <p className="grimoire-subhead">Where your reflections are kept.</p>
          <p className="grimoire-presence">{presenceLine}</p>
        </div>

        <div className="grimoire-pages">
          {entries.map(entry => (
            <PageCard
              key={entry.id}
              entry={entry}
              notes={notesByEntry[entry.id] || []}
              onNoteAdded={handleNoteAdded}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
