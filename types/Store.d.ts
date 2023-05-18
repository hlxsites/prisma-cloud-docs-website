/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { FilterPrivate } from "./util";

type BookDescriptor = { title: string; href: string; };

declare class StoreImpl {
  /** Fetched JSON, by filename */
  _json: Record<string, JSONData>;

  /**
   * Current environment
   */
  env: 'dev' | 'preview' | 'publish' | 'prod';

  /**
   * Code-driven page type
   */
  pageTemplate: 'book' | undefined;

  /**
   * Origin that article content is loaded from.
   * Should be empty string in production/cdn.
   * 
   * @note defined when `pageTemplate` is `book`
   */
  docsOrigin: string | undefined;

  /**
   * Path to current doc topic
   * 
   * @note defined when `pageTemplate` is `book`
   */
  docPath: string | undefined;

  /**
   * Main book path for current page.
   * 
   * @note defined when `pageTemplate` is `book`
   */
  bookPath: string | undefined;

  /**
   * Additional books for sidenav.
   * 
   * @note defined when `pageTemplate` is `book`
   */
  additionalBooks: BookDescriptor[] | undefined;

  /**
   * Href to article including origin
   * 
   * @note defined when `pageTemplate` is `book`
   */
  articleHref: string | undefined;

  /**
   * Current book descriptor.
   * Title will be undefined if the additional-books meta list doesn't contain the main book.
   * 
   * @note defined when `pageTemplate` is `book`
   */
  mainBook: BookDescriptor | undefined;

  /**
   * Returns array of link elements representing the books in sidenav.
   * First link is the main book, ie. the book that contains the current chapter/topic.
   * Links 2..N are the additional books, where the `textContent` is the book title and `href` is the href.
   */
  getAllBookLinks(): HTMLLinkElement[];

  /**
   * Fetch some JSON from a path, or from cache.
   * @param path path to workbook
   * @param sheets sheet name(s) to fetch
   */
  fetchJSON: <TData = any>(path: string, sheets?: string | string[]) => Promise<TData>;
}

/**
 * The exposed store API
 */
export type Store = FilterPrivate<StoreImpl>