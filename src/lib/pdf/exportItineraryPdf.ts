import jsPDF from 'jspdf';

interface ExportOptions {
  includeCoverPage: boolean;
  includeOverviewMap: boolean;
  includeDayMaps: boolean;
  includeTurnByTurn: boolean;
  includeDaySummaries: boolean;
  includeQRCode: boolean;
}

interface Itinerary {
  id?: string;
  title: string;
  waypoints: any[];
  days: any[];
  routeData: any;
  shareSlug?: string;
}

export const exportItineraryPdf = async (
  itinerary: Itinerary,
  options: ExportOptions,
  mapboxToken: string
): Promise<void> => {
  const pdf = new jsPDF();
  let currentPage = 1;
  const pageHeight = pdf.internal.pageSize.height;
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;

  // Helper function to add a new page
  const addNewPage = () => {
    pdf.addPage();
    currentPage++;
  };

  // Helper function to add text with word wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 12) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + (lines.length * fontSize * 0.6);
  };

  // Helper function to generate QR code data URL
  const generateQRCode = (text: string): string => {
    // This is a simplified QR code implementation
    // In production, you'd use a proper QR code library
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 100;
    
    if (ctx) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = '#ffffff';
      ctx.font = '8px monospace';
      ctx.fillText('QR Code', 30, 50);
    }
    
    return canvas.toDataURL();
  };

  // Helper function to get static map image
  const getStaticMapImage = async (waypoints: any[], width = 400, height = 300): Promise<string> => {
    if (waypoints.length === 0) return '';

    try {
      // Build waypoints string for Mapbox Static API
      const markers = waypoints
        .filter(wp => wp.lat !== 0 && wp.lng !== 0)
        .map((wp, index) => {
          const color = wp.type === 'start' ? 'f60' : wp.type === 'end' ? 'f00' : '0f0';
          return `pin-s+${color}(${wp.lng},${wp.lat})`;
        })
        .join(',');

      // Calculate bounding box
      const lats = waypoints.filter(wp => wp.lat !== 0).map(wp => wp.lat);
      const lngs = waypoints.filter(wp => wp.lng !== 0).map(wp => wp.lng);
      
      if (lats.length === 0 || lngs.length === 0) return '';

      const bbox = [
        Math.min(...lngs) - 0.1,
        Math.min(...lats) - 0.1,
        Math.max(...lngs) + 0.1,
        Math.max(...lats) + 0.1
      ].join(',');

      const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${markers}/${bbox}/${width}x${height}@2x?access_token=${mapboxToken}`;

      // Convert image to base64
      const response = await fetch(mapUrl);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error generating static map:', error);
      return '';
    }
  };

  // Cover Page
  if (options.includeCoverPage) {
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(itinerary.title, margin, 40);

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    
    let yPos = 70;
    
    // Trip summary
    pdf.text('Trip Summary', margin, yPos);
    yPos += 20;

    if (itinerary.waypoints.length > 0) {
      const startPoint = itinerary.waypoints.find(wp => wp.type === 'start');
      const endPoint = itinerary.waypoints.find(wp => wp.type === 'end');
      
      if (startPoint) {
        yPos = addWrappedText(`From: ${startPoint.name}`, margin, yPos, pageWidth - 2 * margin, 12);
      }
      
      if (endPoint) {
        yPos = addWrappedText(`To: ${endPoint.name}`, margin, yPos + 5, pageWidth - 2 * margin, 12);
      }
    }

    if (itinerary.routeData?.distance) {
      yPos = addWrappedText(`Total Distance: ${itinerary.routeData.distance.toFixed(0)} km`, margin, yPos + 10, pageWidth - 2 * margin, 12);
    }

    if (itinerary.routeData?.duration) {
      const hours = Math.floor(itinerary.routeData.duration / 60);
      const minutes = Math.floor(itinerary.routeData.duration % 60);
      yPos = addWrappedText(`Driving Time: ${hours}h ${minutes}m`, margin, yPos + 5, pageWidth - 2 * margin, 12);
    }

    if (itinerary.days.length > 0) {
      yPos = addWrappedText(`Duration: ${itinerary.days.length} days`, margin, yPos + 5, pageWidth - 2 * margin, 12);
    }

    // Add generation timestamp
    const timestamp = new Date().toLocaleDateString();
    yPos = addWrappedText(`Generated: ${timestamp}`, margin, yPos + 20, pageWidth - 2 * margin, 10);

    // QR Code
    if (options.includeQRCode && itinerary.shareSlug) {
      const qrCodeData = generateQRCode(`${window.location.origin}/trip/${itinerary.shareSlug}`);
      if (qrCodeData) {
        pdf.addImage(qrCodeData, 'PNG', pageWidth - 120, yPos + 20, 80, 80);
        pdf.setFontSize(10);
        pdf.text('Scan for online version', pageWidth - 120, yPos + 110);
      }
    }

    addNewPage();
  }

  // Table of Contents
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Table of Contents', margin, 40);

  let tocY = 60;
  let pageNum = currentPage + 1;

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');

  if (options.includeOverviewMap) {
    pdf.text(`Route Overview Map ..................................... ${pageNum}`, margin, tocY);
    tocY += 15;
    pageNum++;
  }

  if (options.includeDaySummaries && itinerary.days.length > 0) {
    pdf.text(`Day-by-Day Itinerary ................................... ${pageNum}`, margin, tocY);
    tocY += 15;
    pageNum += Math.ceil(itinerary.days.length / 2);
  }

  if (options.includeTurnByTurn && itinerary.routeData?.steps) {
    pdf.text(`Turn-by-Turn Directions ............................... ${pageNum}`, margin, tocY);
    tocY += 15;
    pageNum += Math.ceil(itinerary.routeData.steps.length / 20);
  }

  if (options.includeDayMaps && itinerary.days.length > 0) {
    pdf.text(`Day Maps ................................................ ${pageNum}`, margin, tocY);
    pageNum += itinerary.days.length;
  }

  addNewPage();

  // Overview Map
  if (options.includeOverviewMap && itinerary.waypoints.length > 0) {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Route Overview', margin, 40);

    try {
      const mapImage = await getStaticMapImage(itinerary.waypoints, 400, 300);
      if (mapImage) {
        pdf.addImage(mapImage, 'PNG', margin, 60, pageWidth - 2 * margin, 200);
      }
    } catch (error) {
      pdf.setFontSize(12);
      pdf.text('Map could not be generated', margin, 100);
    }

    // Legend
    let legendY = 280;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Legend:', margin, legendY);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFillColor(255, 107, 53); // Start color
    pdf.rect(margin, legendY + 10, 10, 10, 'F');
    pdf.text('Start Point', margin + 15, legendY + 18);
    
    pdf.setFillColor(34, 197, 94); // Waypoint color
    pdf.rect(margin + 100, legendY + 10, 10, 10, 'F');
    pdf.text('Waypoints', margin + 115, legendY + 18);
    
    pdf.setFillColor(239, 68, 68); // End color
    pdf.rect(margin + 200, legendY + 10, 10, 10, 'F');
    pdf.text('End Point', margin + 215, legendY + 18);

    addNewPage();
  }

  // Day-by-Day Summaries
  if (options.includeDaySummaries && itinerary.days.length > 0) {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Day-by-Day Itinerary', margin, 40);

    let dayY = 60;

    itinerary.days.forEach((day: any, index: number) => {
      if (dayY > pageHeight - 100) {
        addNewPage();
        dayY = 40;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Day ${index + 1}`, margin, dayY);
      
      if (day.date) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(new Date(day.date).toLocaleDateString(), margin + 60, dayY);
      }

      dayY += 20;

      // Day summary
      if (day.summary) {
        pdf.setFontSize(10);
        pdf.text(`Distance: ${day.summary.distanceKm?.toFixed(0) || 0} km | ` +
                 `Duration: ${Math.floor((day.summary.durationMin || 0) / 60)}h ${Math.floor((day.summary.durationMin || 0) % 60)}m | ` +
                 `Est. Cost: ₹${day.summary.estimatedCost?.toFixed(0) || 0}`, margin, dayY);
        dayY += 15;
      }

      // Day items
      if (day.items && day.items.length > 0) {
        day.items.forEach((item: any) => {
          if (dayY > pageHeight - 60) {
            addNewPage();
            dayY = 40;
          }

          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          dayY = addWrappedText(`• ${item.title}`, margin + 10, dayY, pageWidth - 2 * margin - 10, 11);
          
          if (item.details) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            dayY = addWrappedText(`  ${item.details}`, margin + 20, dayY + 2, pageWidth - 2 * margin - 20, 10);
          }

          if (item.time || item.cost) {
            pdf.setFontSize(9);
            let info = '';
            if (item.time) info += `Time: ${item.time}`;
            if (item.cost) info += (info ? ' | ' : '') + `Cost: ${item.cost}`;
            dayY = addWrappedText(`  ${info}`, margin + 20, dayY + 2, pageWidth - 2 * margin - 20, 9);
          }

          dayY += 10;
        });
      }

      dayY += 15;
    });

    addNewPage();
  }

  // Turn-by-Turn Directions
  if (options.includeTurnByTurn && itinerary.routeData?.steps) {
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Turn-by-Turn Directions', margin, 40);

    let stepY = 60;
    pdf.setFontSize(11);

    itinerary.routeData.steps.forEach((step: any, index: number) => {
      if (stepY > pageHeight - 60) {
        addNewPage();
        stepY = 40;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.text(`${index + 1}.`, margin, stepY);
      
      pdf.setFont('helvetica', 'normal');
      const instruction = step.maneuver?.instruction || step.name || 'Continue';
      stepY = addWrappedText(instruction, margin + 15, stepY, pageWidth - 2 * margin - 15, 11);
      
      if (step.distance) {
        pdf.setFontSize(9);
        pdf.text(`${(step.distance / 1000).toFixed(1)} km`, margin + 15, stepY + 2);
        stepY += 10;
      }

      stepY += 8;
    });
  }

  // Save the PDF
  const fileName = `${itinerary.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}_itinerary.pdf`;
  pdf.save(fileName);
};