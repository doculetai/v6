import { redirect } from 'next/navigation';
import { routes } from '@/config/routes';

export default function JoinPage() {
  redirect(routes.auth.signup);
}
