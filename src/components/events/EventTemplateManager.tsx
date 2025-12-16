'use client';

import React, { useState } from 'react';
import { EVENT_TEMPLATES, EventTemplate, getEventTemplatesByCategory } from '@/lib/eventTemplates';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EventTemplateManagerProps {
  onTemplateSelect: (template: EventTemplate) => void;
  onCreateEvent: (template: EventTemplate) => void;
}

export function EventTemplateManager({ onTemplateSelect, onCreateEvent }: EventTemplateManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<'weekly' | 'monthly' | 'seasonal' | 'special'>('weekly');
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);

  const categories = [
    { value: 'weekly', label: 'Mingguan', icon: '📅' },
    { value: 'monthly', label: 'Bulanan', icon: '📆' },
    { value: 'seasonal', label: 'Musiman', icon: '🎄' },
    { value: 'special', label: 'Spesial', icon: '⭐' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'weekly':
        return 'bg-blue-100 text-blue-800';
      case 'monthly':
        return 'bg-purple-100 text-purple-800';
      case 'seasonal':
        return 'bg-green-100 text-green-800';
      case 'special':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTemplates = getEventTemplatesByCategory(selectedCategory);

  const handleTemplateSelect = (template: EventTemplate) => {
    setSelectedTemplate(template);
    onTemplateSelect(template);
  };

  const handleCreateEvent = () => {
    if (selectedTemplate) {
      onCreateEvent(selectedTemplate);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Template Event Challenge</h2>
        
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            {categories.map((category) => (
              <TabsTrigger key={category.value} value={category.value} className="flex items-center gap-2">
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.value} value={category.value} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedTemplate?.id === template.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{template.icon}</span>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="text-sm mt-1">
                              {template.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-lg font-bold text-blue-600">
                              {template.challenges.length}
                            </p>
                            <p className="text-xs text-gray-600">Tantangan</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-600">
                              {template.duration_days}
                            </p>
                            <p className="text-xs text-gray-600">Hari</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-purple-600">
                              {template.bonus_multiplier}x
                            </p>
                            <p className="text-xs text-gray-600">Bonus</p>
                          </div>
                        </div>

                        {/* Difficulty Badge */}
                        <div className="flex items-center justify-between">
                          <Badge className={getDifficultyColor(template.difficulty)}>
                            {template.difficulty.charAt(0).toUpperCase() + template.difficulty.slice(1)}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            ~{template.estimated_participants} peserta
                          </span>
                        </div>

                        {/* Challenges Preview */}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-700">Tantangan Utama:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.challenges.slice(0, 3).map((challenge) => (
                              <Badge key={challenge.id} variant="outline" className="text-xs">
                                {challenge.challenge_code}
                              </Badge>
                            ))}
                            {template.challenges.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{template.challenges.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Action Buttons */}
        {selectedTemplate && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Template Dipilih: {selectedTemplate.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedTemplate.description} • {selectedTemplate.challenges.length} tantangan • {selectedTemplate.duration_days} hari
                </p>
              </div>
              <Button 
                onClick={handleCreateEvent}
                className="bg-blue-600 hover:bg-blue-700"
              >
                🚀 Buat Event dari Template
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}