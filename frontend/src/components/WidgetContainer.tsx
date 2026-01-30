/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Widget container wrapper component
 */

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AutoScaleWrapper } from '@/components/AutoScaleWrapper';
import { HomeWidget } from '@/components/widgets/HomeWidget';
import { TextWidget } from '@/components/widgets/TextWidget';
import { FileViewerWidget } from '@/components/widgets/FileViewerWidget';
import { HTMLRendererWidget } from '@/components/widgets/HTMLRendererWidget';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { NewsWidget } from '@/components/widgets/NewsWidget';
import type { Widget } from '@/types/widget';
import type {
  HomeWidgetData,
  TextWidgetData,
  FileViewerWidgetData,
  HTMLRendererWidgetData,
  WeatherWidgetData,
  NewsWidgetData,
} from '@/types/widget';

interface WidgetContainerProps {
  widget: Widget;
}

// Widgets that benefit from auto-scaling (file/html excluded - iframes need direct rendering)
const SCALABLE_WIDGETS = ['text', 'home', 'news'];

export function WidgetContainer({ widget }: WidgetContainerProps) {
  const renderWidget = () => {
    switch (widget.type) {
      case 'home':
        return <HomeWidget data={widget.data as HomeWidgetData} />;
      case 'text':
        return <TextWidget data={widget.data as TextWidgetData} />;
      case 'file':
        return <FileViewerWidget data={widget.data as FileViewerWidgetData} />;
      case 'html':
        return <HTMLRendererWidget data={widget.data as HTMLRendererWidgetData} />;
      case 'weather':
        return <WeatherWidget data={widget.data as WeatherWidgetData} />;
      case 'news':
        return <NewsWidget data={widget.data as NewsWidgetData} />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Unknown widget type: {widget.type}</p>
          </div>
        );
    }
  };

  const shouldScale = SCALABLE_WIDGETS.includes(widget.type);

  const getWidgetTypeLabel = (type: string) => {
    switch (type) {
      case 'home':
        return 'Home';
      case 'text':
        return 'Text';
      case 'file':
        return 'File';
      case 'html':
        return 'HTML';
      case 'weather':
        return 'Wetter';
      case 'news':
        return 'News';
      default:
        return type;
    }
  };

  return (
    <Card className="h-full flex flex-col transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle>{widget.title}</CardTitle>
          <Badge variant="outline" className="ml-2">
            {getWidgetTypeLabel(widget.type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 flex flex-col">
        {shouldScale ? (
          <AutoScaleWrapper
            widgetId={widget.id}
            forceScrollable={widget.scrollable}
          >
            {renderWidget()}
          </AutoScaleWrapper>
        ) : (
          <div className="h-full w-full flex-1 min-h-0">
            {renderWidget()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
