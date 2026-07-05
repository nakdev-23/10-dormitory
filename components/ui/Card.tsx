import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  as: Tag = "div",
  interactive,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  interactive?: boolean;
}) {
  return (
    <Tag
      className={cn(
        "rounded-xl border border-border bg-surface shadow-xs",
        interactive &&
          "transition-shadow transition-colors duration-200 hover:shadow-md hover:border-border-strong",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
