import QuizView from '@/components/QuizView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TopicQuizPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12 lg:px-8">
      <QuizView slug={slug} />
    </div>
  );
}
