import { useEffect } from 'react';
import { createFileRoute, useLocation, useNavigate } from '@tanstack/react-router';
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
 * returning learners can resume a different lesson they last had open.
 */
function Home() {
  const navigate = useNavigate();
  const hash = useLocation({ select: (location) => location.hash });
  useEffect(() => {
    const lesson = findLesson(loadActiveLessonId() ?? '');
    if (hash || !lesson || lesson.id === FIRST_LESSON.id) return;
    void navigate({
      to: '/lessons/$lessonId',
      params: { lessonId: lesson.id },
      replace: true,
    });
  }, [hash, navigate]);
  return <Workspace lesson={FIRST_LESSON} />;
}
