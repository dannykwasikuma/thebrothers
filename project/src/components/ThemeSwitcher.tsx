import React from 'react';
import { Palette, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const ThemeSwitcher: React.FC = () => {
  const { mode, setMode, palette, setPalette } = useTheme();

  const palettes = [
    'Royal Gold',
    'Midnight Blue',
    'Forest Green',
    'Deep Purple',
    'Classic Crimson',
  ] as const;

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shadow-2xl bg-card border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            <Palette className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4 mr-6 mb-2 border-primary/20" align="end" side="top">
          <div className="space-y-4">
            <div>
              <h4 className="font-serif font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wider">Mode</h4>
              <div className="flex gap-2">
                <Button
                  variant={mode === 'light' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setMode('light')}
                >
                  <Sun className="h-4 w-4 mr-2" /> Light
                </Button>
                <Button
                  variant={mode === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setMode('dark')}
                >
                  <Moon className="h-4 w-4 mr-2" /> Dark
                </Button>
                <Button
                  variant={mode === 'system' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setMode('system')}
                >
                  <Monitor className="h-4 w-4 mr-2" /> Sys
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-serif font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wider">Palette</h4>
              <div className="grid grid-cols-1 gap-2">
                {palettes.map((p) => (
                  <Button
                    key={p}
                    variant={palette === p ? 'default' : 'outline'}
                    size="sm"
                    className="justify-start font-sans"
                    onClick={() => setPalette(p)}
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: 
                          p === 'Royal Gold' ? 'hsl(44 55% 54%)' :
                          p === 'Midnight Blue' ? 'hsl(214 52% 24%)' :
                          p === 'Forest Green' ? 'hsl(100 57% 20%)' :
                          p === 'Deep Purple' ? 'hsl(268 82% 31%)' :
                          'hsl(0 100% 27%)'
                      }}
                    />
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ThemeSwitcher;
