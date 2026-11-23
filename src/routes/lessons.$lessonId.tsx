import { createFileRoute, notFound } from '@tanstack/react-router';
import { findLesson } from '@/course';
import { lessonHead } from '@/features/seo/seo';
import { Workspace } from '@/features/workspace/Workspace';

export const Route = createFileRoute('/lessons/$lessonId')({
  loader: ({ params }) => {
    const lesson = findLesson(params.lessonId);
    if (!lesson) throw notFound();
    return { lessonId: lesson.id };
  },
  head: ({ loaderData }) => (loaderData ? lessonHead(findLesson(loaderData.lessonId)!) : {}),
  component: LessonPage,
});

function LessonPage() {
  const { lessonId } = Route.useLoaderData();
  return <Workspace lesson={findLesson(lessonId)!} />;
}
