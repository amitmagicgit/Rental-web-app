import { useEffect } from 'react';
import { Listing } from '@shared/schema';

interface ListingMetaTagsProps {
  listing: Listing;
}

export function ListingMetaTags({ listing }: ListingMetaTagsProps) {
  useEffect(() => {
    // Determine source platform from URL
    const isFacebook = listing.url.includes('facebook.com');
    
    // Get the main image URL - for Facebook, skip the first attachment
    const mainImageUrl = listing.attachments?.[isFacebook ? 1 : 0] || '';

    // Update meta tags
    const metaTags = [
      { property: 'og:title', content: listing.description },
      { property: 'og:description', content: listing.detailedDescription || '' },
      { property: 'og:image', content: mainImageUrl },
      { property: 'og:url', content: window.location.href },
      { property: 'og:type', content: 'website' },
    ];

    // Remove existing meta tags
    const existingMetaTags = document.querySelectorAll('meta[property^="og:"]');
    existingMetaTags.forEach(tag => tag.remove());

    // Add new meta tags
    metaTags.forEach(tag => {
      const metaTag = document.createElement('meta');
      metaTag.setAttribute('property', tag.property);
      metaTag.setAttribute('content', tag.content);
      document.head.appendChild(metaTag);
    });

    // Cleanup function to remove meta tags when component unmounts
    return () => {
      const metaTags = document.querySelectorAll('meta[property^="og:"]');
      metaTags.forEach(tag => tag.remove());
    };
  }, [listing]);

  return null;
} 