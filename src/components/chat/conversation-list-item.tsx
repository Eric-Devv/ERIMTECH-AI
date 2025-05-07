
// src/components/chat/conversation-list-item.tsx
"use client";

import React, { useState, useEffect } from 'react';
import type { Conversation, AiFeature } from '@/app/chat/page'; // Assuming types are exported from page.tsx
import { featureConfig } from '@/app/chat/page'; // Assuming config is exported
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationListItemProps {
  convo: Conversation;
  isActive: boolean;
  onClick: () => void;
  isEditing: boolean;
  editingName: string;
  onNameChange: (name: string) => void;
  onSaveName: (convoId: string) => void;
  onEdit: (convoId: string) => void;
  onDelete: (convoId: string) => void;
}

export function ConversationListItem({
  convo,
  isActive,
  onClick,
  isEditing,
  editingName,
  onNameChange,
  onSaveName,
  onEdit,
  onDelete,
}: ConversationListItemProps) {
  const [formattedTimestamp, setFormattedTimestamp] = useState<string | null>(null);
  const FeatureIcon = featureConfig[convo.feature].icon;


  useEffect(() => {
    // Format the timestamp on the client side to avoid hydration mismatch
    setFormattedTimestamp(new Date(convo.timestamp).toLocaleDateString(undefined, {day: '2-digit', month: '2-digit', year: 'numeric'}));
  }, [convo.timestamp]);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-md cursor-pointer transition-colors hover:bg-primary/10", // Reduced padding
        isActive ? "bg-primary/20 border-primary/50" : "bg-background/30"
      )}
    >
      <div className="flex items-center justify-between">
        {isEditing ? (
          <Input
            value={editingName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => onSaveName(convo.id)}
            onKeyDown={(e) => e.key === 'Enter' && onSaveName(convo.id)}
            className="h-6 text-xs flex-grow mr-0.5" // Reduced height and text size
            autoFocus
            onClick={(e) => e.stopPropagation()} 
          />
        ) : (
          <span className="text-xs font-medium truncate flex-grow">{convo.name}</span> // Reduced text size
        )}
        <div className="flex items-center shrink-0">
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5" // Reduced size
              onClick={(e) => {
                e.stopPropagation();
                onEdit(convo.id);
              }}
            >
              <Edit2 className="h-3 w-3" /> {/* Reduced icon size */}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 hover:text-destructive" // Reduced size
            onClick={(e) => {
              e.stopPropagation();
              onDelete(convo.id);
            }}
          >
            <Trash2 className="h-3 w-3" /> {/* Reduced icon size */}
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-0.5"> {/* Reduced margin */}
        <div className="flex items-center text-xs text-muted-foreground">
          <FeatureIcon className="h-3 w-3 mr-0.5" /> {/* Reduced icon size and margin */}
          {featureConfig[convo.feature].name}
        </div>
        {formattedTimestamp ? (
            <p className="text-xs text-muted-foreground">{formattedTimestamp}</p>
        ) : (
            <p className="text-xs text-muted-foreground">...</p> 
        )}
      </div>
    </Card>
  );
}

