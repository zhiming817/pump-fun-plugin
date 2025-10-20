use serde::{Deserialize, Serialize};
use anyhow::{Result, Context};

/// URI 元数据结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UriMetadata {
    pub name: Option<String>,
    pub symbol: Option<String>,
    pub description: Option<String>,
    pub twitter: Option<String>,
    pub telegram: Option<String>,
    pub website: Option<String>,
    #[serde(rename = "showName")]
    pub show_name: Option<bool>,
    pub image: Option<String>,
}

/// 元数据解析服务
pub struct MetadataParserService {
    client: reqwest::Client,
}

impl MetadataParserService {
    /// 创建新的元数据解析服务
    pub fn new() -> Self {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(10))
            .user_agent("PumpFun-Event-Listener/1.0")
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());
        
        Self { client }
    }

    /// 从 URI 获取并解析元数据
    ///
    /// # Arguments
    /// * `uri` - 元数据 JSON 的 URL
    ///
    /// # Returns
    /// * `Result<UriMetadata>` - 成功返回元数据，失败返回错误
    ///
    /// # Example
    /// ```ignore
    /// let service = MetadataParserService::new();
    /// let metadata = service.fetch_metadata("https://metadata.rapidlaunch.io/metadata/xxx.json").await?;
    /// ```
    pub async fn fetch_metadata(&self, uri: &str) -> Result<UriMetadata> {
        println!("📥 正在获取元数据: {}", uri);
        
        // 发送 HTTP GET 请求
        let response = self.client
            .get(uri)
            .send()
            .await
            .context("发送 HTTP 请求失败")?;

        // 检查响应状态
        if !response.status().is_success() {
            anyhow::bail!("HTTP 请求失败: {}", response.status());
        }

        // 解析 JSON 响应
        let metadata: UriMetadata = response
            .json()
            .await
            .context("解析 JSON 失败")?;
        
        println!("✅ 元数据解析成功");
        if let Some(ref twitter) = metadata.twitter {
            println!("  🐦 Twitter: {}", twitter);
        }
        if let Some(ref telegram) = metadata.telegram {
            println!("  💬 Telegram: {}", telegram);
        }
        if let Some(ref website) = metadata.website {
            println!("  🌐 Website: {}", website);
        }
        if let Some(ref image) = metadata.image {
            println!("  🖼️  Image: {}", image);
        }

        Ok(metadata)
    }

    /// 带重试机制的元数据获取
    ///
    /// # Arguments
    /// * `uri` - 元数据 JSON 的 URL
    /// * `max_retries` - 最大重试次数
    ///
    /// # Returns
    /// * `Result<UriMetadata>` - 成功返回元数据，失败返回错误
    pub async fn fetch_metadata_with_retry(
        &self,
        uri: &str,
        max_retries: u32,
    ) -> Result<UriMetadata> {
        let mut attempts = 0;
        let mut last_error = None;

        while attempts < max_retries {
            match self.fetch_metadata(uri).await {
                Ok(metadata) => return Ok(metadata),
                Err(e) => {
                    attempts += 1;
                    last_error = Some(e);
                    
                    if attempts < max_retries {
                        let delay = std::time::Duration::from_secs(2u64.pow(attempts));
                        eprintln!(
                            "⚠️  获取元数据失败（尝试 {}/{}），{}秒后重试...",
                            attempts,
                            max_retries,
                            delay.as_secs()
                        );
                        tokio::time::sleep(delay).await;
                    }
                }
            }
        }

        Err(last_error.unwrap_or_else(|| anyhow::anyhow!("未知错误")))
    }
}

impl Default for MetadataParserService {
    fn default() -> Self {
        Self::new()
    }
}
