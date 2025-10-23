/**
 * API Client for communicating with the backend oath checking service
 */

import type {
  CheckOathRequest,
  CheckOathResponse,
  MemeData,
  OathStatus,
} from '@/types';

/**
 * Configuration for API client
 */
const API_CONFIG = {
  endpoint: 'https://api.your-backend.com/v1/memes/check-oath',
  timeout: 10000, // 10 seconds
  useMock: true, // 设置为 false 使用真实后端
};

/**
 * Generate mock data for testing
 */
function generateMockData(memeIds: string[]): Record<string, MemeData> {
  const result: Record<string, MemeData> = {};
  
  memeIds.forEach((id, index) => {
    // 模拟不同的状态
    const mockType = index % 4;
    
    switch (mockType) {
      case 0:
        // 已质押
        result[id] = {
          status: 'OATHED' as OathStatus,
        };
        break;
      case 1:
        // 未质押 - 高风险
        result[id] = {
          status: 'NOT_OATHED' as OathStatus,
          centralizationRisk: 0.85,
        };
        break;
      case 2:
        // 未质押 - 中等风险
        result[id] = {
          status: 'NOT_OATHED' as OathStatus,
          centralizationRisk: 0.55,
        };
        break;
      case 3:
        // 未知
        result[id] = {
          status: 'UNKNOWN' as OathStatus,
        };
        break;
    }
  });
  
  return result;
}

/**
 * Batch check oath status for multiple meme coins
 *
 * @param memeIds - Array of meme coin IDs to check
 * @returns Promise resolving to a map of meme ID to oath data
 *
 * @example
 * ```typescript
 * const results = await checkOathStatus(['id1', 'id2', 'id3']);
 * console.log(results['id1']); // { status: 'OATHED' }
 * ```
 */
export async function checkOathStatus(
  memeIds: string[]
): Promise<Record<string, MemeData>> {
  // Return empty object if no IDs provided
  if (!memeIds || memeIds.length === 0) {
    return {};
  }

  // Remove duplicates
  const uniqueIds = Array.from(new Set(memeIds));
  
  // 如果使用 Mock 数据，直接返回模拟数据
  if (API_CONFIG.useMock) {
    console.log('[Oath Tracker] Using mock data for', uniqueIds.length, 'memes');
    // 模拟网络延迟 - 减少到 500ms 避免重复触发
    await new Promise(resolve => setTimeout(resolve, 500));
    return generateMockData(uniqueIds);
  }

  // 真实 API 请求
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const requestBody: CheckOathRequest = {
      memeIds: uniqueIds,
    };

    const response = await fetch(API_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data: CheckOathResponse = await response.json();

    // Validate response structure
    if (!data || typeof data.data !== 'object') {
      throw new Error('Invalid API response format');
    }

    // Fill in UNKNOWN status for IDs not returned by API
    const result: Record<string, MemeData> = {};
    for (const id of uniqueIds) {
      if (data.data[id]) {
        result[id] = data.data[id];
      } else {
        result[id] = {
        status: 'UNKNOWN' as OathStatus,
      };
      }
    }

    return result;
  } catch (error) {
    console.error('[Oath Tracker] API request failed:', error);

    // Return ERROR status for all requested IDs
    const errorResult: Record<string, MemeData> = {};
    for (const id of uniqueIds) {
      errorResult[id] = {
        status: 'ERROR' as OathStatus,
      };
    }
    return errorResult;
  }
}

/**
 * Update API endpoint configuration
 *
 * @param newEndpoint - New API endpoint URL
 */
export function setApiEndpoint(newEndpoint: string): void {
  API_CONFIG.endpoint = newEndpoint;
}

/**
 * Get current API endpoint
 *
 * @returns Current API endpoint URL
 */
export function getApiEndpoint(): string {
  return API_CONFIG.endpoint;
}

/**
 * Update API timeout configuration
 *
 * @param timeoutMs - New timeout in milliseconds
 */
export function setApiTimeout(timeoutMs: number): void {
  if (timeoutMs > 0) {
    API_CONFIG.timeout = timeoutMs;
  }
}

