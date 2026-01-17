import React from 'react';
import { Model } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { formatCurrency, formatNumber, cn } from './ui/utils';
import { Coins, Box, Zap, Check } from 'lucide-react';

interface ModelCardProps {
  model: Model;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({ model, isSelected, onToggleSelect }) => {
  // Calculate price per 1M tokens for better readability
  const promptPricePer1M = parseFloat(model.pricing.prompt) * 1000000;
  const completionPricePer1M = parseFloat(model.pricing.completion) * 1000000;
  
  // A crude way to estimate if it's "free" or very cheap
  const isFree = promptPricePer1M === 0 && completionPricePer1M === 0;

  // Architecture fallback
  const modality = model.architecture?.modality || 
                   (model.architecture?.input_modalities?.join('/') || 'text');

  return (
    <Card 
      className={cn(
        "flex flex-col h-full transition-all group relative cursor-pointer",
        "bg-zinc-900/40 backdrop-blur-sm",
        isSelected 
          ? "border-primary shadow-[0_0_20px_-5px_rgba(236,72,153,0.4)] bg-primary/5" 
          : "border-border/50 hover:border-primary/50 hover:shadow-[0_0_20px_-10px_rgba(236,72,153,0.3)]"
      )}
      onClick={() => onToggleSelect(model.id)}
    >
      <div className="absolute top-3 right-3 z-10">
        <div className={cn(
            "w-5 h-5 rounded border flex items-center justify-center transition-colors",
            isSelected 
                ? "bg-primary border-primary text-primary-foreground" 
                : "border-muted-foreground/50 bg-background/50 hover:border-primary"
        )}>
            {isSelected && <Check size={12} strokeWidth={3} />}
        </div>
      </div>

      <CardHeader className="pb-3 pr-10">
        <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
                <CardTitle className="text-lg leading-tight truncate text-primary/90 group-hover:text-primary transition-colors" title={model.name}>
                {model.name}
                </CardTitle>
                <CardDescription className="text-xs mt-1 font-mono text-muted-foreground truncate" title={model.id}>
                {model.id}
                </CardDescription>
            </div>
        </div>
        {isFree && <Badge variant="secondary" className="w-fit mt-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20">Free</Badge>}
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Box size={12} /> Context
                </span>
                <div className="font-semibold text-sm">
                    {formatNumber(model.context_length)}
                </div>
            </div>
            <div className="space-y-1">
                 <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap size={12} /> Modality
                </span>
                <div className="font-semibold text-sm capitalize truncate">
                    {modality}
                </div>
            </div>
        </div>

        <div className="space-y-2 bg-muted/30 p-3 rounded-md border border-border/50">
            <div className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <Coins size={12} /> Pricing (per 1M tokens)
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Input</span>
                <span className="font-mono">{formatCurrency(promptPricePer1M)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Output</span>
                <span className="font-mono">{formatCurrency(completionPricePer1M)}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
         <div className="flex flex-wrap gap-1 w-full overflow-hidden h-6">
            {model.architecture?.instruct_type && (
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-border/50 text-muted-foreground">
                    {model.architecture.instruct_type}
                </Badge>
            )}
            {model.top_provider?.is_moderated && (
                 <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 border-border/50 text-yellow-500/70 border-yellow-500/20">
                    Moderated
                </Badge>
            )}
         </div>
      </CardFooter>
    </Card>
  );
};
