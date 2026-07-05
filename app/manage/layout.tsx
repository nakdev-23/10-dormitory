import { ManageShell } from "@/components/manage/ManageShell";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ManageShell>{children}</ManageShell>;
}
