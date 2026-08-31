import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize the look and feel of your dashboard.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Theme</CardTitle>
          <CardDescription>Select or customize your UI theme.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Color Scheme</Label>
            <RadioGroup defaultValue="system" className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
                <Label htmlFor="theme-light" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                  <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent w-full mb-3 bg-white h-24 flex">
                     <div className="w-1/3 bg-gray-100 h-full rounded-l-sm mr-2" />
                     <div className="w-2/3 bg-gray-50 h-full rounded-r-sm" />
                  </div>
                  Light Mode
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
                <Label htmlFor="theme-dark" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                  <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent w-full mb-3 bg-slate-950 h-24 flex">
                     <div className="w-1/3 bg-slate-900 h-full rounded-l-sm mr-2" />
                     <div className="w-2/3 bg-slate-800 h-full rounded-r-sm" />
                  </div>
                  Dark Mode
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
                <Label htmlFor="theme-system" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                  <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent w-full mb-3 bg-gradient-to-r from-white to-slate-950 h-24" />
                  System Default
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-muted-foreground">Reduce spacing to fit more content on screen.</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Reset to defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
