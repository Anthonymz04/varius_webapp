'use client';

import { Fragment, ReactNode } from 'react';

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**') && p.length > 4) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) {
      return <em key={i}>{p.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export default function FormattedText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushList = (key: number) => {
    if (!list) return key;
    const items = list.items;
    if (list.ordered) {
      blocks.push(
        <ol key={key}>
          {items.map((it, k) => (
            <li key={k}>{renderInline(it)}</li>
          ))}
        </ol>
      );
    } else {
      blocks.push(
        <ul key={key}>
          {items.map((it, k) => (
            <li key={k}>{renderInline(it)}</li>
          ))}
        </ul>
      );
    }
    list = null;
    return key + 1;
  };

  let key = 0;
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) {
      key = flushList(key);
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      key = flushList(key);
      const level = heading[1].length;
      const content = renderInline(heading[2]);
      if (level === 1) blocks.push(<h3 key={key} className="msg-h">{content}</h3>);
      else if (level === 2) blocks.push(<h4 key={key} className="msg-h">{content}</h4>);
      else blocks.push(<h5 key={key} className="msg-h">{content}</h5>);
      key += 1;
      continue;
    }
    const bullet = line.match(/^[-•*]\s+(.*)$/);
    const ordered = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || ordered) {
      if (!list || list.ordered !== Boolean(ordered)) {
        key = flushList(key);
        list = { ordered: Boolean(ordered), items: [] };
      }
      list.items.push(bullet ? bullet[1] : ordered![1]);
    } else {
      key = flushList(key);
      blocks.push(<p key={key}>{renderInline(line)}</p>);
      key += 1;
    }
  }
  key = flushList(key);

  return <>{blocks}</>;
}
