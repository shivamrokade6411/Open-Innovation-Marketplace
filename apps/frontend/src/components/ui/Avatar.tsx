/*
 * Purpose: Avatar primitive.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { ImgHTMLAttributes } from 'react';

export function Avatar(props: ImgHTMLAttributes<HTMLImageElement>): JSX.Element {
  return <img className="h-10 w-10 rounded-full object-cover" alt={props.alt ?? 'Avatar'} {...props} />;
}
