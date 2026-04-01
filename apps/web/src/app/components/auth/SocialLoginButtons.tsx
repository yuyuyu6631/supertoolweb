import { MessageCircleMore, QrCode } from "lucide-react";

interface SocialLoginButtonsProps {
  disabled?: boolean;
}

const items = [
  { key: "qq", label: "QQ 登录", icon: MessageCircleMore },
  { key: "wechat", label: "微信登录", icon: QrCode },
];

export default function SocialLoginButtons({ disabled = false }: SocialLoginButtonsProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              disabled
              aria-disabled="true"
              title="暂未开放"
              className="btn-secondary flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium opacity-60"
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {disabled ? <span className="sr-only">处理中</span> : null}
            </button>
          );
        })}
      </div>
      <p className="text-xs leading-5 text-slate-500">QQ / 微信登录暂未开放，请先使用账号密码登录。</p>
    </div>
  );
}
