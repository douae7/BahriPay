import React, { useState } from 'react';
import { Anchor } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#062B45] via-[#0A4565] to-[#16C5C0]/40 text-[#7DDCEB] p-4 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Anchor className="w-8 h-8 mb-2 opacity-80" />
        <span className="text-xs font-medium text-[#F8FAFC]/80 text-center">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
