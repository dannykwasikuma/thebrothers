import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X } from 'lucide-react';
import { useActiveAnnouncement } from '@/hooks/useAnnouncements';

function isDismissed(id: string): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(`announcement-dismissed-${id}`) === '1';
}

function dismiss(id: string) {
  sessionStorage.setItem(`announcement-dismissed-${id}`, '1');
}

const AnnouncementBanner: React.FC = () => {
  const { data: announcement } = useActiveAnnouncement();
  const [closed, setClosed] = useState(false);

  if (!announcement || closed || isDismissed(announcement.id)) return null;

  const handleClose = () => {
    dismiss(announcement.id);
    setClosed(true);
  };

  const content = (
    <>
      <Megaphone className="h-4 w-4 flex-shrink-0" />
      <p className="text-sm font-sans flex-1 min-w-0 truncate sm:whitespace-normal sm:overflow-visible">
        {announcement.message}
      </p>
      {announcement.linkUrl && announcement.linkLabel && (
        <span className="text-sm font-medium underline underline-offset-2 flex-shrink-0 whitespace-nowrap">
          {announcement.linkLabel}
        </span>
      )}
    </>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-primary text-primary-foreground overflow-hidden"
      >
        <div className="container mx-auto px-4 py-2.5 flex items-center gap-3">
          {announcement.linkUrl ? (
            <Link href={announcement.linkUrl} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-90 transition-opacity">
              {content}
            </Link>
          ) : (
            <div className="flex items-center gap-3 flex-1 min-w-0">{content}</div>
          )}
          <button
            onClick={handleClose}
            aria-label="Dismiss announcement"
            className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnouncementBanner;
