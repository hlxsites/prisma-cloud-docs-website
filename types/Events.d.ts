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

import { ArticleInfo, ArticleResponse } from "./Article";
import { BookDefinition } from "./Book";

export interface EventMap {
  "load:search": void;
  "delayed:loaded": void;
  "book:loaded": BookDefinition;
  "article:fetched": ArticleResponse;
  "article:loaded": ArticleInfo;
  "header:loaded": void;
  "blocks:loaded": void;
  "spa:navigate:article": ArticleResponse & {
    docHref: string;
    siteHref: string;
  };
}

export type AnyEventType = keyof EventMap;

export type EventHandler<T extends AnyEventType> = (
  data: EventMap[T]
) => unknown | Promise<unknown>;

export type OffEventFn = () => void;
