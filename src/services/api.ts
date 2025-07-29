const API_BASE_URL = 'http://localhost:3001/api/canvas';
// const API_BASE_URL = 'https://z0oco0o80g4oggcs4k400wo0.coolify.vpa.com.au/api/canvas';

export interface Category {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CanvasTemplate {
  id: string;
  name: string;
  config: any;
  elements: any[];
  variables: TemplateVariable[];
  category?: Category | null;
  category_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  id: string;
  template_id: string;
  variable_name: string;
  element_id: string;
  default_value: string;
}

export interface SaveTemplateRequest {
  name: string;
  config: any;
  elements: any[];
  categoryId?: string | null;
}

export interface CreateCategoryRequest {
  name: string;
  color?: string;
}

class ApiService {
  async saveTemplate(data: SaveTemplateRequest): Promise<CanvasTemplate> {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to save template: ${response.statusText}`);
    }

    return response.json();
  }

  async getTemplates(): Promise<CanvasTemplate[]> {
    const response = await fetch(`${API_BASE_URL}/templates`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch templates: ${response.statusText}`);
    }

    const data = await response.json();
    // Backend returns {templates: [...]} but we need just the array
    return data.templates || [];
  }

  async getTemplate(id: string): Promise<CanvasTemplate> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    const data = await response.json();
    // Backend now returns the template data directly, not wrapped in {template: ...}
    return data;
  }

  async updateTemplate(id: string, data: SaveTemplateRequest): Promise<CanvasTemplate> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update template: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete template: ${response.statusText}`);
    }
  }

  async getTemplateVariables(id: string): Promise<TemplateVariable[]> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}/variables`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch template variables: ${response.statusText}`);
    }

    return response.json();
  }

  getRenderUrl(templateId: string, params: Record<string, string> = {}): string {
    const searchParams = new URLSearchParams(params);
    return `${API_BASE_URL}/render/${templateId}?${searchParams.toString()}`;
  }

  // Category management methods
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/categories`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const data = await response.json();
    return data.categories || [];
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.statusText}`);
    }

    const result = await response.json();
    return result.category;
  }

  async updateCategory(id: string, data: CreateCategoryRequest): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update category: ${response.statusText}`);
    }

    const result = await response.json();
    return result.category;
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete category: ${response.statusText}`);
    }
  }
}

export const apiService = new ApiService();