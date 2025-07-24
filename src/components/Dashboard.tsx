import React, { useState, useEffect } from 'react';
import { CanvasTemplate, Category, apiService } from '../services/api';
import { Eye, Edit, Trash2, Calendar, Image, Plus, Tag, FolderPlus, X } from 'lucide-react';
import { CanvasConfig, CanvasElement } from '../types/canvas';

interface DashboardProps {
  onLoadTemplate: (config: CanvasConfig, elements: CanvasElement[], templateId?: string, templateName?: string) => void;
  onCreateNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLoadTemplate, onCreateNew }) => {
  const [templates, setTemplates] = useState<CanvasTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteCategoryConfirm, setDeleteCategoryConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedTemplates, fetchedCategories] = await Promise.all([
        apiService.getTemplates(),
        apiService.getCategories()
      ]);
      setTemplates(fetchedTemplates);
      setCategories(fetchedCategories);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Please enter a category name');
      return;
    }

    try {
      const newCategory = await apiService.createCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor
      });
      
      setCategories(prev => [...prev, newCategory]);
      setShowNewCategory(false);
      setNewCategoryName('');
      setNewCategoryColor('#3B82F6');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await apiService.deleteCategory(categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setDeleteCategoryConfirm(null);
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
      }
      // Reload templates to update category associations
      loadData();
    } catch (err) {
      setError('Failed to delete category. Please try again.');
      console.error('Error deleting category:', err);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await apiService.deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete template. Please try again.');
      console.error('Error deleting template:', err);
    }
  };

  const handleLoadTemplate = (template: CanvasTemplate) => {
    try {
      const config = typeof template.config === 'string' 
        ? JSON.parse(template.config) 
        : template.config;
      const elements = typeof template.elements === 'string'
        ? JSON.parse(template.elements)
        : template.elements;
      
      onLoadTemplate(config, elements, template.id, template.name);
    } catch (err) {
      setError('Failed to load template. Template data may be corrupted.');
      console.error('Error parsing template data:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTemplates = selectedCategoryId
    ? templates.filter(template => template.category?.id === selectedCategoryId)
    : selectedCategoryId === 'uncategorized'
    ? templates.filter(template => !template.category)
    : templates;

  const uncategorizedCount = templates.filter(template => !template.category).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Categories</h2>
          <button
            onClick={() => setShowNewCategory(true)}
            className="flex items-center space-x-2 w-full px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Category</span>
          </button>
        </div>

        {/* Category List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {/* All Templates */}
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                selectedCategoryId === null
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-sm font-medium">All Templates</span>
              </div>
              <span className="text-xs text-gray-500">{templates.length}</span>
            </button>

            {/* Uncategorized */}
            {uncategorizedCount > 0 && (
              <button
                onClick={() => setSelectedCategoryId('uncategorized')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedCategoryId === 'uncategorized'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-sm font-medium">Uncategorized</span>
                </div>
                <span className="text-xs text-gray-500">{uncategorizedCount}</span>
              </button>
            )}

            {/* Categories */}
            {categories.map((category) => {
              const categoryTemplateCount = templates.filter(t => t.category?.id === category.id).length;
              return (
                <div key={category.id} className="group">
                  <button
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategoryId === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">{categoryTemplateCount}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteCategoryConfirm(category.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                        title="Delete category"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedCategoryId === null
                    ? 'All Templates'
                    : selectedCategoryId === 'uncategorized'
                    ? 'Uncategorized Templates'
                    : categories.find(c => c.id === selectedCategoryId)?.name || 'Templates'
                  }
                </h1>
                <p className="text-sm text-gray-500">
                  {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={onCreateNew}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedCategoryId ? 'No templates in this category' : 'No templates yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {selectedCategoryId 
                ? 'Create a new template and assign it to this category.' 
                : 'Create your first dynamic canvas template to get started.'
              }
            </p>
            <button
              onClick={onCreateNew}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Create Template</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Template Preview */}
                {/* <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-400" />
                </div> */}

                {/* Template Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 truncate" title={template.name}>
                    {template.name}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(template.created_at)}</span>
                  </div>

                  <div className="text-xs text-gray-400 mb-4">
                    {template.variables?.length || 0} variables
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleLoadTemplate(template)}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => setDeleteConfirm(template.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Template</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this template? This action cannot be undone.
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTemplate(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>)}
      </div>

      {/* New Category Modal */}
      {showNewCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex space-x-2">
                  {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newCategoryColor === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewCategory(false);
                  setNewCategoryName('');
                  setNewCategoryColor('#3B82F6');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {deleteCategoryConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Delete Category</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this category? Templates in this category will become uncategorized.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteCategoryConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(deleteCategoryConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};