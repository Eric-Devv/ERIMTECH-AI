
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

  useEffect(() => {
    // Format the timestamp on the client side to avoid hydration mismatch
    setFormattedTimestamp(new Date(convo.timestamp).toLocaleDateString());
  }, [convo.timestamp]);

  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg cursor-pointer transition-colors hover:bg-primary/10",
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
            className="h-7 text-sm flex-grow mr-1"
            autoFocus
            onClick={(e) => e.stopPropagation()} // Prevent card click when editing name
          />
        ) : (
          <span className="text-sm font-medium truncate flex-grow">{convo.name}</span>
        )}
        <div className="flex items-center shrink-0">
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(convo.id);
              }}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(convo.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center text-xs text-muted-foreground">
          {React.cloneElement(featureConfig[convo.feature].icon, { className: "h-3.5 w-3.5 mr-1" })}
          {featureConfig[convo.feature].name}
        </div>
        {/* Render timestamp only after it's formatted on client */}
        {formattedTimestamp ? (
            <p className="text-xs text-muted-foreground">{formattedTimestamp}</p>
        ) : (
            <p className="text-xs text-muted-foreground">...</p> // Placeholder or empty string
        )}
      </div>
    </Card>
  );
}
