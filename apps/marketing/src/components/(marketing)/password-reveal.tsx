'use client';

import { useCopyToClipboard } from '@documenso/lib/client-only/hooks/use-copy-to-clipboard';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type PasswordRevealProps = {
  password: string;
};

export const PasswordReveal = ({ password }: PasswordRevealProps) => {
  const { toast } = useToast();
  const [, copy] = useCopyToClipboard();

  const onCopyClick = () => {
    void copy(password).then(() => {
      toast({
        title: 'Copied to clipboard',
        description: '您的密码已复制到您的剪贴板。',
      });
    });
  };

  return (
    <button
      type="button"
      className="px-2 blur-sm hover:opacity-50 hover:blur-none"
      onClick={onCopyClick}
    >
      {password}
    </button>
  );
};
