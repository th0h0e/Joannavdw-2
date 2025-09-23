import ProjectNavigation from './ProjectNavigation';
import type { Settings } from '../config/pocketbase';

type ProjectIndexProps = {
  projectTitles: string[];
  settingsData?: Settings | null;
};

export default function ProjectIndex({ projectTitles, settingsData = null }: ProjectIndexProps) {
  return (
    <section id="project-index" className="h-dvh w-full snap-center bg-white flex items-center justify-center">
      <ProjectNavigation projectTitles={projectTitles} settingsData={settingsData} />
    </section>
  );
}