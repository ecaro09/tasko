"use client";

import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash } from 'lucide-react'; // Import Trash icon

interface FirestoreDataItem {
  id: string;
  content: string;
  createdAt: number;
}

interface NotesSectionProps {
  notes: FirestoreDataItem[]; // Now passing full item objects
  onAddNote: (note: string) => void;
  onDeleteNote: (id: string) => void; // New prop for deleting notes
  isAuthenticated: boolean;
}

const NotesSection: React.FC<NotesSectionProps> = ({ notes, onAddNote, onDeleteNote, isAuthenticated }) => {
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
            notes.map((note) => (
              <li key={note.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                <span>{note.content}</span>
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteNote(note.id)}
                    className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))
          ) : (
            <li className="text-gray-500 dark:text-gray-400">No notes yet. Sign in to add notes.</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
};

export default NotesSection;