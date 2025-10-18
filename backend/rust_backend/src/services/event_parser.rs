use base64::{engine::general_purpose, Engine as _};
use borsh::BorshDeserialize;

use crate::models::{VaultCreatedEvent, CreateEvent, TradeEvent};

/// 事件解析服务
pub struct EventParserService;

impl EventParserService {
    /// 创建新的事件解析服务
    pub fn new() -> Self {
        Self
    }

    /// 从日志行解析事件
    /// 
    /// # Arguments
    /// * `log_line` - 包含 "Program data:" 的日志行
    /// 
    /// # Returns
    /// * `Option<VaultCreatedEvent>` - 解析成功返回事件，否则返回 None
    pub fn parse_from_log(&self, log_line: &str) -> Option<VaultCreatedEvent> {
        // Anchor 事件格式: "Program data: <base64_encoded_data>"
        if !log_line.contains("Program data:") {
            return None;
        }

        // 提取 base64 数据
        let parts: Vec<&str> = log_line.split("Program data: ").collect();
        if parts.len() < 2 {
            return None;
        }

        let base64_data = parts[1].trim();

        // 解码 base64
        match general_purpose::STANDARD.decode(base64_data) {
            Ok(decoded_data) => {
                // Anchor 事件数据格式：前8字节是事件鉴别器，后面是实际数据
                if decoded_data.len() <= 8 {
                    eprintln!("  ⚠️  解码数据太短: {} bytes", decoded_data.len());
                    return None;
                }

                // 跳过前8字节的事件鉴别器
                let event_data = &decoded_data[8..];

                // 使用 Borsh 反序列化
                self.parse_vault_event(event_data)
            }
            Err(e) => {
                eprintln!("  ❌ Base64 解码失败: {}", e);
                None
            }
        }
    }

    /// 解析 VaultCreatedEvent
    /// 
    /// # Arguments
    /// * `data` - 事件数据（已去除鉴别器）
    fn parse_vault_event(&self, data: &[u8]) -> Option<VaultCreatedEvent> {
        match VaultCreatedEvent::try_from_slice(data) {
            Ok(event) => {
                println!("  ✅ 成功解析事件数据!");
                Some(event)
            }
            Err(e) => {
                eprintln!("  ❌ Borsh 反序列化失败: {}", e);
                eprintln!("  数据长度: {} bytes", data.len());
                None
            }
        }
    }

    /// 从日志行解析 CreateEvent
    /// 
    /// # Arguments
    /// * `log_line` - 包含 "Program data:" 的日志行
    /// # Returns
    /// * `Option<CreateEvent>` - 解析成功返回事件，否则返回 None
    pub fn parse_create_event_from_log(&self, log_line: &str) -> Option<CreateEvent> {
        if !log_line.contains("Program data:") {
            return None;
        }
        let parts: Vec<&str> = log_line.split("Program data: ").collect();
        if parts.len() < 2 {
            return None;
        }
        let base64_data = parts[1].trim();
        match general_purpose::STANDARD.decode(base64_data) {
            Ok(decoded_data) => {
                if decoded_data.len() <= 8 {
                    eprintln!("  ⚠️  解码数据太短: {} bytes", decoded_data.len());
                    return None;
                }
                let event_data = &decoded_data[8..];
                match CreateEvent::try_from_slice(event_data) {
                    Ok(event) => {
                        println!("  ✅ 成功解析 CreateEvent 数据!");
                        Some(event)
                    }
                    Err(e) => {
                        eprintln!("  ❌ Borsh 反序列化失败: {}", e);
                        eprintln!("  数据长度: {} bytes", event_data.len());
                        None
                    }
                }
            }
            Err(e) => {
                eprintln!("  ❌ Base64 解码失败: {}", e);
                None
            }
        }
    }

    /// 从日志行解析 TradeEvent
    /// 
    /// # Arguments
    /// * `log_line` - 包含 "Program data:" 的日志行
    /// # Returns
    /// * `Option<TradeEvent>` - 解析成功返回事件，否则返回 None
    pub fn parse_trade_event_from_log(&self, log_line: &str) -> Option<TradeEvent> {
        if !log_line.contains("Program data:") {
            return None;
        }
        let parts: Vec<&str> = log_line.split("Program data: ").collect();
        if parts.len() < 2 {
            return None;
        }
        let base64_data = parts[1].trim();
        match general_purpose::STANDARD.decode(base64_data) {
            Ok(decoded_data) => {
                if decoded_data.len() <= 8 {
                    return None;
                }
                
                // Program data 结构:
                // [8 bytes discriminator] + [TradeEvent data] + [4 bytes string_len] + [string "buy"/"sell"]
                
                // 跳过前 8 字节鉴别器
                let data_start = 8;
                
                // 计算末尾字符串的长度
                // 末尾至少有 4 字节长度 + 字符串内容
                if decoded_data.len() < data_start + 4 {
                    return None;
                }
                
                // 从末尾读取字符串长度（倒数第n字节开始的4字节）
                // 假设字符串长度不超过 20 字节
                let mut string_section_len = 0;
                
                // 尝试从末尾找到字符串长度标记
                for possible_len_offset in (data_start..decoded_data.len()-4).rev() {
                    let str_len = u32::from_le_bytes([
                        decoded_data[possible_len_offset],
                        decoded_data[possible_len_offset + 1],
                        decoded_data[possible_len_offset + 2],
                        decoded_data[possible_len_offset + 3],
                    ]) as usize;
                    
                    // 字符串长度应该是合理的（1-20字节）
                    if str_len > 0 && str_len <= 20 {
                        let expected_str_start = possible_len_offset + 4;
                        let expected_str_end = expected_str_start + str_len;
                        
                        // 检查是否正好到达数据末尾
                        if expected_str_end == decoded_data.len() {
                            // 验证是否是 ASCII 字符串
                            if let Ok(s) = std::str::from_utf8(&decoded_data[expected_str_start..expected_str_end]) {
                                if s == "buy" || s == "sell" {
                                    string_section_len = decoded_data.len() - possible_len_offset;
                                    // println!("  🔍 检测到末尾字符串: '{}' (总长度: {} bytes)", s, string_section_len);
                                    break;
                                }
                            }
                        }
                    }
                }
                
                // 如果没有找到字符串标记，可能这不是 TradeEvent
                if string_section_len == 0 {
                    return None;
                }
                
                // 提取 TradeEvent 数据（跳过前8字节，去掉末尾字符串部分）
                let data_end = decoded_data.len() - string_section_len;
                let event_data = &decoded_data[data_start..data_end];
                
                match TradeEvent::try_from_slice(event_data) {
                    Ok(event) => {
                        println!("  ✅ 成功解析 TradeEvent 数据!");
                        Some(event)
                    }
                    Err(e) => {
                        eprintln!("  ❌ Borsh TradeEvent 反序列化失败: {}", e);
                        eprintln!("  数据长度: {} bytes", event_data.len());
                        None
                    }
                }
            }
            Err(e) => {
                eprintln!("  ❌ Base64 解码失败: {}", e);
                None
            }
        }
    }

    /// 从完整日志数组中查找并解析 TradeEvent
    /// Pump.fun 可能使用不同的事件发出方式
    pub fn parse_trade_event_from_logs(&self, logs: &[String]) -> Option<TradeEvent> {
        // 检查是否是 Buy 或 Sell 指令
        let mut is_trade = false;
        for log in logs {
            if log.contains("Instruction: Buy") || log.contains("Instruction: Sell") {
                is_trade = true;
                break;
            }
        }
        
        if !is_trade {
            return None;
        }
        
        // 在 Anchor 程序中，事件通常在 Program log: 中以特定格式发出
        // 格式可能是: "Program log: <event_name> <base64_data>"
        for log in logs {
            if log.contains("Program log:") && (log.contains("TradeEvent") || log.contains("trade")) {
                // 尝试提取 base64 数据
                if let Some(data_part) = log.split("Program log:").nth(1) {
                    let trimmed = data_part.trim();
                    // 尝试从不同格式中提取
                    if let Some(base64_start) = trimmed.find(char::is_alphanumeric) {
                        let base64_data = &trimmed[base64_start..];
                        if let Ok(decoded) = general_purpose::STANDARD.decode(base64_data) {
                            if decoded.len() > 8 {
                                if let Ok(event) = TradeEvent::try_from_slice(&decoded[8..]) {
                                    println!("  ✅ 从 Program log 成功解析 TradeEvent!");
                                    return Some(event);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        None
    }
}

