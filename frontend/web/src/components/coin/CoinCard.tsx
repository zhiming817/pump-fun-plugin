import type { CoinEvent } from '@/types/coin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Twitter } from 'lucide-react';

interface CoinCardProps {
  coin: CoinEvent;
}

export function CoinCard({ coin }: CoinCardProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    // 使用 Asia/Shanghai 时区（UTC+8）
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Shanghai',
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {coin.image ? (
              <img
                src={coin.image}
                alt={coin.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/48';
                }}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {coin.symbol.charAt(0)}
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{coin.name}</CardTitle>
              <p className="text-sm text-muted-foreground">${coin.symbol}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {coin.twitter && (
              <a
                href={coin.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                <Twitter size={20} />
              </a>
            )}
            {coin.website && (
              <a
                href={coin.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-600"
              >
                <ExternalLink size={20} />
              </a>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Virtual SOL</p>
            <p className="font-semibold">
              {formatNumber(coin.virtual_sol_reserves / 1e9)} SOL
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Virtual Tokens</p>
            <p className="font-semibold">
              {formatNumber(coin.virtual_token_reserves / 1e9)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Real Tokens</p>
            <p className="font-semibold">
              {formatNumber(coin.real_token_reserves / 1e9)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Supply</p>
            <p className="font-semibold">
              {formatNumber(coin.token_total_supply / 1e9)}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Created: {formatDate(coin.created_at)}</span>
            <a
              href={`https://solscan.io/token/${coin.mint}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary flex items-center gap-1"
            >
              View on Solscan
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {coin.signature && (
          <div className="text-xs text-muted-foreground truncate">
            Signature: {coin.signature}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
