import React, { useState } from 'react';
import { Model } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { formatCurrency, formatNumber, cn } from './ui/utils';
import { X, ArrowLeft, Check, Minus, Calculator, Gauge } from 'lucide-react';

interface ComparisonViewProps {
  models: Model[];
  onRemove: (id: string) => void;
  onBack: () => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ models, onRemove, onBack }) => {
  const [inputTokens, setInputTokens] = useState<string>('10000');
  const [outputTokens, setOutputTokens] = useState<string>('3000');

  if (models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-muted-foreground">No models selected for comparison.</p>
        <Button onClick={onBack}>Back to List</Button>
      </div>
    );
  }

  const inputCount = parseInt(inputTokens) || 0;
  const outputCount = parseInt(outputTokens) || 0;

  // Define rows for comparison
  const rows = [
    { 
        label: 'Estimated Cost', 
        key: 'estimated_cost', 
        render: (m: Model) => {
            const pPrompt = parseFloat(m.pricing.prompt);
            const pComp = parseFloat(m.pricing.completion);
            if (isNaN(pPrompt) || isNaN(pComp)) return <span className="text-muted-foreground">-</span>;
            
            const cost = (pPrompt * inputCount) + (pComp * outputCount);
            return <span className="font-bold text-primary">{formatCurrency(cost)}</span>;
        }
    },
    { label: 'Context Length', key: 'context', render: (m: Model) => formatNumber(m.context_length) },
    { label: 'Throughput', key: 'throughput', render: (m: Model) => (
        m.top_provider?.throughput 
            ? <span className="text-sm font-mono flex items-center gap-1"><Gauge size={12} className="text-muted-foreground" /> {m.top_provider.throughput}</span> 
            : <span className="text-muted-foreground text-xs">-</span>
    )},
    { label: 'Input Price (1M)', key: 'input_price', render: (m: Model) => formatCurrency(parseFloat(m.pricing.prompt) * 1000000) },
    { label: 'Output Price (1M)', key: 'output_price', render: (m: Model) => formatCurrency(parseFloat(m.pricing.completion) * 1000000) },
    { label: 'Image Price', key: 'image_price', render: (m: Model) => parseFloat(m.pricing.image || '0') > 0 ? formatCurrency(parseFloat(m.pricing.image!) * 1000) + ' / 1k' : 'Free / NA' },
    { label: 'Request Price', key: 'req_price', render: (m: Model) => parseFloat(m.pricing.request || '0') > 0 ? formatCurrency(parseFloat(m.pricing.request!)) : '-' },
    { label: 'Modality', key: 'modality', render: (m: Model) => (
        <div className="flex flex-wrap gap-1">
            {m.architecture?.input_modalities?.map(mod => <Badge key={mod} variant="secondary" className="text-[10px]">{mod}</Badge>)}
            {!m.architecture?.input_modalities && <span className="text-sm text-muted-foreground">Text</span>}
        </div>
    )},
    { label: 'Output', key: 'output_modality', render: (m: Model) => (
        <div className="flex flex-wrap gap-1">
            {m.architecture?.output_modalities?.map(mod => <Badge key={mod} variant="secondary" className="text-[10px]">{mod}</Badge>)}
            {!m.architecture?.output_modalities && <span className="text-sm text-muted-foreground">Text</span>}
        </div>
    )},
    { label: 'Moderation', key: 'moderation', render: (m: Model) => (
        m.top_provider?.is_moderated 
            ? <span className="text-yellow-500 text-sm flex items-center gap-1"><Check size={14} /> Yes</span>
            : <span className="text-muted-foreground text-sm flex items-center gap-1"><Minus size={14} /> No</span>
    )},
    { label: 'Instruct Type', key: 'instruct', render: (m: Model) => <span className="text-sm font-mono text-muted-foreground">{m.architecture?.instruct_type || '-'}</span> },
    { label: 'Supported Params', key: 'params', render: (m: Model) => (
        <div className="flex flex-wrap gap-1">
            {m.supported_parameters?.map(p => (
                <Badge key={p} variant="outline" className="text-[10px] border-border/60">{p}</Badge>
            ))}
        </div>
    )},
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack} className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft size={16} /> Back to Browse
            </Button>
            <h2 className="text-2xl font-bold text-primary">Compare Models ({models.length})</h2>
            <div className="w-24"></div> 
        </div>

        {/* Calculator Section */}
        <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 text-primary font-semibold min-w-max">
                <Calculator size={20} />
                Cost Estimator
            </div>
            <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block ml-1">Input Tokens</label>
                    <Input 
                        type="number" 
                        min="0"
                        value={inputTokens} 
                        onChange={(e) => setInputTokens(e.target.value)}
                        className="bg-background/50 border-border/50 h-9"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block ml-1">Output Tokens</label>
                     <Input 
                        type="number" 
                        min="0"
                        value={outputTokens} 
                        onChange={(e) => setOutputTokens(e.target.value)}
                        className="bg-background/50 border-border/50 h-9"
                    />
                </div>
            </div>
             <div className="text-xs text-muted-foreground max-w-xs text-right hidden md:block">
                Enter token counts to calculate estimated cost per request based on current pricing.
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="min-w-max">
            {/* Header Row */}
            <div className="flex border-b border-border/50">
                <div className="w-48 p-4 shrink-0 font-semibold text-muted-foreground sticky left-0 bg-background/95 backdrop-blur z-10 border-r border-border/50 flex items-end pb-4">
                    Features
                </div>
                {models.map(model => (
                    <div key={model.id} className="w-72 p-4 shrink-0 border-r border-border/50 relative group bg-card/20">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-2 right-2 h-6 w-6 opacity-50 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onRemove(model.id)}
                        >
                            <X size={14} />
                        </Button>
                        <h3 className="font-bold text-lg text-primary truncate pr-6" title={model.name}>{model.name}</h3>
                        <p className="text-xs font-mono text-muted-foreground truncate mb-2" title={model.id}>{model.id}</p>
                        <div className="text-xs text-muted-foreground line-clamp-2 h-8" title={model.description}>{model.description}</div>
                    </div>
                ))}
            </div>

            {/* Data Rows */}
            <div className="divide-y divide-border/50">
                {rows.map((row) => (
                    <div key={row.key} className="flex hover:bg-muted/5 transition-colors">
                        <div className="w-48 p-4 shrink-0 text-sm font-medium text-muted-foreground sticky left-0 bg-background/95 backdrop-blur z-10 border-r border-border/50 flex items-center">
                            {row.label}
                        </div>
                        {models.map(model => (
                            <div key={`${model.id}-${row.key}`} className="w-72 p-4 shrink-0 border-r border-border/50 flex items-center">
                                {row.render(model)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};