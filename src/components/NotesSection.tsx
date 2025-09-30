import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Note {
  id: string;
  text: string;
  createdAt: any; // Firebase Timestamp
  userId: string;
}

interface NotesSectionProps {
  notes: Note[];
  onAddNote: (note: { text: string }) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, onAddNote, isAuthenticated, loading }) => {
  const [noteInput, setNoteInput] = React.useState('');

  const handleAddNote = () => {
    if (noteInput.trim() && isAuthenticated) {
      onAddNote({ text: noteInput });
      setNoteInput('');
    }
  };

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Write something..."
          rows={4}
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          className="mb-4"
          disabled={!isAuthenticated || loading}
        />
        <Button onClick={handleAddNote} disabled={!isAuthenticated || loading || !noteInput.trim()}>
          Add Note
        </Button>
        {loading ? (
          <p className="mt-4 text-gray-500">Loading notes...</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {notes.length > 0 ? (
              notes.map((note) => (
                <li key={note.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-gray-800 dark:text-gray-200">
                  {note.text}
                </li>
              ))
            ) : (
              <li className="text-gray-500 dark:text-gray-400">No notes yet. Sign in to add notes.</li>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesSection;