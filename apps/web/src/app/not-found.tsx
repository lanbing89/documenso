import Link from 'next/link';

import { getServerComponentSession } from '@documenso/lib/next-auth/get-server-component-session';
import { Button } from '@documenso/ui/primitives/button';

import NotFoundPartial from '~/components/partials/not-found';

export default async function NotFound() {
  const { session } = await getServerComponentSession();

  return (
    <NotFoundPartial>
      {session && (
        <Button className="w-32" asChild>
          <Link href="/documents">文件</Link>
        </Button>
      )}

      {!session && (
        <Button className="w-32" asChild>
          <Link href="/signin">登录</Link>
        </Button>
      )}
    </NotFoundPartial>
  );
}
