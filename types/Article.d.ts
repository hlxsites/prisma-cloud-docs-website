export interface ArticleInfo {
  /**
   * Last modified date of the article
   */
  lastModified: Date;

  /**
   * Article title
   */
  title: string;
}

export interface ArticleResponse {
  ok: boolean;
  status: number;
  html: string;
  info: ArticleInfo;
  source: 'adoc' | 'gdoc';
}