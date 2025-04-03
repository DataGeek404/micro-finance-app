
import React from 'react';
import { Send, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

export interface SMSTemplate {
  id: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
  category: string;
  is_active: boolean;
}

interface TemplateListProps {
  templates: SMSTemplate[];
  isLoading: boolean;
  searchTerm: string;
  isAdmin: boolean;
  onTestSMS: (template: SMSTemplate) => void;
  onEdit: (template: SMSTemplate) => void;
  onDelete: (id: string) => void;
}

const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  isLoading,
  searchTerm,
  isAdmin,
  onTestSMS,
  onEdit,
  onDelete,
}) => {
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="hidden md:table-cell">Content</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {template.category}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell max-w-md truncate">
                {template.content}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onTestSMS(template)}
                    title="Test SMS"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(template)}
                    title="Edit Template"
                    disabled={!isAdmin}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onDelete(template.id)}
                    title="Delete Template"
                    disabled={!isAdmin}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No templates match your search" : "No templates found. Create your first template!"}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default TemplateList;
