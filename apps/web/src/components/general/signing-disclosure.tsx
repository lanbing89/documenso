import type { HTMLAttributes } from 'react';

import Link from 'next/link';

import { cn } from '@documenso/ui/lib/utils';

export type SigningDisclosureProps = HTMLAttributes<HTMLParagraphElement>;

export const SigningDisclosure = ({ className, ...props }: SigningDisclosureProps) => {
  return (
    <p className={cn('text-muted-foreground text-xs', className)} {...props}>
      我明白电子签名与手写签名具有同样的法律效力。
      <span className="mt-2 block">
        阅读全部{' '}
        <Link
          className="text-documenso-700 underline"
          href="/articles/signature-disclosure"
          target="_blank"
        >
          条款
        </Link>
        .
      </span>
    </p>
  );
};
