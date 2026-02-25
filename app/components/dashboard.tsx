'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Globe,
  MapPin,
  DollarSign,
  Euro,
  Banknote,
  Coins,
  Gem,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRegion, type Region } from '@/contexts/region-context';
import { useTokenBalances, TOKEN_REGIONS } from '@/hooks/use-token-balances';
import { useAuth } from '@/hooks/use-auth';
import { useAccount } from 'wagmi';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  getRegionStyle,
  getAnimationStyle,
} from '@/lib/styles/style-utils';
import {
  getAvailableTokensByRegion,
} from '@/lib/tokens/token-data';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Region data with icons
const regions: {
  id: Region;
  name: string;
  icon: React.ElementType;
}[] = [
  { id: 'All', name: 'All Regions', icon: Globe },
  { id: 'Africa', name: 'Africa', icon: MapPin },
  { id: 'Europe', name: 'Europe', icon: Euro },
  { id: 'USA', name: 'USA', icon: DollarSign },
  { id: 'LatAm', name: 'Latin America', icon: Banknote },
  { id: 'Asia', name: 'Asia', icon: Coins },
  { id: 'RWA', name: 'Real World Assets', icon: Gem },
];

// Helper: format balance
function formatBalance(balance: string): string {
  if (!balance || balance === 'NaN') return '0.00';
  const num = Number.parseFloat(balance);
  if (Number.isNaN(num)) return '0.00';
  if (num === 0) return '0.00';
  if (num < 0.01) {
    if (num < 0.0001) return num.toExponential(2);
    return num.toFixed(4);
  }
  return num.toFixed(2);
}

// Calculate region totals from balances
function calculateRegionTotals(
  balances: Record<
    string,
    { amount: string; value: number; loading: boolean; error: string | null }
  >,
) {
  const totals: Record<string, number> = {};
  let totalValue = 0;

  Object.keys(TOKEN_REGIONS).forEach((region) => {
    if (region !== 'All') {
      totals[region] = 0;
    }
  });

  Object.entries(TOKEN_REGIONS).forEach(([region, tokens]) => {
    if (region !== 'All') {
      tokens.forEach((token) => {
        if (balances[token]) {
          totals[region] += balances[token].value;
          totalValue += balances[token].value;
        }
      });
    }
  });

  return { totals, totalValue };
}

// Calculate DiversiScore
function calculateDiversiScore(
  balances: Record<string, { amount: string; value: number; loading: boolean; error: string | null }>,
): { score: number | null; hasData: boolean } {
  const { totals } = calculateRegionTotals(balances);
  const activeRegionsCount = Object.values(totals).filter((v) => v > 0).length;
  const hasData = Object.values(totals).some((v) => v > 0);

  if (hasData) {
    const score = Math.min(Math.ceil(activeRegionsCount * 1.7), 10);
    return { score, hasData };
  }
  return { score: null, hasData: false };
}

// Quick action definitions
const quickActions = [
  {
    title: 'Get Stablecoins',
    description: 'Acquire region-specific stablecoins across multiple chains',
    icon: Coins,
    href: '/chat',
    regionStyle: 'USA' as const,
    prompt: 'I want to get stablecoins. What are my options?',
  },
  {
    title: 'Social Setup',
    description: 'Connect to Farcaster, Lens, and decentralized social networks',
    icon: Globe,
    href: '/chat',
    regionStyle: 'Asia' as const,
    prompt: 'Help me set up my social profiles on Farcaster and Lens',
  },
  {
    title: 'Starter Kits',
    description: 'Get everything you need to start your onchain journey',
    icon: Sparkles,
    href: '/starter-kits',
    regionStyle: 'RWA' as const,
  },
  {
    title: 'View Dashboard',
    description: 'Track your portfolio, diversification score, and analytics',
    icon: TrendingUp,
    href: '/profile',
    regionStyle: 'Africa' as const,
  },
];

export function Dashboard() {
  const { selectedRegion, setSelectedRegion } = useRegion();
  const { balances, isLoading, refreshBalances, totalValue } = useTokenBalances(selectedRegion);
  const { isAuthenticated } = useAuth();
  const { isConnected } = useAccount();
  const isMobile = useIsMobile();

  const { score: diversiScore, hasData: hasBalanceData } = useMemo(
    () => calculateDiversiScore(balances),
    [balances],
  );

  const { totals, totalValue: computedTotal } = useMemo(
    () => calculateRegionTotals(balances),
    [balances],
  );

  const activeRegions = useMemo(
    () => Object.entries(totals).filter(([_, v]) => v > 0),
    [totals],
  );

  return (
    <div
      className={cn(
        'flex flex-col gap-6 w-full',
        'py-6 px-1',
        'md:py-10 md:px-0',
      )}
    >
      {/* Hero Section */}
      <section className="text-center space-y-3">
        <h1
          className={cn(
            'font-bold tracking-tight',
            isMobile ? 'text-2xl' : 'text-4xl',
            getAnimationStyle(),
          )}
        >
          Stable Station
        </h1>
        <p
          className={cn(
            'text-muted-foreground max-w-lg mx-auto',
            isMobile ? 'text-sm px-2' : 'text-base',
            getAnimationStyle(100),
          )}
        >
          Your hub for stablecoins and real world assets.
          Diversify across regions, chains, and currencies.
        </p>
      </section>

      {/* Portfolio Summary Card */}
      <section className={cn(getAnimationStyle(200))}>
        <Card className="overflow-hidden">
          <CardContent className={cn('p-0')}>
            {/* Portfolio header */}
            <div
              className={cn(
                'flex items-center justify-between',
                'px-4 py-3 md:px-6 md:py-4',
                'border-b',
                'bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30',
              )}
            >
              <div className="flex items-center gap-3">
                <Globe className="size-5 text-blue-500" />
                <div>
                  <h2 className="font-semibold text-sm md:text-base">Portfolio Overview</h2>
                  <p className="text-xs text-muted-foreground">
                    {isConnected ? 'Your stablecoin holdings' : 'Connect wallet to view holdings'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasBalanceData && diversiScore !== null && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 cursor-help"
                        >
                          DiversiScore: {diversiScore}/10
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs">
                        Measure of geographic portfolio concentration
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshBalances}
                  disabled={isLoading}
                  className="text-xs h-8"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-3 mr-1 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Refresh'
                  )}
                </Button>
              </div>
            </div>

            {/* Region selector */}
            <div className="px-4 py-3 md:px-6 border-b">
              <div className="flex flex-wrap gap-1.5 justify-center">
                {regions.map((region) => {
                  const availableTokens = getAvailableTokensByRegion(region.id);
                  const isSelected = selectedRegion === region.id;
                  return (
                    <button
                      key={region.id}
                      onClick={() => setSelectedRegion(region.id)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md transition-all',
                        isSelected
                          ? cn(
                              getRegionStyle(region.id === 'All' ? 'default' : region.id, 'medium', 'bg'),
                              'font-medium shadow-sm',
                            )
                          : cn(
                              'hover:bg-muted',
                              'text-muted-foreground hover:text-foreground',
                            ),
                      )}
                    >
                      <region.icon className="size-3.5" />
                      <span>{region.name}</span>
                      {availableTokens.length > 0 && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] px-1 py-0 h-4 ml-0.5',
                            isSelected
                              ? 'border-current/30'
                              : 'bg-muted border-muted-foreground/20',
                          )}
                        >
                          {availableTokens.length}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Balances grid */}
            <div className="p-4 md:px-6">
              {!isLoading && Object.keys(balances).length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    {isConnected
                      ? 'Click Refresh to load your stablecoin balances'
                      : 'Connect your wallet to see your stablecoin holdings across regions'}
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="flex flex-col items-center py-6 gap-2">
                  <Loader2 className="size-6 animate-spin text-blue-500" />
                  <p className="text-sm text-muted-foreground">Loading balances...</p>
                </div>
              )}

              {!isLoading && Object.keys(balances).length > 0 && selectedRegion === 'All' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.keys(TOKEN_REGIONS)
                    .filter((r) => r !== 'All' && r !== 'RWA')
                    .map((region) => {
                      const amount = totals[region] || 0;
                      const pct = computedTotal > 0 ? ((amount / computedTotal) * 100).toFixed(1) : '0';
                      return (
                        <button
                          key={region}
                          onClick={() => setSelectedRegion(region as Region)}
                          className={cn(
                            'flex flex-col gap-1 p-3 rounded-lg border transition-all text-left',
                            'hover:shadow-sm hover:border-foreground/20',
                            amount > 0
                              ? getRegionStyle(region, 'light', 'bg')
                              : 'bg-muted/30',
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium">{region}</span>
                            <div
                              className={cn(
                                'size-2 rounded-full',
                                amount > 0
                                  ? getRegionStyle(region, 'strong', 'bg')
                                  : 'bg-muted-foreground/20',
                              )}
                            />
                          </div>
                          <span className="text-lg font-semibold tabular-nums">
                            ${formatBalance(amount.toString())}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{pct}% of portfolio</span>
                        </button>
                      );
                    })}
                </div>
              )}

              {!isLoading && Object.keys(balances).length > 0 && selectedRegion !== 'All' && (
                <div className="space-y-2">
                  <div
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-md mb-3',
                      getRegionStyle(selectedRegion, 'light', 'bg'),
                    )}
                  >
                    <div
                      className={cn(
                        'w-1.5 h-6 rounded-full',
                        getRegionStyle(selectedRegion, 'strong', 'bg'),
                      )}
                    />
                    <span className="text-sm font-medium flex-1">{selectedRegion}</span>
                    <span className="text-sm text-muted-foreground">
                      ${formatBalance((totals[selectedRegion] || 0).toString())}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {(TOKEN_REGIONS[selectedRegion as keyof typeof TOKEN_REGIONS] || []).map(
                      (token) => {
                        const tokenData = balances[token];
                        return (
                          <div
                            key={token}
                            className="flex items-center justify-between py-1.5 px-2 text-sm rounded hover:bg-muted/50"
                          >
                            <span>{token}</span>
                            <span className="tabular-nums text-muted-foreground">
                              {tokenData ? formatBalance(tokenData.amount) : '0.00'}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className={cn('space-y-3', getAnimationStyle(300))}>
        <h2 className={cn('font-semibold text-center', isMobile ? 'text-lg' : 'text-xl')}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card
                className={cn(
                  'group transition-all cursor-pointer',
                  'hover:shadow-md hover:border-foreground/20',
                  'active:scale-[0.98]',
                )}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div
                    className={cn(
                      'flex items-center justify-center size-10 rounded-lg shrink-0',
                      getRegionStyle(action.regionStyle, 'light', 'bg'),
                    )}
                  >
                    <action.icon
                      className={cn(
                        'size-5',
                        getRegionStyle(action.regionStyle, 'medium', 'text'),
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Chat CTA */}
      <section className={cn('text-center', getAnimationStyle(400))}>
        <Card
          className={cn(
            'bg-gradient-to-br from-blue-50/80 to-purple-50/80 dark:from-blue-950/40 dark:to-purple-950/40',
            'border-blue-200/50 dark:border-blue-800/50',
          )}
        >
          <CardContent className="py-6 px-4 md:px-8 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center size-12 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <MessageSquare className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-base">AI Assistant</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Get personalized help with stablecoins, wallet setup, social onboarding, and more
              </p>
            </div>
            <Link href="/chat">
              <Button className="mt-1 gap-2">
                <MessageSquare className="size-4" />
                Start a Conversation
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
