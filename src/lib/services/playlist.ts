export interface PlaylistData {
  id: string
  name: string
  description?: string
  isDefault: boolean
  isActive: boolean
  items: PlaylistItemData[]
  createdAt: Date
  updatedAt: Date
}

export interface PlaylistItemData {
  id: string
  contentItemId: string
  order: number
}

export interface CreatePlaylistInput {
  name: string
  description?: string
  isDefault?: boolean
  isActive?: boolean
}

export interface UpdatePlaylistInput extends Partial<CreatePlaylistInput> {
  id: string
}

export async function getPlaylists(): Promise<PlaylistData[]> {
  const response = await fetch('/api/playlists')
  if (!response.ok) {
    throw new Error('Failed to fetch playlists')
  }
  return response.json()
}

export async function createPlaylist(data: CreatePlaylistInput): Promise<PlaylistData> {
  const response = await fetch('/api/playlists', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to create playlist')
  }
  return response.json()
}

export async function updatePlaylist(data: UpdatePlaylistInput): Promise<PlaylistData> {
  const response = await fetch(`/api/playlists/${data.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to update playlist')
  }
  return response.json()
}

export async function deletePlaylist(id: string): Promise<void> {
  const response = await fetch(`/api/playlists/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    throw new Error('Failed to delete playlist')
  }
}

export async function updatePlaylistItems(
  playlistId: string,
  items: { contentItemId: string; order: number }[]
): Promise<PlaylistData> {
  const response = await fetch(`/api/playlists/${playlistId}/items`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  })
  if (!response.ok) {
    throw new Error('Failed to update playlist items')
  }
  return response.json()
} 