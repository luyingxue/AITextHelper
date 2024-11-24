export const API_CONFIG = {
  // API 基础地址
  BASE_URL: 'http://your-api-base-url',

  // API 端点
  ENDPOINTS: {
    // 用于一般文字处理、社科类图书、养老等功能的端点
    WORKFLOW: '/v1/workflows/run',
    // 用于 YouTube Shorts 相关功能的端点
    COMPLETION: '/v1/completion-messages'
  },

  // API 访问令牌
  TOKENS: {
    // 一般文字处理 - 文本纠错
    CORRECTION: 'your-correction-token',

    // 社科类图书 - 视频号文章转公众号
    VIDEO_TO_ARTICLE: 'your-video-to-article-token',

    // 社科类图书 - 标题和摘要
    SUMMARIZE: 'your-summarize-token',

    // 养老 - 养生公众号伪原创
    ELDERLY_ARTICLE: 'your-elderly-article-token',

    // YouTube Shorts - baby show
    BABY_SHOW: 'your-baby-show-token',

    // YouTube Shorts - YouTube Shorts标题和介绍
    SHORTS_DESC: 'your-shorts-desc-token'
  }
}; 