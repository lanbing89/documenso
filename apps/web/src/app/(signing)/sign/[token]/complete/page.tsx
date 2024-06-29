import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CheckCircle2, Clock8 } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { env } from 'next-runtime-env';
import { match } from 'ts-pattern';

import signingCelebration from '@documenso/assets/images/signing-celebration.png';
import { getServerComponentSession } from '@documenso/lib/next-auth/get-server-component-session';
import { getDocumentAndSenderByToken } from '@documenso/lib/server-only/document/get-document-by-token';
import { isRecipientAuthorized } from '@documenso/lib/server-only/document/is-recipient-authorized';
import { getFieldsForToken } from '@documenso/lib/server-only/field/get-fields-for-token';
import { getRecipientByToken } from '@documenso/lib/server-only/recipient/get-recipient-by-token';
import { getRecipientSignatures } from '@documenso/lib/server-only/recipient/get-recipient-signatures';
import { DocumentStatus, FieldType, RecipientRole } from '@documenso/prisma/client';
import { DocumentDownloadButton } from '@documenso/ui/components/document/document-download-button';
import { DocumentShareButton } from '@documenso/ui/components/document/document-share-button';
import { SigningCard3D } from '@documenso/ui/components/signing-card';
import { cn } from '@documenso/ui/lib/utils';
import { Badge } from '@documenso/ui/primitives/badge';

import { truncateTitle } from '~/helpers/truncate-title';

import { SigningAuthPageView } from '../signing-auth-page';
import { ClaimAccount } from './claim-account';
import { DocumentPreviewButton } from './document-preview-button';

export type CompletedSigningPageProps = {
  params: {
    token?: string;
  };
};

export default async function CompletedSigningPage({
  params: { token },
}: CompletedSigningPageProps) {
  const NEXT_PUBLIC_DISABLE_SIGNUP = env('NEXT_PUBLIC_DISABLE_SIGNUP');

  if (!token) {
    return notFound();
  }

  const { user } = await getServerComponentSession();

  const document = await getDocumentAndSenderByToken({
    token,
    requireAccessAuth: false,
  }).catch(() => null);

  if (!document || !document.documentData) {
    return notFound();
  }

  const truncatedTitle = truncateTitle(document.title);

  const { documentData } = document;

  const [fields, recipient] = await Promise.all([
    getFieldsForToken({ token }),
    getRecipientByToken({ token }).catch(() => null),
  ]);

  if (!recipient) {
    return notFound();
  }

  const isDocumentAccessValid = await isRecipientAuthorized({
    type: 'ACCESS',
    documentAuthOptions: document.authOptions,
    recipient,
    userId: user?.id,
  });

  if (!isDocumentAccessValid) {
    return <SigningAuthPageView email={recipient.email} />;
  }

  const signatures = await getRecipientSignatures({ recipientId: recipient.id });

  const recipientName =
    recipient.name ||
    fields.find((field) => field.type === FieldType.NAME)?.customText ||
    recipient.email;

  const sessionData = await getServerSession();
  const isLoggedIn = !!sessionData?.user;
  const canSignUp = !isLoggedIn && NEXT_PUBLIC_DISABLE_SIGNUP !== 'true';

  return (
    <div
      className={cn(
        '-mx-4 flex flex-col items-center overflow-x-hidden px-4 pt-24 md:-mx-8 md:px-8 lg:pt-36 xl:pt-44',
        { 'pt-0 lg:pt-0 xl:pt-0': canSignUp },
      )}
    >
      <div
        className={cn('relative mt-6 flex w-full flex-col items-center justify-center', {
          'mt-0 flex-col divide-y overflow-hidden pt-6 md:pt-16 lg:flex-row lg:divide-x lg:divide-y-0 lg:pt-20 xl:pt-24':
            canSignUp,
        })}
      >
        <div
          className={cn('flex flex-col items-center', {
            'mb-8 p-4 md:mb-0 md:p-12': canSignUp,
          })}
        >
          <Badge variant="neutral" size="default" className="mb-6 rounded-xl border bg-transparent">
            {truncatedTitle}
          </Badge>

          {/* Card with recipient */}
          <SigningCard3D
            name={recipientName}
            signature={signatures.at(0)}
            signingCelebrationImage={signingCelebration}
          />

          <h2 className="mt-6 max-w-[35ch] text-center text-2xl font-semibold leading-normal md:text-3xl lg:text-4xl">
            Document
            {recipient.role === RecipientRole.SIGNER && ' Signed '}
            {recipient.role === RecipientRole.VIEWER && ' Viewed '}
            {recipient.role === RecipientRole.APPROVER && ' Approved '}
          </h2>

          {match({ status: document.status, deletedAt: document.deletedAt })
            .with({ status: DocumentStatus.COMPLETED }, () => (
              <div className="text-documenso-700 mt-4 flex items-center text-center">
                <CheckCircle2 className="mr-2 h-5 w-5" />
                <span className="text-sm">已经全部完成签署。</span>
              </div>
            ))
            .with({ deletedAt: null }, () => (
              <div className="mt-4 flex items-center text-center text-blue-600">
                <Clock8 className="mr-2 h-5 w-5" />
                <span className="text-sm">等待其他人签署！</span>
              </div>
            ))
            .otherwise(() => (
              <div className="flex items-center text-center text-red-600">
                <Clock8 className="mr-2 h-5 w-5" />
                <span className="text-sm">该文件不允许签署。</span>
              </div>
            ))}

          {match({ status: document.status, deletedAt: document.deletedAt })
            .with({ status: DocumentStatus.COMPLETED }, () => (
              <p className="text-muted-foreground/60 mt-2.5 max-w-[60ch] text-center text-sm font-medium md:text-base">
                所有人都已经完成签署，签署完的文件将通过电子邮件的形式发送给您。
              </p>
            ))
            .with({ deletedAt: null }, () => (
              <p className="text-muted-foreground/60 mt-2.5 max-w-[60ch] text-center text-sm font-medium md:text-base">
                所有人签署完毕后，将通过电子邮件向您发送。
              </p>
            ))
            .otherwise(() => (
              <p className="text-muted-foreground/60 mt-2.5 max-w-[60ch] text-center text-sm font-medium md:text-base">
                此文件已被发起者取消，不再可供其他人签署。
              </p>
            ))}

          <div className="mt-8 flex w-full max-w-sm items-center justify-center gap-4">
            <DocumentShareButton documentId={document.id} token={recipient.token} />

            {document.status === DocumentStatus.COMPLETED ? (
              <DocumentDownloadButton
                className="flex-1"
                fileName={document.title}
                documentData={documentData}
                disabled={document.status !== DocumentStatus.COMPLETED}
              />
            ) : (
              <DocumentPreviewButton
                className="text-[11px]"
                title="Signatures will appear once the document has been completed"
                documentData={documentData}
              />
            )}
          </div>
        </div>

        {canSignUp && (
          <div className={`flex max-w-xl flex-col items-center justify-center p-4 md:p-12`}>
            <h2 className="mt-8 text-center text-xl font-semibold md:mt-0">
              您也需要在线签署文件?
            </h2>

            <p className="text-muted-foreground/60 mt-4 max-w-[55ch] text-center leading-normal">
              创建您的账户并开始使用最先进的文件签署服务。
            </p>

            <ClaimAccount defaultName={recipientName} defaultEmail={recipient.email} />
          </div>
        )}

        {isLoggedIn && (
          <Link href="/documents" className="text-documenso-700 hover:text-documenso-600 mt-36">
            返回首页
          </Link>
        )}
      </div>
    </div>
  );
}
