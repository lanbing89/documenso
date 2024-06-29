'use client';

import { useState } from 'react';

import { signOut } from 'next-auth/react';

import type { User } from '@documenso/prisma/client';
import { TRPCClientError } from '@documenso/trpc/client';
import { trpc } from '@documenso/trpc/react';
import { Alert, AlertDescription, AlertTitle } from '@documenso/ui/primitives/alert';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';
import { Input } from '@documenso/ui/primitives/input';
import { Label } from '@documenso/ui/primitives/label';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type DeleteAccountDialogProps = {
  className?: string;
  user: User;
};

export const DeleteAccountDialog = ({ className, user }: DeleteAccountDialogProps) => {
  const { toast } = useToast();

  const hasTwoFactorAuthentication = user.twoFactorEnabled;

  const [enteredEmail, setEnteredEmail] = useState<string>('');

  const { mutateAsync: deleteAccount, isLoading: isDeletingAccount } =
    trpc.profile.deleteAccount.useMutation();

  const onDeleteAccount = async () => {
    try {
      await deleteAccount();

      toast({
        title: 'Account deleted',
        description: 'Your account has been deleted successfully.',
        duration: 5000,
      });

      return await signOut({ callbackUrl: '/' });
    } catch (err) {
      if (err instanceof TRPCClientError && err.data?.code === 'BAD_REQUEST') {
        toast({
          title: 'An error occurred',
          description: err.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'An unknown error occurred',
          variant: 'destructive',
          description:
            err.message ??
            'We encountered an unknown error while attempting to delete your account. Please try again later.',
        });
      }
    }
  };

  return (
    <div className={className}>
      <Alert
        className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row "
        variant="neutral"
      >
        <div>
          <AlertTitle>删除账户</AlertTitle>
          <AlertDescription className="mr-2">
            删除您的帐户及其所有内容，包括已完成的文档。此操作是不可逆的，将取消您的订阅，因此请谨慎操作。
          </AlertDescription>
        </div>

        <div className="flex-shrink-0">
          <Dialog onOpenChange={() => setEnteredEmail('')}>
            <DialogTrigger asChild>
              <Button variant="destructive">删除账户</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader className="space-y-4">
                <DialogTitle>删除账户</DialogTitle>

                <Alert variant="destructive">
                  <AlertDescription className="selection:bg-red-100">
                    This action is not reversible. Please be certain.
                  </AlertDescription>
                </Alert>

                {hasTwoFactorAuthentication && (
                  <Alert variant="destructive">
                    <AlertDescription className="selection:bg-red-100">
                      Disable Two Factor Authentication before deleting your account.
                    </AlertDescription>
                  </Alert>
                )}

                <DialogDescription>
                  Documenso will delete <span className="font-semibold">all of your documents</span>
                  , along with all of your completed documents, signatures, and all other resources
                  belonging to your Account.
                </DialogDescription>
              </DialogHeader>

              {!hasTwoFactorAuthentication && (
                <div className="mt-4">
                  <Label>
                    Please type{' '}
                    <span className="text-muted-foreground font-semibold">{user.email}</span> to
                    confirm.
                  </Label>

                  <Input
                    type="text"
                    className="mt-2"
                    aria-label="Confirm Email"
                    value={enteredEmail}
                    onChange={(e) => setEnteredEmail(e.target.value)}
                  />
                </div>
              )}
              <DialogFooter>
                <Button
                  onClick={onDeleteAccount}
                  loading={isDeletingAccount}
                  variant="destructive"
                  disabled={hasTwoFactorAuthentication || enteredEmail !== user.email}
                >
                  {isDeletingAccount ? '账户删除...' : '确认删除？'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Alert>
    </div>
  );
};
