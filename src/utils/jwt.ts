// src/utils/jwt.ts
/**
 * 解析 JWT 令牌，提取 payload 信息
 * @param token JWT 令牌字符串（必传）
 * @returns payload 解析后的对象（失败则返回 null）
 */
export const parseJwt = (token: string): any => {
    if (!token) {
        console.error('解析 JWT 失败：token 不能为空');
        return null;
    }

    try {
        const base64Url = token.split('.')[1]; // 提取 payload 部分
        if (!base64Url) {
            console.error('JWT 格式错误，无法提取 payload');
            return null;
        }

        // 处理 Base64 URL 编码（替换特殊字符 + 补全填充）
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const paddingLength = 4 - (base64.length % 4 || 4);
        const paddedBase64 = base64 + '='.repeat(paddingLength);

        // 解码为 JSON 对象
        const decodedStr = decodeURIComponent(
            atob(paddedBase64)
                .split('')
                .map(char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(decodedStr);
    } catch (error) {
        console.error('解析 JWT 失败：', error);
        return null;
    }
};

/**
 * 从 token 中提取 userId
 * @param token JWT 令牌字符串（必传）
 * @returns userId（失败则返回 null）
 */
export const getUserIdFromToken = (token: string): string | null => {
    const payload = parseJwt(token);
    // 根据你的 JWT 实际结构调整字段名（如 userId、user_id、sub 等）
    return payload?.userId?.toString() || null;
};