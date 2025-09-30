import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NotesSectionProps {
  notes: string[];
  onAddNote: (note: string) => void;
  isAuthenticated: boolean;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, onAddNote, isAuthenticated }) => {
  const [noteInput, setNoteInput] = React.useState('');

  const handleAddNote = () => {
    if (noteInput.trim() && isAuthenticated) {
      onAddNote(noteInput);
      setNoteInput('');
    }
  };

  return (
    <Card className="mb-8">
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
          disabled={!isAuthenticated}
        />
        <Button onClick={handleAddNote} disabled={!isAuthenticated}>
          Add Note
        </Button>
        <ul className="mt-4 space-y-2">
          {notes.length > 0 ? (
            notes.map((note, index) => (
              <li key={index} className="bg-gray-100 p-2 rounded-md text-gray-800">
                {note}
              </li>
            ))
          ) : (
            <li className="text-gray-500">No notes yet. Sign in to add notes.</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default NotesSection;