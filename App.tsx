import React, { useState, useEffect, useMemo } from 'react';
import { fetchModels } from './services/openRouterService';
import { Model, SortOption } from './types';
import { ModelCard } from './components/ModelCard';
import { Filters } from './components/Filters';
import { ComparisonView } from './components/ComparisonView';
import { Loader2, AlertCircle, X, ArrowRight } from 'lucide-react';
import { Button } from './components/ui/button';
import { cn } from './components/ui/utils';

type ViewMode = 'grid' | 'compare';

const App: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selection & View State
  const [selectedModelIds, setSelectedModelIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [minContext, setMinContext] = useState(0);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('price_low_high');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchModels();
      setModels(data);
    } catch (err) {
      setError("Failed to load models. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const toggleModelSelection = (id: string) => {
    const newSet = new Set(selectedModelIds);
    if (newSet.has(id)) {
      newSet.delete(id);
      // If we remove the last model while in compare mode, go back to grid
      if (newSet.size === 0 && viewMode === 'compare') {
        setViewMode('grid');
      }
    } else {
      if (newSet.size >= 5) {
        alert("You can compare up to 5 models at a time.");
        return;
      }
      newSet.add(id);
    }
    setSelectedModelIds(newSet);
  };

  const clearSelection = () => {
    setSelectedModelIds(new Set());
    setViewMode('grid');
  };

  const filteredModels = useMemo(() => {
    let result = [...models];

    // Filter by Search Term
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(lowerTerm) || 
        m.id.toLowerCase().includes(lowerTerm)
      );
    }

    // Filter by Context
    if (minContext > 0) {
      result = result.filter(m => m.context_length >= minContext);
    }

    // Filter by Free
    if (showFreeOnly) {
      result = result.filter(m => {
        const p1 = parseFloat(m.pricing.prompt);
        const p2 = parseFloat(m.pricing.completion);
        return p1 === 0 && p2 === 0;
      });
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'price_low_high':
          const priceA = parseFloat(a.pricing.prompt) + parseFloat(a.pricing.completion);
          const priceB = parseFloat(b.pricing.prompt) + parseFloat(b.pricing.completion);
          return priceA - priceB;
        case 'price_high_low':
          const priceC = parseFloat(a.pricing.prompt) + parseFloat(a.pricing.completion);
          const priceD = parseFloat(b.pricing.prompt) + parseFloat(b.pricing.completion);
          return priceD - priceC;
        case 'context_high_low':
          return b.context_length - a.context_length;
        case 'name_a_z':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [models, searchTerm, minContext, showFreeOnly, sortOption]);

  // Derived state for comparison view
  const comparisonModels = useMemo(() => {
    return models.filter(m => selectedModelIds.has(m.id));
  }, [models, selectedModelIds]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div 
                    className="flex items-center gap-3 cursor-pointer" 
                    onClick={() => setViewMode('grid')}
                >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-background text-lg">
                        OR
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">
                        <span className="text-primary">OpenRouter</span> Model Explorer
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                     <div className="text-xs text-muted-foreground hidden sm:block">
                        {models.length > 0 && `Total Models: ${models.length}`}
                    </div>
                </div>
            </div>
        </header>

        <main className="container mx-auto px-4 py-8 flex-1">
            {viewMode === 'compare' ? (
                <ComparisonView 
                    models={comparisonModels} 
                    onRemove={toggleModelSelection} 
                    onBack={() => setViewMode('grid')} 
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-1">
                        <Filters 
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            minContext={minContext}
                            setMinContext={setMinContext}
                            sortOption={sortOption}
                            setSortOption={setSortOption}
                            showFreeOnly={showFreeOnly}
                            setShowFreeOnly={setShowFreeOnly}
                        />
                    </aside>

                    {/* Main Content */}
                    <section className="lg:col-span-3 pb-24">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-96 gap-4 text-muted-foreground">
                                <Loader2 className="animate-spin text-primary" size={48} />
                                <p>Fetching models from OpenRouter...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center h-96 gap-4 text-destructive">
                                <AlertCircle size={48} />
                                <p>{error}</p>
                                <Button onClick={loadData} variant="outline" className="border-destructive/50 hover:bg-destructive/10">Try Again</Button>
                            </div>
                        ) : filteredModels.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-96 gap-4 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                                <p className="text-lg">No models found matching your criteria.</p>
                                <Button onClick={() => {
                                    setSearchTerm('');
                                    setMinContext(0);
                                    setShowFreeOnly(false);
                                }} variant="link">Clear Filters</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredModels.map((model) => (
                                    <ModelCard 
                                        key={model.id} 
                                        model={model} 
                                        isSelected={selectedModelIds.has(model.id)}
                                        onToggleSelect={toggleModelSelection}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </main>

        {/* Floating Compare Bar */}
        {viewMode === 'grid' && selectedModelIds.size > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-10 duration-300">
                <div className="container mx-auto max-w-3xl">
                    <div className="bg-primary text-primary-foreground rounded-full shadow-lg p-3 px-6 flex items-center justify-between border border-primary-foreground/20 backdrop-blur-xl bg-primary/95">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-lg">{selectedModelIds.size}</span>
                            <span className="text-sm font-medium opacity-90">Models Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={clearSelection}
                                className="text-primary-foreground hover:bg-primary-foreground/20 hover:text-white h-8"
                            >
                                <X size={16} className="mr-1" /> Clear
                            </Button>
                            <Button 
                                size="sm" 
                                variant="secondary" 
                                onClick={() => setViewMode('compare')}
                                className="font-bold shadow-sm h-8"
                            >
                                Compare Now <ArrowRight size={16} className="ml-1" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default App;
