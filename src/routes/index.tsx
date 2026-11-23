import { useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { FIRST_LESSON, findLesson } from '@/course';
import { loadActiveLessonId } from '@/features/progress/progress';
import { homeHead } from '@/features/seo/seo';
import { Workspace } from '@/features/workspace/Workspace';

export const Route = createFileRoute('/')({
  head: homeHead,
  component: Home,
});

/**
 * The home page is prerendered as the first lesson (with the course's own metadata);
 * in the browser it moves on to the lesson the learner last had open.
 */
function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    const lesson = findLesson(loadActiveLessonId() ?? '') ?? FIRST_LESSON;
    void navigate({
      to: '/lessons/$lessonId',
      params: { lessonId: lesson.id },
      replace: true,
      hash: window.location.hash.slice(1) || undefined,
    });
  }, [navigate]);
  return <Workspace lesson={FIRST_LESSON} />;
}
