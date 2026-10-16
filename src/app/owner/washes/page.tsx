import { redirect } from 'next/navigation';

export default function WashesIndexRedirectPage() {
  redirect('/owner/dashboard');
}
