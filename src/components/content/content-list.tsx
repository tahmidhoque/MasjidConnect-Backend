import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { ContentType } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  content: any;
  duration: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

export function ContentList() {
  const router = useRouter();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<ContentType | 'ALL'>('ALL');

  const contentTypes = Object.values(ContentType);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/content');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content item?')) return;

    try {
      await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      });
      await fetchContent(); // Refresh the list
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const filteredItems = selectedType === 'ALL' 
    ? items 
    : items.filter(item => item.type === selectedType);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button
            variant={selectedType === 'ALL' ? 'default' : 'outline'}
            onClick={() => setSelectedType('ALL')}
          >
            All
          </Button>
          {contentTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
        <Button onClick={() => router.push('/screens/content/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Content
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              Loading content...
            </CardContent>
          </Card>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No content items found. Create your first one!
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/screens/content/${item.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Type</p>
                    <p className="text-sm text-muted-foreground">{item.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">{item.duration}s</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
                      {item.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 