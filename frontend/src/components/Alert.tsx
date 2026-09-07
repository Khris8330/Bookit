type Props = {
  type: 'success' | 'error' | 'info' | 'warning';
  children: React.ReactNode;
};

export default function Alert({ type, children }: Props) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}
