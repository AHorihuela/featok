import IdeaSubmissionForm from '@/components/IdeaSubmissionForm';
import { AppMenu } from '@/components/ui/app-menu';

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">
          Submit Your Product Idea
        </h1>
        <p className="text-center mb-8 text-gray-600">
          Share your product idea and get feedback through our simple voting
          system. No account required!
        </p>

        <IdeaSubmissionForm />
        <AppMenu />
      </div>
    </main>
  );
}
