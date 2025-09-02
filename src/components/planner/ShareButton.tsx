import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Share, Copy, Globe, Lock, ExternalLink } from 'lucide-react';

interface Itinerary {
  id?: string;
  title: string;
  waypoints: any[];
  days: any[];
  routeData: any;
  isPublic?: boolean;
  shareSlug?: string;
}

interface ShareButtonProps {
  itinerary: Itinerary;
  onShare?: (shareData: { isPublic: boolean; shareSlug?: string }) => Promise<void>;
}

const ShareButton: React.FC<ShareButtonProps> = ({ itinerary, onShare }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(itinerary.isPublic || false);
  const [shareSlug, setShareSlug] = useState(itinerary.shareSlug || '');
  const [isSharing, setIsSharing] = useState(false);

  const generateSlug = () => {
    const slug = itinerary.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
      + '-' + Math.random().toString(36).substr(2, 6);
    setShareSlug(slug);
  };

  const handleShare = async () => {
    if (!shareSlug && isPublic) {
      generateSlug();
      return;
    }

    setIsSharing(true);
    try {
      if (onShare) {
        await onShare({ isPublic, shareSlug: isPublic ? shareSlug : undefined });
      }

      if (isPublic && shareSlug) {
        const shareUrl = `${window.location.origin}/trip/${shareSlug}`;
        
        // Try native share first
        if (navigator.share) {
          try {
            await navigator.share({
              title: itinerary.title,
              text: `Check out my travel itinerary: ${itinerary.title}`,
              url: shareUrl
            });
            
            toast({
              title: "Shared Successfully!",
              description: "Your trip has been shared.",
            });
            setIsOpen(false);
            return;
          } catch (error) {
            // Fall back to copy link if native share fails
          }
        }

        // Copy to clipboard as fallback
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied!",
          description: "Share link has been copied to clipboard.",
        });
      } else {
        toast({
          title: "Privacy Updated!",
          description: "Your trip privacy settings have been updated.",
        });
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Share Failed",
        description: "Failed to share your trip. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSharing(false);
    }
  };

  const copyShareLink = async () => {
    if (!shareSlug) return;
    
    const shareUrl = `${window.location.origin}/trip/${shareSlug}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  const openPublicLink = () => {
    if (!shareSlug) return;
    const shareUrl = `${window.location.origin}/trip/${shareSlug}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Trip</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">Make trip public</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to view your trip with a shareable link
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {isPublic && (
            <div className="space-y-4">
              {/* Share URL */}
              <div className="space-y-2">
                <Label>Share URL</Label>
                <div className="flex space-x-2">
                  <Input
                    value={shareSlug}
                    onChange={(e) => setShareSlug(e.target.value)}
                    placeholder="Enter custom URL slug"
                  />
                  <Button
                    variant="outline"
                    onClick={generateSlug}
                  >
                    Generate
                  </Button>
                </div>
                {shareSlug && (
                  <p className="text-xs text-muted-foreground">
                    {window.location.origin}/trip/{shareSlug}
                  </p>
                )}
              </div>

              {/* Share Actions */}
              {shareSlug && itinerary.isPublic && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyShareLink}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openPublicLink}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Privacy Info */}
          <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
            {isPublic ? (
              <Globe className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
            )}
            <div className="text-sm">
              <p className="font-medium">
                {isPublic ? 'Public Trip' : 'Private Trip'}
              </p>
              <p className="text-muted-foreground">
                {isPublic 
                  ? 'Anyone with the link can view this trip, but they cannot edit it.'
                  : 'Only you can view and edit this trip.'
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleShare}
              disabled={isSharing}
              className="gradient-hero text-white border-0"
            >
              {isSharing ? 'Sharing...' : 'Share Trip'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareButton;