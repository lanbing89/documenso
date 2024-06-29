import { useState } from 'react';

import type { Field } from '@documenso/prisma/client';
import { RecipientRole } from '@documenso/prisma/client';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';

import { SigningDisclosure } from '~/components/general/signing-disclosure';
import { truncateTitle } from '~/helpers/truncate-title';

export type SignDialogProps = {
  isSubmitting: boolean;
  documentTitle: string;
  fields: Field[];
  fieldsValidated: () => void | Promise<void>;
  onSignatureComplete: () => void | Promise<void>;
  role: RecipientRole;
};

export const SignDialog = ({
  isSubmitting,
  documentTitle,
  fields,
  fieldsValidated,
  onSignatureComplete,
  role,
}: SignDialogProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const truncatedTitle = truncateTitle(documentTitle);
  const isComplete = fields.every((field) => field.inserted);

  const handleOpenChange = (open: boolean) => {
    if (isSubmitting || !isComplete) {
      return;
    }

    setShowDialog(open);
  };

  return (
    <Dialog open={showDialog} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="w-full"
          type="button"
          size="lg"
          onClick={fieldsValidated}
          loading={isSubmitting}
        >
          {isComplete ? '完成' : '下一步'}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>
          <div className="text-foreground text-xl font-semibold">
            {role === RecipientRole.VIEWER && '已完成查看'}
            {role === RecipientRole.SIGNER && '已完成签署'}
            {role === RecipientRole.APPROVER && '已完成确认'}
          </div>
        </DialogTitle>

        <div className="text-muted-foreground max-w-[50ch]">
          {role === RecipientRole.VIEWER && (
            <span>
              请确认已完成查看 "{truncatedTitle}".
              <br /> 确定?
            </span>
          )}
          {role === RecipientRole.SIGNER && (
            <span>
              请确认已完成签署 "{truncatedTitle}".
              <br /> 确定?
            </span>
          )}
          {role === RecipientRole.APPROVER && (
            <span>
              请确认已完成确认 "{truncatedTitle}".
              <br /> 确定?
            </span>
          )}
        </div>

        <SigningDisclosure className="mt-4" />

        <DialogFooter>
          <div className="flex w-full flex-1 flex-nowrap gap-4">
            <Button
              type="button"
              className="dark:bg-muted dark:hover:bg-muted/80 flex-1  bg-black/5 hover:bg-black/10"
              variant="secondary"
              onClick={() => {
                setShowDialog(false);
              }}
            >
              取消
            </Button>

            <Button
              type="button"
              className="flex-1"
              disabled={!isComplete}
              loading={isSubmitting}
              onClick={onSignatureComplete}
            >
              {role === RecipientRole.VIEWER && '标记为已查看'}
              {role === RecipientRole.SIGNER && '签署'}
              {role === RecipientRole.APPROVER && '确认'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
