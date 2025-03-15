import React from 'react';
import { ContentType } from '@prisma/client';
import { ContentModal } from '@/components/common/ContentModal';
import { AnnouncementForm } from './announcement-form';
import { VerseHadithForm } from './verse-hadith-form';
import { EventForm } from './event-form';
import { CustomForm } from './custom-form';
import { useContentCreation } from './ContentCreationContext';

export function ContentCreationModal() {
  const { 
    isContentCreationModalOpen, 
    closeContentCreationModal, 
    currentContentType,
    onSuccessCallback
  } = useContentCreation();

  // Get the proper title based on content type
  const getTitle = () => {
    if (!currentContentType) return 'Create Content';
    
    switch (currentContentType) {
      case ContentType.ANNOUNCEMENT:
        return 'Create Announcement';
      case ContentType.VERSE_HADITH:
        return 'Create Verse/Hadith';
      case ContentType.EVENT:
        return 'Create Event';
      case ContentType.CUSTOM:
        return 'Create Custom Content';
      default:
        return 'Create Content';
    }
  };

  // Handle successful content creation
  const handleSuccess = () => {
    closeContentCreationModal();
    if (onSuccessCallback) {
      onSuccessCallback();
    }
  };

  // Render the appropriate form based on content type
  const renderForm = () => {
    if (!currentContentType) return null;

    switch (currentContentType) {
      case ContentType.ANNOUNCEMENT:
        return (
          <AnnouncementForm
            onSuccess={handleSuccess}
            onCancel={closeContentCreationModal}
          />
        );
      case ContentType.VERSE_HADITH:
        return (
          <VerseHadithForm
            onSuccess={handleSuccess}
            onCancel={closeContentCreationModal}
          />
        );
      case ContentType.EVENT:
        return (
          <EventForm
            onSuccess={handleSuccess}
            onCancel={closeContentCreationModal}
          />
        );
      case ContentType.CUSTOM:
        return (
          <CustomForm
            onSuccess={handleSuccess}
            onCancel={closeContentCreationModal}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ContentModal
      open={isContentCreationModalOpen}
      onClose={closeContentCreationModal}
      title={getTitle()}
      maxWidth="md"
    >
      {renderForm()}
    </ContentModal>
  );
} 