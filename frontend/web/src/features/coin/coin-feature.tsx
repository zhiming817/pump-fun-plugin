import { useState } from 'react';
import { useCoinList } from '@/hooks/use-coin-api';
import { CoinCard } from '@/components/coin/CoinCard';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CoinFeature() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(9);
  
  const { data, isLoading, error, refetch } = useCoinList(page, pageSize);

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">加载失败</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">
              {error instanceof Error ? error.message : '未知错误'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coin Events</h1>
          <p className="text-muted-foreground mt-1">
            {data ? `共 ${data.total} 个代币` : 'Loading...'}
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              加载中...
            </>
          ) : (
            '刷新'
          )}
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && !data && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Coin Grid */}
      {data && data.data.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((coin) => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              第 {page} 页，共 {totalPages} 页
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
              >
                下一页
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {data && data.data.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">暂无代币数据</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
