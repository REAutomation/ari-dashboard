/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - HTML renderer widget component
 */

import type { HTMLRendererWidgetData } from '@/types/widget';

interface HTMLRendererWidgetProps {
  data: HTMLRendererWidgetData;
}

export function HTMLRendererWidget({ data }: HTMLRendererWidgetProps) {
  if (data.svgContent) {
    return (
      <div
        className="h-full w-full flex items-center justify-center p-4"
        dangerouslySetInnerHTML={{ __html: data.svgContent }}
      />
    );
  }

  if (data.html) {
    return (
      <iframe
        srcDoc={data.html}
        className="w-full h-full border-0"
        sandbox="allow-scripts"
        title="HTML Content"
      />
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-6 text-muted-foreground">
      <p>No content to display</p>
    </div>
  );
}
