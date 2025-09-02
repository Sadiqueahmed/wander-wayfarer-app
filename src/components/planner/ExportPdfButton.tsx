import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Map, Route, Calendar, Image } from 'lucide-react';
import { exportItineraryPdf } from '@/lib/pdf/exportItineraryPdf';

interface Itinerary {
  id?: string;
  title: string;
  waypoints: any[];
  days: any[];
  routeData: any;
  shareSlug?: string;
}

interface ExportOptions {
  includeCoverPage: boolean;
  includeOverviewMap: boolean;
  includeDayMaps: boolean;
  includeTurnByTurn: boolean;
  includeDaySummaries: boolean;
  includeQRCode: boolean;
}

interface ExportPdfButtonProps {
  itinerary: Itinerary;
  mapboxToken: string;
}

const ExportPdfButton: React.FC<ExportPdfButtonProps> = ({ itinerary, mapboxToken }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeCoverPage: true,
    includeOverviewMap: true,
    includeDayMaps: true,
    includeTurnByTurn: true,
    includeDaySummaries: true,
    includeQRCode: true,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportItineraryPdf(itinerary, exportOptions, mapboxToken);
      
      toast({
        title: "PDF Exported!",
        description: "Your trip itinerary has been downloaded as a PDF.",
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const updateOption = (key: keyof ExportOptions, value: boolean) => {
    setExportOptions(prev => ({ ...prev, [key]: value }));
  };

  const estimatedPages = () => {
    let pages = 0;
    if (exportOptions.includeCoverPage) pages += 1;
    if (exportOptions.includeOverviewMap) pages += 1;
    if (exportOptions.includeDayMaps && itinerary.days) pages += itinerary.days.length;
    if (exportOptions.includeTurnByTurn) pages += Math.ceil((itinerary.routeData?.steps?.length || 0) / 20);
    if (exportOptions.includeDaySummaries && itinerary.days) pages += Math.ceil(itinerary.days.length / 2);
    return Math.max(1, pages);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Trip as PDF</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Create a comprehensive PDF with maps, navigation, and day-by-day details for your trip.
          </p>

          {/* Export Options */}
          <div className="space-y-4">
            <h4 className="font-medium">Include in PDF:</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="coverPage"
                  checked={exportOptions.includeCoverPage}
                  onCheckedChange={(checked) => updateOption('includeCoverPage', !!checked)}
                />
                <Label htmlFor="coverPage" className="flex items-center text-sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Cover Page with Trip Summary
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overviewMap"
                  checked={exportOptions.includeOverviewMap}
                  onCheckedChange={(checked) => updateOption('includeOverviewMap', !!checked)}
                />
                <Label htmlFor="overviewMap" className="flex items-center text-sm">
                  <Map className="h-4 w-4 mr-2" />
                  Overview Route Map
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dayMaps"
                  checked={exportOptions.includeDayMaps}
                  onCheckedChange={(checked) => updateOption('includeDayMaps', !!checked)}
                />
                <Label htmlFor="dayMaps" className="flex items-center text-sm">
                  <Image className="h-4 w-4 mr-2" />
                  Individual Day Maps
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="turnByTurn"
                  checked={exportOptions.includeTurnByTurn}
                  onCheckedChange={(checked) => updateOption('includeTurnByTurn', !!checked)}
                />
                <Label htmlFor="turnByTurn" className="flex items-center text-sm">
                  <Route className="h-4 w-4 mr-2" />
                  Turn-by-Turn Directions
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="daySummaries"
                  checked={exportOptions.includeDaySummaries}
                  onCheckedChange={(checked) => updateOption('includeDaySummaries', !!checked)}
                />
                <Label htmlFor="daySummaries" className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Day-by-Day Itinerary
                </Label>
              </div>

              {itinerary.shareSlug && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="qrCode"
                    checked={exportOptions.includeQRCode}
                    onCheckedChange={(checked) => updateOption('includeQRCode', !!checked)}
                  />
                  <Label htmlFor="qrCode" className="flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2" />
                    QR Code for Online Version
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* PDF Info */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Estimated pages:</span>
              <span className="font-medium">{estimatedPages()}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span>File format:</span>
              <span className="font-medium">PDF</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="gradient-hero text-white border-0"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportPdfButton;