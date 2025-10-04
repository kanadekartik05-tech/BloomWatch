import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactForm } from './components/contact-form';
import { Github, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="container mx-auto flex max-w-2xl flex-col items-center justify-center py-12 px-4">
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline">Get in Touch</CardTitle>
          <CardDescription>
            Have a question or feedback? Fill out the form below to contact us.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm />
          <div className="mt-8 flex justify-center space-x-6">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Github className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              <Linkedin className="h-6 w-6" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
