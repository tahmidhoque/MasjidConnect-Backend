import { ContentType } from "@prisma/client"

export interface ContentItemData {
  id: string
  title: string
  type: ContentType
  content: any
  duration: number
  isActive: boolean
  startDate?: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateContentItemInput {
  title: string
  type: ContentType
  content: any
  duration?: number
  isActive?: boolean
  startDate?: Date
  endDate?: Date
}

export interface UpdateContentItemInput extends Partial<CreateContentItemInput> {
  id: string
}

export async function getContentItems(): Promise<ContentItemData[]> {
  const response = await fetch('/api/content')
  if (!response.ok) {
    throw new Error('Failed to fetch content items')
  }
  return response.json()
}

export async function createContentItem(data: CreateContentItemInput): Promise<ContentItemData> {
  const response = await fetch('/api/content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to create content item')
  }
  return response.json()
}

export async function updateContentItem(data: UpdateContentItemInput): Promise<ContentItemData> {
  const response = await fetch(`/api/content/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) {
    // Try to get detailed error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update content item');
    } catch (e) {
      // If we can't parse the error response, throw a generic error
      throw new Error(`Failed to update content item (Status: ${response.status})`);
    }
  }
  
  return response.json();
}

export async function deleteContentItem(id: string): Promise<void> {
  const response = await fetch(`/api/content/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete content item')
  }
} 